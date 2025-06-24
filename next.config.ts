import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@arcgis/core'],
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
