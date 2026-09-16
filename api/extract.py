"""Read an invoice PDF and pull out its labelled fields.

A Vercel Python Function. POST JSON {fileBase64, mimeType} or {textContent, mimeType};
returns {success, data} or {success: false, error}.

Adapted from the Rare² Invoice Processor's python/extract.py. Two deliberate changes:

  * Self-contained. The original imported normalise_space and decimal_value from a legacy
    helper module; both are short and are inlined below, so this function has exactly one
    dependency (pdfplumber) and no sibling-module import to get wrong at deploy time.
  * HTTP rather than stdin/stdout. The original was spawned as a subprocess with
    PYTHON_EXECUTABLE, which does not port to Vercel. The extraction rules are unchanged.

Nothing is retained: the PDF is read from the request body, parsed in memory, and dropped.
"""

import base64
import hashlib
import io
import json
import re
from datetime import datetime, timedelta
from decimal import Decimal, InvalidOperation
from http.server import BaseHTTPRequestHandler

# Vercel caps a function's request body at 4.5MB; the client rejects anything larger
# before it gets here, and this is the backstop for a request that arrives anyway.
MAX_BODY_BYTES = 4 * 1024 * 1024
MAX_TEXT_CHARS = 200_000
MAX_PAGES = 30


def normalise_space(value):
    return " ".join((value or "").split())


def decimal_value(value):
    if not value:
        return None
    cleaned = re.sub(r"[^\d.\-+]", "", value.replace(",", ""))
    if not cleaned:
        return None
    try:
        return Decimal(cleaned)
    except InvalidOperation:
        return None


def extract(text):
    """Pull labelled fields out of invoice text. Unreadable fields stay blank and are
    named in reviewReasons rather than guessed at — a wrong total read confidently is
    worse than one the client is asked to check."""
    reasons = ["Check extracted fields against the original invoice before approval"]

    aliases = {
        r"Invoice reference": "Invoice Number",
        r"Issued(?: on)?": "Invoice Date",
        r"Payment requested by": "Due Date",
        r"VAT registration(?: number)?": "VAT Number",
    }
    for alias, label in aliases.items():
        text = re.sub(
            rf"^{alias}(?:[ \t]*:[ \t]*|[ \t]+)(\S[^\n]*)$",
            lambda match: label + ": " + match.group(1),
            text,
            flags=re.I | re.M,
        )

    def field(labels):
        values = [
            normalise_space(v)
            for v in re.findall(rf"^(?:{labels})[ \t]*[:#][ \t]*(.+)$", text, re.I | re.M)
        ]
        if len(set(values)) > 1:
            reasons.append(f'Conflicting values for {labels.split("|")[0]}')
            return ""
        return values[0] if values else ""

    def date(value, name):
        if not value:
            return ""
        if re.fullmatch(r"\d{1,2}/\d{1,2}/\d{4}", value):
            a, b, _ = map(int, value.split("/"))
            if a <= 12 and b <= 12 and a != b:
                reasons.append(f"Ambiguous {name}: {value}; enter an ISO date")
                return ""
        for fmt in ("%Y-%m-%d", "%d %b %Y", "%d %B %Y", "%b %d %Y", "%d/%m/%Y"):
            try:
                return datetime.strptime(value, fmt).date().isoformat()
            except ValueError:
                pass
        reasons.append(f"Unrecognised {name}: {value}")
        return ""

    def money(labels):
        value = field(labels)
        if not re.fullmatch(
            r"(?:(?:GBP|USD|CAD|AUD|NZD)\s*)?[£$]?\s*-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?",
            value,
        ):
            return None
        amount = decimal_value(re.sub(r"^(?:GBP|USD|CAD|AUD|NZD)\s*", "", value))
        if amount is None or not amount.is_finite() or abs(amount) > Decimal("1000000000"):
            return None
        return amount

    invoice_date = date(field(r"Invoice Date|Date"), "invoice date")
    due_raw = field(r"Due Date|Payment Due|Due")
    due_date = date(due_raw, "due date")
    terms = field(r"Payment Terms|Terms")
    net_days = re.fullmatch(r"Net\s+(\d{1,3})", terms, re.I)
    if not due_raw and net_days and invoice_date:
        due_date = (
            datetime.fromisoformat(invoice_date) + timedelta(days=int(net_days[1]))
        ).date().isoformat()
        reasons.append(f"Due date calculated from {terms}; confirm payment terms")

    net = money(r"Net Amount|Net|Subtotal|Sub Total")
    tax = money(r"VAT Amount|Tax Amount|VAT(?:\s*\(\d+(?:\.\d+)?%\))?|Tax")
    total = money(r"Total Amount Due|Total Due|Total Amount|Grand Total|Total")
    shipping = money(r"Shipping|Freight") if field(r"Shipping|Freight") else Decimal("0")
    discount_label = r"Discount(?:\s*\(\d+(?:\.\d+)?%\))?"
    discount = money(discount_label) if field(discount_label) else Decimal("0")

    if None not in (net, tax, total, shipping, discount) and abs(
        net + tax + shipping - discount - total
    ) > Decimal("0.01"):
        reasons.append("Net plus tax plus shipping minus discount does not equal total")

    currency = field("Currency").upper()
    if not currency and "£" in text and "$" not in text:
        currency = "GBP"
    if not currency and "$" in text:
        reasons.append("Dollar symbol found: confirm the currency")

    supplier = field(r"Supplier Name|Supplier|From")
    supplier_address = field(r"Supplier Address")

    # Conservative letterhead fallback: a single name immediately above INVOICE, with a
    # postal address and VAT label before the explicitly marked buyer. Uncertain layouts
    # stay blank rather than mistaking the customer for the supplier.
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    if not supplier and not re.search(
        r"^(?:Supplier Name|Supplier|From)\s*:", text, re.I | re.M
    ):
        if len(lines) > 2 and lines[1].upper() == "INVOICE":
            name = lines[0]
            buyer_index = next(
                (
                    i
                    for i, line in enumerate(lines[2:20], 2)
                    if re.match(r"^(?:Bill to|Customer|Sold to)\s*:", line, re.I)
                ),
                None,
            )
            if buyer_index is not None:
                header = lines[2:buyer_index]
                addresses = [
                    line
                    for line in header
                    if re.search(r"\b[A-Z]{1,2}\d[A-Z\d]?\s+\d[A-Z]{2}\b", line, re.I)
                    and ":" not in line
                ]
                vat_present = any(
                    re.match(r"^VAT Number\s*:", line, re.I) for line in header
                )
                if (
                    len(addresses) == 1
                    and vat_present
                    and 2 <= len(name) <= 100
                    and re.fullmatch(r"[A-Za-z][A-Za-z &.'()-]+", name)
                    and not re.search(
                        r"\b(invoice|customer|bill to|statement|receipt)\b", name, re.I
                    )
                ):
                    supplier = name
                    supplier_address = supplier_address or addresses[0]
                    reasons.append(
                        "Supplier details inferred from letterhead; confirm against the original"
                    )

    data = dict(
        supplierName=supplier,
        supplierVat=field(r"VAT (?:Number|No\.?|Reg)|Tax ID"),
        supplierAddress=supplier_address,
        invoiceNumber=field(r"Invoice Number|Invoice No\.?|Invoice"),
        invoiceDate=invoice_date,
        dueDate=due_date,
        currency=currency,
        netAmount=float(net) if net is not None else None,
        taxAmount=float(tax) if tax is not None else None,
        totalAmount=float(total) if total is not None else None,
        reviewReasons=reasons,
    )

    for name in (
        "supplierName",
        "invoiceNumber",
        "invoiceDate",
        "dueDate",
        "currency",
        "netAmount",
        "taxAmount",
        "totalAmount",
    ):
        if data[name] is None or data[name] == "":
            reasons.append(f"Missing or unsupported field: {name}")

    return data


