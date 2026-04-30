import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["ws"],
  // @solana/kit-plugin-payer's browser bundle has a spurious `import 'fs'`
  // from the payerFromFile export. Stub it out for the client bundle.
  turbopack: {
    resolveAlias: {
      fs: { browser: "./empty-module.js" },
      net: { browser: "./empty-module.js" },
      tls: { browser: "./empty-module.js" },
      crypto: { browser: "./empty-module.js" },
      os: { browser: "./empty-module.js" },
      "pino-pretty": { browser: "./empty-module.js" },
      "why-is-node-running": { browser: "./empty-module.js" },
      "lokijs": { browser: "./empty-module.js" },
      "encoding": { browser: "./empty-module.js" },
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { 
        ...config.resolve.fallback, 
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        os: false,
        "pino-pretty": false,
        "why-is-node-running": false,
        "lokijs": false,
        "encoding": false,
      };
    }
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

export default nextConfig;
