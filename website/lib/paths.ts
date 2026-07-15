import "server-only";
import fs from "node:fs";
import path from "node:path";

/**
 * Localiza a raiz do repositório (onde vivem os activos Content-First),
 * subindo a partir do cwd até encontrar as pastas `protocols/` e `tools/`.
 * Funciona quer o processo corra em website/ (next dev) quer na raiz.
 */
export function repoRoot(): string {
  const cwd = process.cwd();
  
  // 1. Check local .assets (used in Vercel build)
  if (
    fs.existsSync(path.join(cwd, ".assets", "protocols")) &&
    fs.existsSync(path.join(cwd, ".assets", "tools"))
  ) {
    return path.join(cwd, ".assets");
  }

  // 2. Try parent of cwd (Standard Next.js execution where cwd is 'website/')
  const parentOfCwd = path.join(cwd, "..");
  if (
    fs.existsSync(path.join(parentOfCwd, "protocols")) &&
    fs.existsSync(path.join(parentOfCwd, "tools"))
  ) {
    return parentOfCwd;
  }

  // 3. Try cwd itself (If execution is happening from the monorepo root)
  if (
    fs.existsSync(path.join(cwd, "protocols")) &&
    fs.existsSync(path.join(cwd, "tools"))
  ) {
    return cwd;
  }

  // 4. Fallback to searching upwards up to 8 levels (deeply nested scripts)
  let dir = cwd;
  for (let i = 0; i < 8; i++) {
    if (
      fs.existsSync(path.join(dir, "protocols")) &&
      fs.existsSync(path.join(dir, "tools"))
    ) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  
  // Default fallback
  return parentOfCwd;
}

export const ASSET_DIRS = {
  protocols: (root: string) => path.join(root, "protocols"),
  tools: (root: string) => path.join(root, "tools"),
  prompts: (root: string) => path.join(root, "prompts"),
};
