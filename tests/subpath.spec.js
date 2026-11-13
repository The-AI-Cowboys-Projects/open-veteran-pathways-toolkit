import { test, expect } from "@playwright/test";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

let child;
let tmp;

test.beforeAll(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ovpt-sub-"));
  const nested = path.join(tmp, "learn", "open-veteran-pathways");
  fs.mkdirSync(path.dirname(nested), { recursive: true });
  fs.symlinkSync(path.resolve("."), nested, "dir");
  child = spawn("python3", [path.resolve("scripts/serve.py"), "--port", "8766", "--bind", "127.0.0.1"], {
    cwd: tmp,
    stdio: "ignore",
  });
  const started = Date.now();
  let up = false;
  while (Date.now() - started < 8000) {
    try {
      const response = await fetch("http://127.0.0.1:8766/learn/open-veteran-pathways/");
      if (response.ok) {
        up = true;
        break;
      }
    } catch (err) {
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }
  if (!up) throw new Error("subpath server did not start");
});

test.afterAll(async () => {
  if (child) child.kill();
  if (tmp) fs.rmSync(tmp, { recursive: true, force: true });
});

test("service worker scope follows a nested folder", async ({ page }) => {
  await page.goto("http://127.0.0.1:8766/learn/open-veteran-pathways/ai-tutor/index.html");
  const info = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    return {
      scope: reg.scope,
      script: reg.active ? reg.active.scriptURL : "",
      manifest: document.querySelector('link[rel="manifest"]').getAttribute("href"),
    };
  });
  expect(info.scope).toBe("http://127.0.0.1:8766/learn/open-veteran-pathways/");
  expect(info.script).toBe("http://127.0.0.1:8766/learn/open-veteran-pathways/sw.js");
  expect(info.manifest).toBe("../manifest.webmanifest");
  await expect(page.locator(".wordmark")).toHaveCount(1);
  await expect(page.locator("#tutor-counts")).toContainText("12 lessons");
});
