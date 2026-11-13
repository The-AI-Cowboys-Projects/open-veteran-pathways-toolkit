import { test, expect } from "@playwright/test";

test("free-text translation sits beside the code lookup and stays on the device", async ({ page }) => {
  const hosts = [];
  page.on("request", (request) => {
    try { hosts.push(new URL(request.url).host); } catch (err) { /* ignore */ }
  });
  await page.goto("/career-pathway-translator/index.html");
  await expect(page.locator("#about-counts")).toContainText("8361");
  await expect(page.getByRole("link", { name: "MOS to CEO Translator" })).toHaveAttribute("href", "https://www.theaicowboysfoundation.org/learn/mos-to-ceo");
  await page.locator("#phrase-text").fill("I briefed flag officers and supervised personnel.");
  await page.locator("#phrase-form button[type=submit]").click();
  await expect(page.locator("#phrase-output")).toContainText(/c-suite|presented/i);
  await expect(page.locator("#phrase-output")).toContainText("personnel");
  await expect(page.locator("#phrase-output")).toContainText("not a job offer");
  expect(hosts.some((host) => host.indexOf("huggingface") !== -1)).toBe(false);
});

test("scam rules and rubric work with the model absent and make no model request", async ({ page }) => {
  const hosts = [];
  page.on("request", (request) => {
    try { hosts.push(new URL(request.url).host); } catch (err) { /* ignore */ }
  });
  await page.goto("/scam-guardian/index.html");
  await expect(page.locator("#model-status")).toContainText("not on this device");
  await expect(page.locator("#model-size")).toContainText("297,975,376");
  await expect(page.locator("#model-license")).toContainText("Gemma");
  await expect(page.getByRole("link", { name: "Gemma terms" })).toHaveAttribute("href", "https://ai.google.dev/gemma/terms");
  await page.locator("#text").fill("Your benefits are suspended. Call immediately and pay with a gift card.");
  await page.locator("#form button[type=submit]").click();
  await expect(page.locator("#output")).toContainText("High concern");
  await expect(page.locator("#message-rubric")).toContainText("scam");
  await page.locator("#model-ask").click();
  await expect(page.locator("#model-suggestion")).toContainText("not on this device");
  expect(hosts.some((host) => host.indexOf("huggingface") !== -1)).toBe(false);
});

test("tutor shows sourced passages and does not require the model", async ({ page }) => {
  await page.goto("/ai-tutor/index.html");
  await expect(page.locator("#oversight")).toContainText("Pendleton, M., et al. (2026)");
  await expect(page.locator("#model-status")).toContainText("not on this device");
  await page.locator("#ask").fill("phishing");
  await page.locator("#ask-form button[type=submit]").click();
  await expect(page.locator("#ask-output")).toContainText("Passage");
  await expect(page.locator("#ask-output a").first()).toHaveAttribute("href", /^https:\/\//);
  await page.locator("#ask-model").click();
  await expect(page.locator("#model-answer")).toContainText("not on this device");
});

test("companion states that a person checks every box", async ({ page }) => {
  await page.goto("/transition-companion/index.html");
  await expect(page.locator("#oversight")).toContainText("You check each box yourself");
  await expect(page.locator("main")).toContainText("Pendleton, M., et al. (2026)");
  await page.locator("#list input[type=checkbox]").first().check();
  await expect(page.locator("#summary")).toContainText(/[1-9]\d* of /);
});
