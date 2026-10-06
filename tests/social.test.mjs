import test from 'node:test';
import assert from 'node:assert/strict';
import { checkPages } from '../skills/geminilaunch-publish/scripts/check_social.mjs';

function html(path, image) {
  const values = { description: 'Sample', 'og:title': path, 'og:description': 'Sample', 'og:url': `https://example.com/${path}`, 'og:image': image, 'twitter:card': 'summary_large_image', 'twitter:title': path, 'twitter:description': 'Sample', 'twitter:image': image };
  return `<link rel="canonical" href="https://example.com/${path}">` + Object.entries(values).map(([key,value]) => `<meta content="${value}" property="${key}">`).join('');
}
const bytes = new Uint8Array(64); bytes.set([137,80,78,71]);

test('checks the actual public image and route-specific metadata', async () => {
  const calls = [];
  const fetchImpl = async url => {
    calls.push(url);
    if (url.endsWith('.png')) return new Response(bytes, { headers: { 'content-type': 'image/png' }});
    const path = new URL(url).pathname.slice(1);
    return new Response(html(path, `https://example.com/${path}.png`));
  };
  const result = await checkPages(['https://example.com/a', 'https://example.com/b'], fetchImpl);
  assert.equal(result.length, 2);
  assert.equal(calls.length, 4);
  assert.ok(result.every(x => x.verified));
});

test('fails distinct routes reusing the homepage card', async () => {
  const fetchImpl = async url => url.endsWith('.png') ? new Response(bytes, { headers: { 'content-type': 'image/png' } }) : new Response(html(new URL(url).pathname.slice(1), 'https://example.com/home.png'));
  await assert.rejects(checkPages(['https://example.com/a', 'https://example.com/b'], fetchImpl), /reuse a social image/);
});

test('fails an HTML error page posing as a social image', async () => {
  const fetchImpl = async url => url.endsWith('.png') ? new Response('<html>Not found</html>', { headers: { 'content-type': 'text/html' } }) : new Response(html('a', 'https://example.com/a.png'));
  await assert.rejects(checkPages(['https://example.com/a'], fetchImpl), /unsupported content type/);
});
