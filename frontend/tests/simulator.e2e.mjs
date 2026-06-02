import assert from "node:assert/strict";

import { chromium } from "playwright";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3001";

const VIEWPORTS = [
  { name: "desktop", viewport: { width: 1440, height: 1280 } },
  { name: "mobile", viewport: { width: 390, height: 844 } },
];

const SLIDERS = [
  "investment-amount",
  "monthly-revenue",
  "monthly-growth-rate",
  "repayment-cap",
  "revenue-share",
  "post-money-valuation",
  "exit-value",
];

async function moveSlider(page, testId) {
  const control = page.locator(`[data-testid="control-${testId}"]`);
  const valueLocator = page.locator(`[data-testid="${testId}-value"]`);
  const thumb = control.locator('[data-slot="slider-thumb"]').first();

  const before = (await valueLocator.textContent())?.trim() ?? "";
  await thumb.click();
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(
    ({ selector, previous }) =>
      document.querySelector(selector)?.textContent?.trim() !== previous,
    { selector: `[data-testid="${testId}-value"]`, previous: before },
  );

  const after = (await valueLocator.textContent())?.trim() ?? "";
  assert.notStrictEqual(after, before, `${testId} value did not change`);

  return { before, after };
}

async function runViewport(browser, { name, viewport }) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const consoleErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  page.on("pageerror", (error) => {
    consoleErrors.push(`pageerror: ${error.message}`);
  });

  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  await assert.doesNotReject(async () => {
    await page.locator("text=Why this matters").first().waitFor({ state: "visible" });
    await page.locator("text=Market Controls").first().waitFor({ state: "visible" });
    await page.locator("text=Deal Signal").first().waitFor({ state: "visible" });
  }, `${name} missing storytelling panels`);

  const initialCap = (await page.locator('[data-testid="metric-total-rbf-cap"]').textContent())?.trim() ?? "";

  for (const sliderId of SLIDERS) {
    const result = await moveSlider(page, sliderId);

    if (sliderId === "investment-amount") {
      await page.waitForFunction(
        ({ selector, previous }) =>
          document.querySelector(selector)?.textContent?.trim() !== previous,
        {
          selector: '[data-testid="metric-total-rbf-cap"]',
          previous: initialCap,
        },
      );

      const refreshedCap =
        (await page.locator('[data-testid="metric-total-rbf-cap"]').textContent())?.trim() ??
        "";
      assert.notStrictEqual(refreshedCap, initialCap, `${name} total cap did not refresh`);
    }

    assert.notStrictEqual(result.after, result.before, `${sliderId} did not move`);
  }

  const readinessSwitch = page.locator('[data-testid="backend-readiness-switch"]');
  const checkedBefore = await readinessSwitch.getAttribute("aria-checked");
  await readinessSwitch.click();
  const checkedAfter = await readinessSwitch.getAttribute("aria-checked");
  assert.notStrictEqual(checkedAfter, checkedBefore, `${name} switch did not toggle`);

  await page.waitForTimeout(500);
  assert.equal(consoleErrors.length, 0, `${name} browser errors:\n${consoleErrors.join("\n")}`);

  await context.close();
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  try {
    for (const viewport of VIEWPORTS) {
      console.log(`Running test for viewport: ${viewport.name}`);
      await runViewport(browser, viewport);
    }
    console.log("E2E tests passed successfully!");
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
