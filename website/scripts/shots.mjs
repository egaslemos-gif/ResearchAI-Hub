// Captura de evidências (screenshots) via Playwright usando o Chromium já em cache.
// Uso: node scripts/shots.mjs [baseUrl] [outDir]
import { chromium } from "playwright-core";
import path from "node:path";
import fs from "node:fs";

const BASE = process.argv[2] || "http://localhost:3210";
const OUT = process.argv[3] || path.join(process.cwd(), ".evidence", "checkpoint-1");
const EXE = path.join(
  process.env.LOCALAPPDATA,
  "ms-playwright",
  "chromium-1228",
  "chrome-win64",
  "chrome.exe"
);

fs.mkdirSync(OUT, { recursive: true });

const shots = [
  { name: "01-home-desktop-light", url: "/", vp: { width: 1280, height: 900 }, dark: false, full: true },
  { name: "02-home-desktop-dark", url: "/", vp: { width: 1280, height: 900 }, dark: true, full: true },
  { name: "03-competencias-desktop", url: "/competencias", vp: { width: 1280, height: 900 }, dark: false, full: true },
  { name: "04-ferramentas-desktop", url: "/ferramentas", vp: { width: 1280, height: 900 }, dark: false, full: true },
  { name: "05-prompts-desktop", url: "/prompts", vp: { width: 1280, height: 900 }, dark: false, full: true },
  { name: "06-home-mobile-light", url: "/", vp: { width: 390, height: 844 }, dark: false, full: true },
  { name: "07-home-mobile-drawer", url: "/", vp: { width: 390, height: 844 }, dark: false, full: false, drawer: true },
  { name: "08-home-desktop-dark-mobileNav", url: "/prompts", vp: { width: 390, height: 844 }, dark: true, full: true },
];

const browser = await chromium.launch({ executablePath: EXE });
try {
  for (const s of shots) {
    const context = await browser.newContext({
      viewport: s.vp,
      colorScheme: s.dark ? "dark" : "light",
      deviceScaleFactor: 2,
    });
    if (s.dark) {
      await context.addInitScript(() => {
        try {
          localStorage.setItem("theme", "dark");
        } catch {}
      });
    }
    const page = await context.newPage();
    await page.goto(BASE + s.url, { waitUntil: "load", timeout: 20000 });
    await page.waitForTimeout(500);
    if (s.drawer) {
      await page.click('button[aria-label="Abrir menu"]');
      await page.waitForTimeout(400);
    }
    await page.screenshot({ path: path.join(OUT, s.name + ".png"), fullPage: !!s.full });
    console.log("✓", s.name);
    await context.close();
  }
} finally {
  await browser.close();
}
console.log("\nScreenshots em:", OUT);
