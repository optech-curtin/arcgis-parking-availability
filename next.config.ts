import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@arcgis/core'],
  output: 'export',
  trailingSlash: true,
  basePath: process.env.NODE_ENV === 'production' ? '/arcgis-parking-availability' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/arcgis-parking-availability' : '',
  images: {
    unoptimized: true
  }
};

export default nextConfig;
