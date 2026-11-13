import { test, expect } from "@playwright/test";

const pages = [
  "/",
  "/career-pathway-translator/index.html",
  "/scam-guardian/index.html",
  "/ai-tutor/index.html",
  "/transition-companion/index.html",
];

test.use({ viewport: { width: 360, height: 740 } });

test("360px layout has no horizontal scroll and 44px targets", async ({ page }) => {
  for (const url of pages) {
    await page.goto(url);
    const metrics = await page.evaluate(() => {
      const overflow = document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1;
      const nodes = Array.from(document.querySelectorAll("button, a.button, .tool-nav a"));
      const targets = nodes.filter((el) => !el.hidden && el.getClientRects().length).map((el) => {
        const box = el.getBoundingClientRect();
        return {
          text: (el.textContent || "").trim().slice(0, 48),
          width: box.width,
          height: box.height,
        };
      });
      return { overflow, targets };
    });
    expect(metrics.overflow, url).toBe(true);
    expect(metrics.targets.length, url).toBeGreaterThan(0);
    for (const target of metrics.targets) {
      expect(target.height, url + " " + target.text).toBeGreaterThanOrEqual(44);
      expect(target.width, url + " " + target.text).toBeGreaterThanOrEqual(44);
    }
  }
});

test("mobile career and scam flows still complete", async ({ page }) => {
  await page.goto("/career-pathway-translator/index.html");
  await page.locator("#code").fill("HM");
  await page.locator("#branch").selectOption("navy");
  await page.locator("#search-form button[type=submit]").click();
  await expect(page.locator("#output")).toContainText("HM");

  await page.goto("/scam-guardian/index.html");
  await page.locator("#text").fill("This is VA. Your benefits are suspended unless you buy a gift card.");
  await page.locator("#form button[type=submit]").click();
  await expect(page.locator("#output")).toContainText("High concern");
});
