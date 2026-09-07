#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import puppeteer from "puppeteer";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [command, slug, ...options] = process.argv.slice(2);
const escape = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
function locationFor(name) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name || "")) throw Error("Use a lowercase hyphenated talk slug.");
  return path.join(root, "talks", name);
}
async function server(port = 0) {
  const s = http.createServer(async (req, res) => {
    try {
      let pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
      let f = path.resolve(root, "." + pathname);
      if (f !== root && !f.startsWith(root + path.sep)) throw Error();
      if ((await fs.stat(f)).isDirectory()) f = path.join(f, "index.html");
      const types = {
        ".html": "text/html",
        ".css": "text/css",
        ".js": "text/javascript",
        ".json": "application/json",
        ".png": "image/png",
        ".svg": "image/svg+xml",
        ".webp": "image/webp",
        ".ttf": "font/ttf",
        ".pdf": "application/pdf",
      };
      res.setHeader("Content-Type", types[path.extname(f)] || "application/octet-stream");
      res.end(await fs.readFile(f));
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  });
  await new Promise((resolve, reject) => {
    s.once("error", reject);
    s.listen(port, "127.0.0.1", resolve);
  });
  return s;
}
async function walk(dir) {
  let result = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    if (e.name.startsWith("_") || e.name.startsWith(".")) continue;
    const p = path.join(dir, e.name);
    result.push(...(e.isDirectory() ? await walk(p) : [p]));
  }
  return result;
}
async function main() {
  if (command === "serve") {
    const port = Number(slug || 8000);
    const s = await server(port);
    console.log(`Preview: http://127.0.0.1:${s.address().port}/talks/`);
    return;
  }
  if (!["new", "check", "export"].includes(command))
    throw Error('Usage: node scripts/talk.mjs new <slug> "Title" | check <slug> [--screenshots] | export <slug> | serve [port]');
  const source = locationFor(slug);
  if (command === "new") {
    await fs.mkdir(source); // Refuse to overwrite an existing talk.
    await fs.cp(path.join(root, "scripts/talk-template"), source, { recursive: true });
    await fs.cp(path.join(root, "talks/hacking-democracy/assets/fonts"), path.join(source, "assets/fonts"), { recursive: true });
    const title = options[0] || slug.replaceAll("-", " ");
    const f = path.join(source, "index.html");
    await fs.writeFile(f, (await fs.readFile(f, "utf8")).replaceAll("TALK_TITLE", escape(title)));
    await fs.mkdir(path.join(source, "_authoring/prompts"), { recursive: true });
    await fs.writeFile(
      path.join(source, "_authoring/brief.md"),
      `# ${title}\n\nAudience:\nPurpose:\nDuration:\nEvent and date:\nCore question:\nSources and permissions:\n\nThis is a two-slide starter, not a finished talk.\n`
    );
    console.log(`Created talks/${slug}/. Start with _authoring/brief.md and index.html.`);
    return;
  }
  const config = JSON.parse(await fs.readFile(path.join(source, "talk.config.json"), "utf8").catch(() => "{}"));
  const output = path.join(root, ".talk-build", slug);
  await fs.mkdir(output, { recursive: true });
  const s = await server();
  const base = `http://127.0.0.1:${s.address().port}/talks/${slug}/`;
  const browser = await puppeteer.launch({ headless: true, protocolTimeout: 30000 });
  try {
    const page = await browser.newPage(),
      errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.setViewport({ width: 1600, height: 968 });
    await page.goto(base + "?view=present&demos=offline", { waitUntil: "networkidle0" });
    await page.evaluate(() => document.fonts.ready);
    const slides = await page.$$eval(".slide", (es) =>
      es.map((e) => ({
        id: e.id,
        title: e.dataset.title || e.querySelector("h1,h2")?.textContent,
        time: e.dataset.time || "",
        notes: [...e.querySelectorAll(".notes p")].map((p) => p.textContent.trim().replace(/\s+/g, " ")),
      }))
    );
    if (!slides.length || new Set(slides.map((s) => s.id)).size !== slides.length || slides.some((s) => !s.id))
      throw Error("Every slide needs a unique ID.");
    if (config.expectedSlides && slides.length !== config.expectedSlides)
      throw Error(`Expected ${config.expectedSlides} slides; found ${slides.length}. Update the running order and config deliberately.`);
    const show = async (id) =>
      page.evaluate((id) => {
        const slides = [...document.querySelectorAll(".slide")],
          i = slides.findIndex((s) => s.id === id);
        if (i < 0) throw Error("Missing slide " + id);
        (window.Talk || window.DemocracyTalk).show(i);
      }, id);
    if (command === "check") {
      const findings = [];
      for (const slide of slides) {
        await show(slide.id);
        findings.push(
          ...(await page.$eval("#" + slide.id, (s) => {
            const box = s.getBoundingClientRect();
            return [...s.querySelectorAll("h1,h2,h3,p,figure,button,a")]
              .filter((e) => !e.closest(".notes") && e.getClientRects().length)
              .filter((e) => {
                const r = e.getBoundingClientRect();
                return r.right > box.right + 2 || r.left < box.left - 2 || r.bottom > box.bottom + 2;
              })
              .map((e) => ({ slide: s.id, issue: "Content exceeds slide", element: e.tagName, text: e.textContent.slice(0, 100) }));
          }))
        );
        if (options.includes("--screenshots")) await page.screenshot({ path: path.join(output, slide.id + ".png") });
      }
      const badImages = await page.$$eval("img", (es) =>
        es
          .filter((e) => (!e.closest("dialog") && !e.complete) || (!e.closest("dialog") && e.complete && e.naturalWidth === 0))
          .map((e) => e.getAttribute("src"))
      );
      if (badImages.length) findings.push({ issue: "Missing images", images: badImages });
      for (const c of config.interactions || []) {
        await show(c.slide);
        await page.$eval(c.click, (e) => e.click());
        const actual = await page.$eval(c.expect.selector, (e) => e.textContent);
        if (!actual.includes(c.expect.includes)) findings.push({ issue: "Interaction result", check: c, actual });
      }
      for (const width of [320, 390, 768]) {
        await page.setViewport({ width, height: 844 });
        await page.goto(base + "?demos=offline", { waitUntil: "networkidle0" });
        const result = await page.evaluate(() => ({
          reading: document.body.classList.contains("read-view"),
          overflow: [...document.querySelectorAll(".slide *")]
            .filter((e) => !e.closest(".notes") && e.getClientRects().length && e.getBoundingClientRect().right > innerWidth + 2)
            .map((e) => e.tagName),
        }));
        if (!result.reading || result.overflow.length) findings.push({ width, ...result });
      }
      const report = {
        checkedAt: new Date().toISOString(),
        slides: slides.length,
        errors,
        findings,
        screenshots: options.includes("--screenshots"),
        liveEmbedsTested: false,
      };
      await fs.writeFile(path.join(output, "checks.json"), JSON.stringify(report, null, 2));
      if (errors.length || findings.length) throw Error(`Checks failed. See ${output}/checks.json`);
      console.log(
        `Checked ${slides.length} slides, local demo interactions and three mobile widths. Visual review and live demos still need a separate check.`
      );
    } else {
      const portable = path.join(output, "web", slug);
      await fs.mkdir(portable, { recursive: true });
      // Clear only this command's generated web folder to avoid stale exported assets.
      await fs.rm(portable, { recursive: true, force: true });
      await fs.mkdir(portable, { recursive: true });
      for (const f of await walk(source)) {
        const to = path.join(portable, path.relative(source, f));
        await fs.mkdir(path.dirname(to), { recursive: true });
        await fs.copyFile(f, to);
      }
      await page.evaluate(
        (base) =>
          document.querySelectorAll("a").forEach((a) => {
            const h = a.getAttribute("href") || "";
            if (h && !/^(https?:|mailto:|tel:)/.test(h)) a.href = new URL(h, base).href;
          }),
        config.publicUrl || `https://joshuacyang.com/talks/${slug}/`
      );
      await page.pdf({ path: path.join(output, slug + ".pdf"), printBackground: true, preferCSSPageSize: true });
      await fs.writeFile(path.join(output, "running-order.json"), JSON.stringify(slides, null, 2));
      await fs.writeFile(
        path.join(output, "rehearsal.md"),
        slides.map((s, i) => `## ${i + 1}. ${s.title}\n\n${s.time}\n\n${s.notes.join("\n\n")}`).join("\n\n")
      );
      const zip = spawnSync(
        "python3",
        [
          "-c",
          'import shutil,sys; shutil.make_archive(sys.argv[1],"zip",sys.argv[2])',
          path.join(output, slug + "-offline"),
          path.join(output, "web"),
        ],
        { encoding: "utf8" }
      );
      if (zip.status !== 0) throw Error(zip.stderr || "Python 3 is required for ZIP export.");
      const manifest = [];
      for (const f of await walk(output)) {
        if (path.basename(f) === "manifest.json") continue;
        manifest.push({
          path: path.relative(output, f),
          sha256: createHash("sha256")
            .update(await fs.readFile(f))
            .digest("hex"),
        });
      }
      await fs.writeFile(path.join(output, "manifest.json"), JSON.stringify(manifest, null, 2));
      console.log(`Exported PDF, portable website, ZIP, rehearsal notes and checksums to ${output}`);
    }
  } finally {
    const cleanupTimer = setTimeout(() => browser.process()?.kill(), 5000);
    try {
      await browser.close();
    } finally {
      clearTimeout(cleanupTimer);
      s.closeAllConnections();
      await new Promise((resolve) => s.close(resolve));
    }
  }
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
