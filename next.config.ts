import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ignora erros do ESLint durante o build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignora erros do TypeScript durante o build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
