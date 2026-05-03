import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["ws", "@solana-program/memo", "@solana-program/system", "@privy-io/react-auth", "why-is-node-running"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.privy.io; connect-src 'self' https: wss:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: https: blob:; frame-src 'self' https://*.privy.io;" },
        ],
      },
    ];
  },
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
    config.externals.push("pino-pretty", "lokijs", "encoding", "why-is-node-running");
    return config;
  },
};

export default nextConfig;
