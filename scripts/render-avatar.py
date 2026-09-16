"""
Render a Ready Player Me .glb to a square portrait PNG for `WorkerAvatar`.

Run headlessly:
  /Applications/Blender.app/Contents/MacOS/Blender --background --python \
      scripts/render-avatar.py -- <input.glb> <output.png> [size] [head|body]

Three modes. `head` (the default) is the square, circle-cropped portrait
`WorkerAvatar` shows at 22-52px. `body` is a 2:3 standing figure, where a whole
person makes "hire a worker" concrete in a way a head-and-shoulders crop does
not. `export` writes a .glb rather than a PNG, for the live model in the
browser: the pose is baked in as the rest pose and the parts that are invisible
at card size are deleted, because otherwise the arms ship as a literal T and
the file carries six meshes and their textures for nothing.

Framing is derived from the AvatarHead mesh's world-space bounding box, not the
whole model. An RPM export is a full body with its origin at the feet, so
framing the model bbox yields a full-body shot with an unreadably small head.

The output is transparent RGBA. `WorkerAvatar` renders the image with no disc
behind it, so an opaque background would show as a square behind the circular
crop.

HEAD_FRAC leaves headroom deliberately: the consumer circle-crops a square with
`object-cover`, so the corners are discarded and a tightly-framed skull loses
its crown.
"""

import sys
import bpy
from mathutils import Vector

# --- args after the `--` separator ----------------------------------------
argv = sys.argv[sys.argv.index("--") + 1:]
if len(argv) < 2:
    raise SystemExit(
        "usage: render-avatar.py -- <input.glb> <output.png> [size] [head|body]")
glb_path, out_path = argv[0], argv[1]
size = int(argv[2]) if len(argv) > 2 else 512
mode = argv[3] if len(argv) > 3 else "head"
if mode not in ("head", "body", "export"):
    raise SystemExit(f"mode must be 'head', 'body' or 'export', got {mode!r}")

# Fraction of frame height the subject should occupy.
#
# `head` is tuned against the circular crop rather than the square: the corners
# are discarded, so the head reads larger in the final circle than the fraction
# suggests.
#
# `body` leaves a clear margin so the figure is not flush with the edges.
FRAC = {"head": 0.82, "body": 0.88}

# --- clean slate ----------------------------------------------------------
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb_path)
scene = bpy.context.scene

# --- drop the arms out of T-pose -----------------------------------------
# An RPM export is a literal T: the arm bones run straight out along world X.
# Left alone it reads as a mannequin, and in a head crop the arms cut across
# the lower circle.
#
# Rotating in each bone's own space is what keeps the mesh intact. The upper
# arm is one bone, but the forearm is a chain of twist bones
# (ForeArm -> ForeArm1 -> ForeArm2 -> Hand); rotating only the first shears the
# geometry and detaches the hand, so the swing goes on the shoulder and upper
# arm and the forearm chain is left at rest to follow along.
arm_obj = next((o for o in scene.objects if o.type == "ARMATURE"), None)
if arm_obj is not None:
    from mathutils import Quaternion

    # Local +X on the arm bones is what swings them down, the same sign on both
    # sides: each bone's local frame already accounts for its side. Determined
    # by measuring wrist height across candidate axes rather than assumed --
    # rotating about Z, the intuitive guess for a T-pose, barely moves the
    # wrist at all (1.437 -> 1.452) while +X takes it to 0.938.
    SWING = 1.28      # radians, ~73 deg down from horizontal
    SHOULDER = 0.14   # a slight drop so the deltoid does not bulge

    for side in ("Left", "Right"):
        for bname, ang in ((f"{side}Shoulder", SHOULDER), (f"{side}Arm", SWING)):
            pb = arm_obj.pose.bones.get(bname)
            if pb is None:
                continue
            pb.rotation_mode = "QUATERNION"
            pb.rotation_quaternion = Quaternion((1.0, 0.0, 0.0), ang)

    # Bounding boxes below are read from evaluated geometry, so the pose has to
    # be baked into the depsgraph before anything measures it.
    bpy.context.view_layer.update()

