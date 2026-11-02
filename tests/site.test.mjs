import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { test } from 'node:test';

test('built page contains contacts, legal text and every supplied logo', async () => {
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  for (const text of ['hack-mack', 'Projekte', 'Tech Talk Vienna', 'niklas@hack-mack.com', 'xaver@hack-mack.com', 'sofiia@hack-mack.com', 'Impressum', 'Datenschutz', 'ZVR-Zahl', '[wird ergänzt]']) {
    assert.ok(html.includes(text), `Missing ${text}`);
  }
  assert.match(html, /<h1\b[^>]*>hack-mack<\/h1>/);
  assert.match(html, /<a\b[^>]*href="https:\/\/infra-ai-hackathon\.com\/"[^>]*aria-label="Zum Infra AI Hackathon \(neuer Tab\)"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/);
  assert.match(html, /<a\b[^>]*href="https:\/\/luma\.com\/techtalkvienna"[^>]*target="_blank"[^>]*rel="noopener noreferrer"[^>]*>Tech Talk Vienna<\/a>/);
  const projects = html.indexOf('aria-labelledby="projekte"');
  assert.ok(projects !== -1 && projects < html.indexOf('aria-labelledby="kontakt"'), 'Projects must appear before contact');
  assert.doesNotMatch(html, /project-bubble|--bubble-|pointermove|pointerleave/);
  const sourceLogos = (await readdir(new URL('../logos/', import.meta.url))).filter(name => name.endsWith('.svg'));
  const images = [...html.matchAll(/<img\b[^>]*\bdata-logo\b[^>]*>/g)];
  assert.equal(images.length, sourceLogos.length);
  assert.equal(images.filter(([tag]) => /class="is-active"/.test(tag)).length, 1);
  for (const [tag] of images) {
    const src = tag.match(/src="([^"]+)"/)[1];
    assert.ok(src.startsWith('/_astro/'), 'Logo must be served locally');
    await access(new URL(`../dist${src}`, import.meta.url));
  }
  assert.doesNotMatch(html, /28\.01\.1998|20\.07\.2001|03\.06\.2005|Malfattigasse|Donau-City-Straße|\.pdf\b/);
});
