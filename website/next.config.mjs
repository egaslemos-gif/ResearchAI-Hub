import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    outputFileTracingIncludes: {
      '/**/*': ['../protocols/**/*', '../tools/**/*', '../prompts/**/*', '../assets/**/*'],
    },
  },
};

export default nextConfig;