# --- export a posed, stripped .glb ---------------------------------------
if mode == "export":
    # Bake the pose into the vertex data and ship a static mesh.
    #
    # `pose.armature_apply` alone is not enough: it rewrites the rest pose, but a skinned
    # glTF also carries inverse bind matrices describing the original bind pose, and
    # three.js uses those — so the node rotations say "arms down" while the skin still
    # resolves to the T. Applying the armature modifier per mesh resolves the deformation
    # into the vertices themselves, and then the skeleton is not needed at all.
    #
    # Nothing here is animated, so a static mesh loses nothing and avoids shipping 73
    # joints and their matrices.
    if arm_obj is None:
        raise SystemExit("no armature to bake a pose into")

    # Dropped because none of it resolves on a 140px-wide figure while each part drags
    # its own textures into the download. The eyeballs stay: they are small but they are
    # what makes a face read as a person rather than a mannequin, which is the whole
    # point of putting a worker on the card. The corneas are the clear lenses over them
    # and the teeth sit behind a closed mouth, so both go.
    DROP = (
        "AvatarLeftCornea", "AvatarRightCornea",
        "AvatarTeethUpper", "AvatarTeethLower",
        "Icosphere",
    )
    for o in [o for o in scene.objects if o.name in DROP]:
        bpy.data.objects.remove(o, do_unlink=True)

    bpy.ops.object.select_all(action="DESELECT")
    for o in [o for o in scene.objects if o.type == "MESH"]:
        bpy.context.view_layer.objects.active = o
        # RPM ships facial blendshapes as shape keys, and a modifier cannot be applied
        # over them. Nothing drives them here -- there is no face animation -- so they
        # are dropped rather than preserved.
        if o.data.shape_keys:
            o.shape_key_clear()
        for m in list(o.modifiers):
            if m.type == "ARMATURE":
                # Applying the modifier freezes the current pose into the mesh.
                bpy.ops.object.modifier_apply(modifier=m.name)

    # The armature has done its job; without it the export carries no skin.
    bpy.data.objects.remove(arm_obj, do_unlink=True)

    bpy.ops.object.select_all(action="DESELECT")
    bpy.ops.export_scene.gltf(
        filepath=out_path,
        export_format="GLB",
        export_skins=False,
        export_animations=False,
        export_materials="EXPORT",
    )
    kept = sorted(o.name for o in scene.objects if o.type == "MESH")
    print(f"[render-avatar] mode=export meshes={len(kept)} {kept} -> {out_path}")
    raise SystemExit(0)

# --- locate the framing target -------------------------------------------
head = next((o for o in scene.objects if o.name.startswith("AvatarHead")), None)
if head is None:
    raise SystemExit("no AvatarHead object; is this a Ready Player Me export?")

if mode == "head":
    targets = [head]
else:
    # The avatar's own meshes only, so the frame covers the figure from hair to
    # shoes. RPM names every part `Avatar*` plus `outfit`; an export may also
    # carry unrelated geometry (this one ships an Icosphere spanning z -1..+1)
    # which would otherwise drag the bounds far below the feet.
    targets = [o for o in scene.objects
               if o.type == "MESH"
               and (o.name.startswith("Avatar") or o.name.startswith("outfit"))]
    if not targets:
        raise SystemExit("no Avatar*/outfit meshes found")

dg = bpy.context.evaluated_depsgraph_get()
corners = []
for o in targets:
    oe = o.evaluated_get(dg)
    corners += [oe.matrix_world @ Vector(c) for c in oe.bound_box]
lo = Vector((min(c.x for c in corners), min(c.y for c in corners), min(c.z for c in corners)))
hi = Vector((max(c.x for c in corners), max(c.y for c in corners), max(c.z for c in corners)))
center = (lo + hi) / 2
subject_h = hi.z - lo.z

