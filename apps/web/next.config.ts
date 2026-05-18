import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";

const nextConfig: NextConfig = {
  transpilePackages: ["@ganatrack/shared-types"],
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    // Suppress "Critical dependency" warnings from browserslist (via Serwist).
    // browserslist/node.js uses dynamic require which webpack cannot statically analyze.
    // This is a known issue with no upstream fix yet.
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /browserslist\/node\.js/,
        message: /Critical dependency/,
      },
    ];

    return config;
  },
};

export default withSerwist(nextConfig);
