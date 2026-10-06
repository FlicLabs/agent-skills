import { appendFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

const source = 'FlicLabs/agent-skills';
const skills = ['geminilaunch-publish', 'geminilaunch-update', 'facesearchai-api-integration'];

export async function collectInstallCounts({ token, fetchImpl = fetch, now = new Date() } = {}) {
  if (!token?.trim()) throw new Error('A valid VERCEL_OIDC_TOKEN is required. See https://www.skills.sh/docs/api#authentication.');
  const counts = new Map();
  const seenPages = new Set();
  for (let page = 0; page < 100; page++) {
    const url = new URL('https://skills.sh/api/v1/skills');
    url.search = new URLSearchParams({ view: 'all-time', source, per_page: '100', page: String(page) });
    let response;
    try {
      response = await fetchImpl(url.href, { headers: { Authorization: `Bearer ${token}` }, redirect: 'error', signal: AbortSignal.timeout(20000) });
    } catch {
      throw new Error('skills.sh request failed; no snapshot was saved.');
    }
    if (!response.ok) throw new Error(`skills.sh returned HTTP ${response.status}; no snapshot was saved.`);
    let body;
    try { body = await response.json(); } catch { throw new Error('skills.sh returned invalid JSON.'); }
    if (!Array.isArray(body.data) || typeof body.pagination?.hasMore !== 'boolean') throw new Error('skills.sh returned an invalid pagination response.');
    const pageIds = body.data.map(item => item?.id).join('|');
    if (body.pagination.hasMore && seenPages.has(pageIds)) throw new Error('skills.sh repeated a page; no snapshot was saved.');
    seenPages.add(pageIds);
    for (const item of body.data) {
      if (String(item?.source).toLowerCase() !== source.toLowerCase() || !skills.includes(item.slug)) continue;
      if (!Number.isSafeInteger(item.installs) || item.installs < 0) throw new Error('skills.sh returned an invalid install count.');
      if (counts.has(item.slug)) throw new Error('skills.sh returned a duplicate skill; no snapshot was saved.');
      counts.set(item.slug, item.installs);
    }
    if (!body.pagination.hasMore) return {
      observed_at: now.toISOString(), source, metric: 'deduplicated_installs',
      complete: counts.size === skills.length,
      skills: skills.map(slug => ({ slug, installs: counts.get(slug) ?? null, status: counts.has(slug) ? 'reported' : 'not_reported' })),
    };
  }
  throw new Error('skills.sh pagination limit reached; no snapshot was saved.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const snapshot = await collectInstallCounts({ token: process.env.VERCEL_OIDC_TOKEN });
    const file = process.argv[2] || 'evidence/skills-install-snapshots.jsonl';
    await mkdir(dirname(file), { recursive: true });
    await appendFile(file, JSON.stringify(snapshot) + '\n');
    console.log(JSON.stringify(snapshot, null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
