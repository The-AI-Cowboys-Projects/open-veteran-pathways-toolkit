import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pages = [
  ["/", "home"],
  ["/career-pathway-translator/index.html", "career"],
  ["/scam-guardian/index.html", "scam"],
  ["/ai-tutor/index.html", "tutor"],
  ["/transition-companion/index.html", "companion"],
];

async function expectNoAxeViolations(page, label) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations, label + " " + JSON.stringify(results.violations, null, 2)).toEqual([]);
}

for (const theme of ["light", "dark"]) {
  test.describe("axe " + theme, () => {
    test.use({ colorScheme: theme });
    for (const [url, name] of pages) {
      test(name, async ({ page }) => {
        await page.goto(url);
        await page.evaluate((mode) => {
          document.documentElement.setAttribute("data-theme", mode);
        }, theme);
        await expectNoAxeViolations(page, theme + " " + url);
      });
    }
  });
}

test.describe("axe narrow light", () => {
  test.use({ colorScheme: "light", viewport: { width: 360, height: 740 } });
  for (const [url, name] of pages) {
    test(name, async ({ page }) => {
      await page.goto(url);
      await page.evaluate(() => {
        document.documentElement.setAttribute("data-theme", "light");
      });
      await expectNoAxeViolations(page, "narrow " + url);
    });
  }
});

test("skip link is the first tab stop", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.locator("a.skip")).toBeFocused();
});

test("reduced motion disables animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const duration = await page.locator("body").evaluate((el) => getComputedStyle(el).animationDuration);
  expect(["0s", "0ms"]).toContain(duration);
});
