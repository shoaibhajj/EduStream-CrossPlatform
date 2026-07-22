import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@edustream/shared-types", "@edustream/shared-utils"]
};

export default nextConfig;
