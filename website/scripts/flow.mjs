// Captura do vertical slice completo (Checkpoint 2) num único contexto,
// para demonstrar o fluxo real + persistência do progresso (LocalStorage).
import { chromium } from "playwright-core";
import path from "node:path";
import fs from "node:fs";

const BASE = process.argv[2] || "http://localhost:3210";
const OUT = process.argv[3] || path.join(process.cwd(), ".evidence", "checkpoint-2");
const EXE = path.join(process.env.LOCALAPPDATA, "ms-playwright", "chromium-1228", "chrome-win64", "chrome.exe");
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: EXE });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2, colorScheme: "light" });
const page = await ctx.newPage();
const go = async (url) => {
  await page.goto(BASE + url, { waitUntil: "load", timeout: 20000 });
  await page.waitForTimeout(500);
};
const shot = async (name, full = true) => {
  await page.screenshot({ path: path.join(OUT, name + ".png"), fullPage: full });
  console.log("✓", name);
};

// 1. Homepage (CTA principal)
await go("/");
await shot("01-home-cta");

// 2. Competência (overview) — progresso 0
await go("/competencias/revisao-da-literatura");
await shot("02-competencia");

// 3. Passo 1 — preencher variáveis para mostrar o prompt a ser preenchido
await go("/competencias/revisao-da-literatura/passo/1");
const inputs = page.locator(".withForm input[type=text], form input[type=text]");
if ((await inputs.count()) >= 1) await inputs.nth(0).fill("Educação superior em Moçambique");
if ((await inputs.count()) >= 2) await inputs.nth(1).fill("uso de IA na aprendizagem");
const sel = page.locator("select");
if ((await sel.count()) >= 1) await sel.first().selectOption({ label: "mestrado" }).catch(() => {});
await page.waitForTimeout(400);
await shot("03-passo1");

// avançar 3 passos (marca concluídos → demonstra persistência)
for (let i = 0; i < 3; i++) {
  await page.getByRole("button", { name: /Concluir e avançar/ }).click();
  await page.waitForTimeout(800);
}
await shot("04-passo4-progresso");

// 5. Voltar à competência — progresso persistente (3/10)
await go("/competencias/revisao-da-literatura");
await shot("05-competencia-progresso");

// 6. Checklist — marcar todos os itens
await go("/competencias/revisao-da-literatura/checklist");
const checks = page.locator('[role=checkbox]');
const n = await checks.count();
for (let i = 0; i < n; i++) {
  await checks.nth(i).click();
  await page.waitForTimeout(30);
}
await page.waitForTimeout(300);
await shot("06-checklist");

// 7. Conclusão
await go("/competencias/revisao-da-literatura/concluido");
await shot("07-conclusao");

// 8-9. Ferramentas
await go("/ferramentas/chatgpt");
await shot("08-ferramenta-chatgpt");
await go("/ferramentas/consensus");
await shot("09-ferramenta-consensus");

// 10. Prompt (detalhe)
await go("/prompts/definicao-do-tema-de-investigacao");
await shot("10-prompt-detalhe");

await ctx.close();

// 11. Passo em mobile
const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: "light" });
const mp = await m.newPage();
await mp.goto(BASE + "/competencias/revisao-da-literatura/passo/3", { waitUntil: "load", timeout: 20000 });
await mp.waitForTimeout(500);
await mp.screenshot({ path: path.join(OUT, "11-passo-mobile.png"), fullPage: true });
console.log("✓ 11-passo-mobile");
await m.close();

await browser.close();
console.log("\nScreenshots em:", OUT);
