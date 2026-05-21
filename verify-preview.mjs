import { chromium } from "C:/Users/R DISHOJ/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
const errors = [];

page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});

await page.goto("http://localhost:4173", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1800);

await page.click("#openLetter");
await page.click("text=Smile please");
await page.click("#play");
await page.waitForTimeout(300);
await page.click("#play");

await page.evaluate(() => {
  const upload = document.querySelector("#upload");
  const file = new File(
    [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])],
    "moon-memory.png",
    { type: "image/png" }
  );
  const transfer = new DataTransfer();
  transfer.items.add(file);
  upload.files = transfer.files;
  upload.dispatchEvent(new Event("change", { bubbles: true }));
});

await page.waitForSelector(".memory");
await page.fill("#search", "moon-memory");
await page.waitForSelector(".memory");
await page.click("[data-del='0']");

const status = await page.evaluate(() => ({
  title: document.title,
  letter: document.querySelector("#letter")?.textContent || "",
  boost: document.querySelector("#boostText")?.textContent || "",
  emptyVault: document.querySelector("#gallery")?.textContent?.includes("No memories yet") || false,
  loaderGone: !document.querySelector("#loader")
}));

await browser.close();

if (errors.length) {
  console.error(JSON.stringify({ ok: false, errors, status }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, status }, null, 2));
