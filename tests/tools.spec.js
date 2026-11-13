import { test, expect } from "@playwright/test";

const pages = [
  ["/", "Open Veteran Pathways Toolkit"],
  ["/career-pathway-translator/index.html", "Career Pathway Translator"],
  ["/scam-guardian/index.html", "Scam Guardian"],
  ["/ai-tutor/index.html", "Plain-English AI Tutor"],
  ["/transition-companion/index.html", "Transition Companion"],
];

test("each page has one wordmark, a skip link, and install instructions", async ({ page }) => {
  for (const [url, title] of pages) {
    await page.goto(url);
    await expect(page).toHaveTitle(title);
    await expect(page.locator(".wordmark")).toHaveCount(1);
    await expect(page.locator("a.skip")).toHaveAttribute("href", "#main");
    await expect(page.getByRole("heading", { name: "Install on this device" })).toBeVisible();
    await expect(page.getByText("Add to Home Screen")).toBeVisible();
  }
});

test("career lookup, empty state, and keyboard submit", async ({ page }) => {
  await page.goto("/career-pathway-translator/index.html");
  await expect(page.locator("#boot")).toHaveCount(0);
  await expect(page.locator("#empty-state")).toContainText("Enter a code");
  await page.locator("#code").focus();
  const outline = await page.locator("#code").evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outline).not.toBe("none");
  await page.locator("#code").fill("11B");
  await page.locator("#branch").selectOption("army");
  await page.locator("#code").press("Enter");
  await expect(page.locator("#output")).toContainText("Infantryman");
  await expect(page.locator("#history")).toContainText("11B");
});

test("scam guardian explains a benefits lure and keeps OCR progress in the page", async ({ page }) => {
  await page.goto("/scam-guardian/index.html");
  await expect(page.locator("#empty-state")).toContainText("Results appear here");
  await expect(page.locator("#ocr-bar")).toHaveAttribute("role", "progressbar");
  await expect(page.locator("#ocr-progress")).toBeHidden();
  await page.locator("#text").fill("This is the Department of Veterans Affairs. Your benefits are suspended. Call immediately and pay with a gift card.");
  await page.locator("#form button[type=submit]").click();
  await expect(page.locator("#output")).toContainText("High concern");
  await expect(page.getByRole("heading", { name: "Result" })).toBeFocused();
});

test("tutor search, quiz explanations, progress, and export", async ({ page }) => {
  await page.goto("/ai-tutor/index.html");
  await expect(page.locator("#tutor-counts")).toContainText("12 lessons");
  await expect(page.locator("#progress-summary")).toContainText("No lessons marked read");
  await page.locator("#q").fill("zzzz-not-a-term");
  await expect(page.locator("#glossary")).toContainText("No glossary entry");
  await page.locator("#q").fill("confabulation");
  await expect(page.locator("#glossary")).toContainText("Confabulation");
  await expect(page.locator("#glossary a").first()).toHaveAttribute("href", /nist\.gov|nvlpubs\.nist\.gov/);
  await page.getByRole("button", { name: "Open lesson" }).first().click();
  await expect(page.locator("#lesson-heading")).toBeFocused();
  await page.getByRole("button", { name: "Score this quiz" }).click();
  await expect(page.locator("#reader")).toContainText("answer key");
  await expect(page.locator("#reader")).toContainText("Not answered");
  await expect(page.locator("#progress-summary")).toContainText("1 of 12");
  const downloadPromise = page.waitForEvent("download");
  await page.locator("#export-progress").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("ai-tutor-progress.json");
});

test("companion checks a step and rejects a bad backup", async ({ page }) => {
  await page.goto("/transition-companion/index.html");
  await expect(page.locator("#summary")).toContainText("steps checked");
  await page.locator("#list input[type=checkbox]").first().check();
  await expect(page.locator("#summary")).toContainText(/[1-9]\d* of /);
  await page.locator("#import").setInputFiles({
    name: "not-a-backup.json",
    mimeType: "application/json",
    buffer: Buffer.from("{\"nope\":true}"),
  });
  await expect(page.locator("#import-error")).toContainText("not a checklist backup");
});

test("theme toggle changes the document and keeps readable text", async ({ page }) => {
  await page.goto("/");
  await page.locator("#theme").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const sample = await page.evaluate(() => {
    function lum(color) {
      const m = color.match(/\d+(\.\d+)?/g).map(Number);
      const [r, g, b] = m.map((v) => {
        const c = v / 255;
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
    function ratio(a, b) {
      const L1 = lum(a);
      const L2 = lum(b);
      const hi = Math.max(L1, L2);
      const lo = Math.min(L1, L2);
      return (hi + 0.05) / (lo + 0.05);
    }
    const body = getComputedStyle(document.body);
    const button = getComputedStyle(document.querySelector("a.button"));
    return {
      text: ratio(body.color, body.backgroundColor),
      button: ratio(button.color, button.backgroundColor),
    };
  });
  expect(sample.text).toBeGreaterThanOrEqual(4.5);
  expect(sample.button).toBeGreaterThanOrEqual(4.5);
  await page.locator("#theme").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});
