import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

test('built page contains contacts, legal text and every supplied logo', async () => {
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  for (const text of ['hack-mack', 'niklas@hack-mack.com', 'xaver@hack-mack.com', 'sofiia@hack-mack.com', 'Impressum', 'Datenschutz', 'ZVR-Zahl', '[wird ergänzt]']) {
    assert.ok(html.includes(text), `Missing ${text}`);
  }
  assert.match(html, /<h1\b[^>]*>hack-mack<\/h1>/);
  assert.match(html, /<a\b[^>]*href="https:\/\/infra-ai-hackathon\.com\/"[^>]*aria-label="Zum Infra AI Hackathon \(neuer Tab\)"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/);
  assert.match(html, /<img\b[^>]*src="\/infra-ai-favicon\.svg"/);
  assert.match(await readFile(new URL('../dist/infra-ai-favicon.svg', import.meta.url), 'utf8'), /<svg\b/);
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

test('bubble follows the mouse, resets on exit, and ignores touch and reduced motion', async () => {
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  const script = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
  const events = {};
  const offsets = new Map();
  const motion = { matches: false };
  const bubble = { style: { setProperty: (key, value) => offsets.set(key, value), removeProperty: key => offsets.delete(key) } };
  runInNewContext(script, {
    window: { innerWidth: 1000, innerHeight: 800, matchMedia: () => motion, addEventListener: (name, handler) => { events[name] = handler; } },
    document: { querySelectorAll: () => [], querySelector: selector => selector === '.hackathon-bubble' ? bubble : null, documentElement: { addEventListener: (name, handler) => { events[name] = handler; } } },
  });
  events.pointermove({ pointerType: 'mouse', clientX: 1000, clientY: 800 });
  assert.equal(offsets.get('--bubble-x'), '8px');
  assert.equal(offsets.get('--bubble-y'), '8px');
  events.pointermove({ pointerType: 'mouse', clientX: 0, clientY: 0 });
  assert.equal(offsets.get('--bubble-x'), '-8px');
  assert.equal(offsets.get('--bubble-y'), '-8px');
  events.pointerleave();
  assert.equal(offsets.size, 0);
  events.pointermove({ pointerType: 'touch', clientX: 1000, clientY: 800 });
  assert.equal(offsets.size, 0);
  motion.matches = true;
  events.pointermove({ pointerType: 'mouse', clientX: 1000, clientY: 800 });
  assert.equal(offsets.size, 0);
});
