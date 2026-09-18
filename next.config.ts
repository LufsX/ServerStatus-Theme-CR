import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  images: { unoptimized: true },
  reactStrictMode: false,
  trailingSlash: true,
  allowedDevOrigins: ["10.2.1.99"],
};

export default nextConfig;
