import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Os activos Content-First vivem na raiz do repositório (um nível acima de website/).
  // O carregamento é feito por Server Components via filesystem (ver lib/content.ts),
  // por isso o tracing precisa de incluir a raiz do monorepo.
  outputFileTracingRoot: repoRoot,
};

export default nextConfig;
