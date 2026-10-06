import { pathToFileURL } from 'node:url';

function decode(value) {
  return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#(x[0-9a-f]+|[0-9]+);/gi, (_, n) => String.fromCodePoint(
      n[0].toLowerCase() === 'x' ? parseInt(n.slice(1), 16) : parseInt(n, 10)));
}

export function parseMetadata(html) {
  const meta = new Map();
  for (const tag of html.match(/<(?:meta|link)\b[^>]*>/gi) ?? []) {
    const attrs = {};
    for (const match of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
      attrs[match[1].toLowerCase()] = decode(match[2] ?? match[3] ?? match[4]);
    }
    const key = attrs.property ?? attrs.name ?? (attrs.rel === 'canonical' ? 'canonical' : null);
    if (key && !meta.has(key.toLowerCase())) meta.set(key.toLowerCase(), attrs.content ?? attrs.href ?? '');
  }
  return meta;
}

function publicUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('An HTTPS public URL is required.');
  return url;
}

export async function checkPages(urls, fetchImpl = fetch) {
  const seen = new Map();
  const checked = new Set();
  const reports = [];
  for (const value of urls) {
    const requested = publicUrl(value);
    const page = await fetchImpl(requested.href, { signal: AbortSignal.timeout(20000) });
    if (!page.ok) throw new Error(`Page returned HTTP ${page.status}: ${requested.href}`);
    const resolved = page.url || requested.href;
    if (checked.has(resolved)) continue;
    checked.add(resolved);
    const html = await page.text();
    const meta = parseMetadata(html);
    for (const key of ['canonical', 'description', 'og:title', 'og:description', 'og:url', 'og:image', 'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
      if (!meta.get(key)?.trim()) throw new Error(`Missing ${key}: ${resolved}`);
    }
    if (meta.get('twitter:card') !== 'summary_large_image') throw new Error(`Use a large-image Twitter card: ${resolved}`);
    const canonical = publicUrl(meta.get('canonical')).href;
    const ogUrl = publicUrl(meta.get('og:url')).href;
    if (canonical !== ogUrl) throw new Error(`Open Graph URL and canonical disagree: ${resolved}`);
    const image = publicUrl(meta.get('og:image')).href;
    if (publicUrl(meta.get('twitter:image')).href !== image) throw new Error(`Open Graph and Twitter images disagree: ${resolved}`);
    if (seen.has(image) && seen.get(image) !== canonical) {
      throw new Error(`Distinct public pages reuse a social image: ${resolved}`);
    }
    seen.set(image, canonical);
    const response = await fetchImpl(image, { signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`Social image returned HTTP ${response.status}: ${image}`);
    const type = response.headers.get('content-type')?.split(';')[0];
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(type)) throw new Error(`Social image has unsupported content type: ${image}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.length < 32 || bytes.length > 5 * 1024 * 1024) throw new Error(`Social image size is invalid: ${image}`);
    const png = bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71;
    const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const webp = String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
    if (!(type === 'image/png' && png || type === 'image/jpeg' && jpeg || type === 'image/webp' && webp)) {
      throw new Error(`Social image bytes do not match its type: ${image}`);
    }
    reports.push({ url: resolved, canonical, image, bytes: bytes.length, verified: true });
  }
  return reports;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const urls = process.argv.slice(2);
  if (!urls.length) { console.error('Usage: node check_social.mjs <public-url> [other-public-urls...]'); process.exitCode = 2; }
  else {
    try { console.log(JSON.stringify(await checkPages(urls), null, 2)); }
    catch (error) { console.error(error.message); process.exitCode = 1; }
  }
}