def pdf_text(content):
    import pdfplumber

    with pdfplumber.open(io.BytesIO(content)) as pdf:
        if not 1 <= len(pdf.pages) <= MAX_PAGES:
            raise ValueError(f"Upload a PDF with 1–{MAX_PAGES} pages")
        return "\n".join(page.extract_text() or "" for page in pdf.pages)


def process(request):
    mime = request.get("mimeType", "")
    if mime.startswith("text/"):
        text = request.get("textContent") or ""
        content = text.encode("utf-8")
    else:
        content = base64.b64decode(request["fileBase64"], validate=True)
        if not content.startswith(b"%PDF-"):
            raise ValueError("That file is not a PDF")
        text = pdf_text(content)

    if not text.strip():
        raise ValueError(
            "No readable text found. Scanned PDFs need OCR — upload a text-based PDF"
        )
    if len(text) > MAX_TEXT_CHARS:
        raise ValueError("That invoice is longer than this can process")

    data = extract(text)
    data["sourceHash"] = hashlib.sha256(content).hexdigest()
    return dict(success=True, data=data, processingEngine="python_rules")


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length") or 0)
            if length > MAX_BODY_BYTES:
                raise ValueError("That file is too large — upload one under 4MB")
            result = process(json.loads(self.rfile.read(length) or b"{}"))
            status = 200
        except (ValueError, KeyError) as error:
            result, status = dict(success=False, error=str(error)), 400
        except Exception:
            result, status = (
                dict(success=False, error="That PDF could not be read. Check the file."),
                500,
            )

        body = json.dumps(result, ensure_ascii=True, allow_nan=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
