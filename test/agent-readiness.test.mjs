import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");

test("homepage exposes complete agent identity metadata", async () => {
  const html = await read("index.html");
  assert.match(html, /<html lang="en">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/kiranvk\.netlify\.app\/">/);
  assert.match(html, /<meta property="og:type" content="website">/);
  assert.match(html, /<meta property="og:image"/);
  assert.match(html, /"@type": "Organization"/);
  assert.match(html, /"contactPoint":/);
  assert.match(html, /"email": "kiranjayan18@gmail\.com"/);
  assert.match(html, /"address":/);
});

test("agent resources describe use cases and indexable URLs", async () => {
  const llms = await read("llms.txt");
  const sitemap = await read("sitemap.xml");
  assert.match(llms, /## When to use this site/);
  assert.match(llms, /healthcare booking platforms/i);
  for (const path of ["/", "/about/", "/contact/", "/privacy/", "/aarohcare.html", "/savemylink.html"]) {
    assert.match(sitemap, new RegExp(`<loc>https:\\/\\/kiranvk\\.netlify\\.app${path.replaceAll("/", "\\/")}</loc>`));
  }
});

test("trust pages contain substantial content and 404 fallback is linked", async () => {
  for (const page of ["about/index.html", "contact/index.html", "privacy/index.html"]) {
    const html = await read(page);
    assert.ok(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().length >= 500, `${page} should contain at least 500 characters`);
  }
  const notFound = await read("404.html");
  assert.match(notFound, /sitemap\.xml/);
  assert.match(notFound, /page does not exist/i);
});

test("Netlify edge function negotiates Markdown and preserves 404 status", async () => {
  const edge = await read("netlify/edge-functions/agent-content.ts");
  assert.match(edge, /text\/markdown/);
  assert.match(edge, /vary["']?: ["']Accept["']/i);
  assert.match(edge, /addVaryAccept/);
  assert.match(edge, /notFoundMarkdown, 404/);
  assert.match(edge, /path === "\/"\s*&& response\.ok/);
});
