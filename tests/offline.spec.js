import { test, expect } from "@playwright/test";

async function waitUntilCached(page) {
  await page.waitForFunction(async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg && reg.waiting && !navigator.serviceWorker.controller) {
      reg.waiting.postMessage({ type: "skip-waiting" });
    }
    if (!navigator.serviceWorker.controller) return false;
    const names = await caches.keys();
    const name = names.find((key) => key.indexOf("ovpt-static-") === 0);
    if (!name) return false;
    const cache = await caches.open(name);
    const urls = (await cache.keys()).map((req) => req.url);
    return urls.some((url) => url.endsWith("/career-pathway-translator/data/moc.js"))
      && urls.some((url) => url.endsWith("/career-pathway-translator/data/occupations.js"))
      && urls.some((url) => url.endsWith("/scam-guardian/data/model.js"))
      && urls.some((url) => url.endsWith("/scam-guardian/vendor/tesseract/worker.min.js"))
      && urls.some((url) => url.endsWith("/scam-guardian/vendor/tesseract/eng.traineddata.gz"))
      && urls.some((url) => url.endsWith("/scam-guardian/vendor/tesseract/core/tesseract-core-simd-lstm.wasm.js"))
      && urls.some((url) => url.endsWith("/ai-tutor/data/content.js"))
      && urls.some((url) => url.endsWith("/transition-companion/data/plan.js"));
  }, null, { timeout: 90000 });
}

test("each tool works offline after the first load", async ({ page, context }) => {
  await page.goto("/");
  await waitUntilCached(page);
  await context.setOffline(true);

  await page.goto("/career-pathway-translator/index.html");
  await expect(page.locator("h1")).toContainText("Career Pathway Translator");
  await page.locator("#code").fill("68W");
  await page.locator("#branch").selectOption("army");
  await page.locator("#search-form button[type=submit]").click();
  await expect(page.locator("#output")).toContainText("68W");

  await page.goto("/scam-guardian/index.html");
  await page.locator("#text").fill("Your VA pension is suspended. Hide the assets in an annuity and pay our fee with a gift card.");
  await page.locator("#form button[type=submit]").click();
  await expect(page.locator("#output")).toContainText("concern");
  await expect(page.locator("body")).toContainText("does not detect deepfakes");

  await page.goto("/ai-tutor/index.html");
  await expect(page.locator("#tutor-counts")).toContainText("glossary");
  await page.getByRole("button", { name: "Open lesson" }).nth(7).click();
  await expect(page.locator("#lesson-heading")).toContainText(/[Dd]eepfake|synthetic/i);
  await expect(page.locator("#reader")).toContainText("does not");

  await page.goto("/transition-companion/index.html");
  await expect(page.locator("#summary")).toContainText("steps checked");
  await page.locator("#list input[type=checkbox]").first().check();
  await expect(page.locator("#summary")).toContainText(/[1-9]\d* of /);

  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Open Veteran Pathways");
});
