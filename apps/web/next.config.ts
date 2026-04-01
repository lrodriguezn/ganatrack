import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ganatrack/shared-types"],
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