# --- camera ---------------------------------------------------------------
# An imported glb carries no camera. RPM faces -Y, so the camera sits on -Y
# looking back toward +Y at the head's centre.
cam_data = bpy.data.cameras.new("PortraitCam")
# 85mm for a head (minimal facial distortion); wider for a full body so the
# camera does not have to stand implausibly far back.
cam_data.lens = 85 if mode == "head" else 50
cam = bpy.data.objects.new("PortraitCam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam

# Distance so the head fills HEAD_FRAC of the sensor's vertical extent.
import math
fov_v = 2 * math.atan((cam_data.sensor_height / 2) / cam_data.lens)
dist = (subject_h / FRAC[mode] / 2) / math.tan(fov_v / 2)

# Head crops aim slightly low so the face lands on the circle's centre line;
# a full body is framed on its true centre.
aim_z = center.z - subject_h * (0.16 if mode == "head" else 0.0)
aim_z_center = Vector((center.x, center.y, aim_z))
cam.location = (center.x, center.y - dist, aim_z)
cam.rotation_euler = (math.radians(90), 0, 0)  # level, facing +Y

# --- lighting -------------------------------------------------------------
# Also absent from a glb. Three-point-ish: a soft key, a fill, and a rim to
# separate hair from the transparent background.
# Light positions and energies are expressed for a head-sized subject; a full
# body is ~5x taller, so distances scale with it and energy with the square of
# that (inverse-square falloff).
L = 1.0 if mode == "head" else subject_h / 0.33
E = L ** 2

def add_area(name, offset, energy, rot, sz):
    d = bpy.data.lights.new(name, type="AREA")
    d.energy, d.size = energy * E, sz * L
    o = bpy.data.objects.new(name, d)
    o.location = (aim_z_center.x + offset[0] * L,
                  aim_z_center.y + offset[1] * L,
                  aim_z_center.z + offset[2] * L)
    o.rotation_euler = rot
    scene.collection.objects.link(o)

add_area("Key",  (-0.45, -0.7,  0.35), 12, (math.radians(65), 0, math.radians(-32)), 1.1)
add_area("Fill", ( 0.55, -0.6,  0.0 ),  5, (math.radians(85), 0, math.radians(38)),  1.4)
add_area("Rim",  ( 0.0,    0.65, 0.5 ), 22, (math.radians(-55), 0, 0),                 1.0)
add_area("RimL", (-0.6,    0.35, -0.1), 14, (math.radians(-70), 0, math.radians(-55)), 0.9)
add_area("RimR", ( 0.6,    0.35, -0.1), 14, (math.radians(-70), 0, math.radians(55)),  0.9)

# --- render settings ------------------------------------------------------
scene.render.engine = "CYCLES"
# EEVEE needs a GL context in --background and fails or renders black on macOS.
# Cycles CPU is deterministic here, and correctly resolves the cornea BLEND
# materials that EEVEE tends to flatten into a grey film over the eyes.
scene.cycles.device = "CPU"
scene.cycles.samples = 128
scene.cycles.use_denoising = True

if mode == "head":
    scene.render.resolution_x = scene.render.resolution_y = size
else:
    # 2:3 portrait. A standing figure in a square frame wastes most of the
    # width, and the hire page shows these as tall cards.
    scene.render.resolution_x = size
    scene.render.resolution_y = int(size * 1.5)
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"

# Blender's default AgX view transform desaturates and darkens the RPM
# textures; 'Standard' keeps them matching the source albedo.
scene.view_settings.view_transform = "Standard"
scene.view_settings.exposure = -0.35

scene.render.filepath = out_path
bpy.ops.render.render(write_still=True)
print(f"[render-avatar] mode={mode} subject_h={subject_h:.3f} dist={dist:.3f} -> {out_path}")
