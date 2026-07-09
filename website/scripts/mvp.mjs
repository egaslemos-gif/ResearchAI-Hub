// Evidência das 3 recomendações de UX (MVP Completion).
import { chromium } from "playwright-core";
import path from "node:path";
import fs from "node:fs";

const BASE = process.argv[2] || "http://localhost:3210";
const OUT = process.argv[3] || path.join(process.cwd(), ".evidence", "mvp-completion");
const EXE = path.join(process.env.LOCALAPPDATA, "ms-playwright", "chromium-1228", "chrome-win64", "chrome.exe");
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: EXE });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2, colorScheme: "light" });
const page = await ctx.newPage();
const go = async (url) => { await page.goto(BASE + url, { waitUntil: "load", timeout: 20000 }); await page.waitForTimeout(500); };
const shot = async (name) => { await page.screenshot({ path: path.join(OUT, name + ".png"), fullPage: true }); console.log("✓", name); };

// Passo 1 no início: mostra "faltam ~Xmin" (Rec 1), frase-guia (Rec 2), painel vazio (Rec 3)
await go("/competencias/revisao-da-literatura/passo/1");
await shot("01-passo1-inicio");

// avançar 3 passos → acumula progresso e evidência
for (let i = 0; i < 3; i++) {
  await page.getByRole("button", { name: /Concluir e avançar/ }).click();
  await page.waitForTimeout(800);
}
// Passo 4: tempo em falta reduzido + painel "O que já produziste" com 3 itens
await shot("02-passo4-recomendacoes");

await ctx.close();
await browser.close();
console.log("\nScreenshots em:", OUT);
