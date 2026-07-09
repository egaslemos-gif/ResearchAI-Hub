import "server-only";
import fs from "node:fs";
import path from "node:path";

/**
 * Localiza a raiz do repositório (onde vivem os activos Content-First),
 * subindo a partir do cwd até encontrar as pastas `protocols/` e `tools/`.
 * Funciona quer o processo corra em website/ (next dev) quer na raiz.
 */
export function repoRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 8; i++) {
    if (
      fs.existsSync(path.join(dir, "protocols")) &&
      fs.existsSync(path.join(dir, "tools")) &&
      fs.existsSync(path.join(dir, "prompts"))
    ) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

export const ASSET_DIRS = {
  protocols: (root: string) => path.join(root, "protocols"),
  tools: (root: string) => path.join(root, "tools"),
  prompts: (root: string) => path.join(root, "prompts"),
};
