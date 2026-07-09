// Verifica que NÃO há inglês no TEXTO VISÍVEL (innerText) + captura evidências finais.
import { chromium } from "playwright-core";
import path from "node:path";
import fs from "node:fs";

const BASE = process.argv[2] || "http://localhost:3210";
const OUT = process.argv[3] || path.join(process.cwd(), ".evidence", "final-adjustments");
const EXE = path.join(process.env.LOCALAPPDATA, "ms-playwright", "chromium-1228", "chrome-win64", "chrome.exe");
fs.mkdirSync(OUT, { recursive: true });

const FORBIDDEN = ["Literature Intelligence", "Discovery", "Production"];
const pages = [
  "/",
  "/competencias/revisao-da-literatura",
  "/competencias/revisao-da-literatura/passo/3",
  "/ferramentas/consensus",
  "/ferramentas/chatgpt",
];

const browser = await chromium.launch({ executablePath: EXE });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2, colorScheme: "light" });
const page = await ctx.newPage();

console.log("=== CON-1: inglês no texto visível? ===");
for (const url of pages) {
  await page.goto(BASE + url, { waitUntil: "load", timeout: 20000 });
  await page.waitForTimeout(300);
  const text = await page.locator("body").innerText();
  const hits = FORBIDDEN.filter((w) => text.includes(w));
  console.log(`${url} => ${hits.length ? "⚠ " + hits.join(", ") : "OK (só PT)"}`);
}

// Evidências: passo 3 (categoria PT "Descoberta" + aviso ético) e homepage
await page.goto(BASE + "/competencias/revisao-da-literatura/passo/3", { waitUntil: "load" });
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(OUT, "01-passo-etica-e-categoria-pt.png"), fullPage: true });
console.log("✓ 01-passo-etica-e-categoria-pt");

await page.goto(BASE + "/", { waitUntil: "load" });
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(OUT, "02-home-categorias-pt.png"), fullPage: true });
console.log("✓ 02-home-categorias-pt");

await ctx.close();
await browser.close();
