"use client";

import { useEffect, useState } from "react";
import { account } from "@/lib/data";

function timeOfDayGreeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/**
 * "Good morning, Alex" in place of a plain page title.
 *
 * Reads the viewer's own clock, which the server has no way to know — a build-time or
 * request-time guess would freeze on whatever hour it happened to render at, wrong for
 * most visits. Starts on a neutral "Welcome back" and swaps in the timed greeting once
 * mounted, the same one-time external-read pattern the portal already uses for restoring
 * state from localStorage.
 */
export function Greeting() {
  const firstName = account.name.split(" ")[0];
  const [salutation, setSalutation] = useState("Welcome back");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the viewer's local clock, unknowable on the server
    setSalutation(timeOfDayGreeting(new Date().getHours()));
  }, []);

  return (
    <>
      {salutation}, {firstName}
    </>
  );
}
