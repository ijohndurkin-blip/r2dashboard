import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * The dev indicator sits bottom-left, exactly where the sidebar's notification and
   * account controls live, and intercepts clicks on them during development. It is
   * dev-only chrome and never ships, so turn it off to keep that corner usable.
   */
  devIndicators: false,
};

export default nextConfig;
