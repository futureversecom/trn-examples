/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@trne/ui-utils"],
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil",
      chalk: "commonjs chalk",
    });
    return config;
  },
};

module.exports = nextConfig;
