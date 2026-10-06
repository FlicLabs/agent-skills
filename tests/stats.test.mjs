import test from 'node:test';
import assert from 'node:assert/strict';
import { collectInstallCounts } from '../scripts/skills-stats.mjs';

test('aggregates paginated counts without reporting a missing skill as zero', async () => {
  const urls = [];
  const fetchImpl = async (url, options) => {
    urls.push(url);
    assert.equal(options.headers.Authorization, 'Bearer mock');
    assert.equal(options.redirect, 'error');
    const slug = urls.length === 1 ? 'geminilaunch-publish' : 'geminilaunch-update';
    return Response.json({ data: [{ id: `FlicLabs/agent-skills/${slug}`, source: 'fliclabs/agent-skills', slug, installs: urls.length }], pagination: { hasMore: urls.length === 1 } });
  };
  const result = await collectInstallCounts({ token: 'mock', fetchImpl });
  assert.equal(result.complete, false);
  assert.deepEqual(result.skills.map(x => x.installs), [1, 2, null]);
  assert.equal(new URL(urls[1]).searchParams.get('page'), '1');
  assert.ok(!JSON.stringify(result).includes('mock'));
});

test('does not turn an authentication failure into an empty success', async () => {
  await assert.rejects(collectInstallCounts({ token: 'mock', fetchImpl: async () => new Response(null, { status: 401 }) }), /HTTP 401/);
  await assert.rejects(collectInstallCounts(), /VERCEL_OIDC_TOKEN/);
});

test('rejects repeated pagination and invalid metrics', async () => {
  await assert.rejects(collectInstallCounts({ token: 'mock', fetchImpl: async () => Response.json({ data: [], pagination: { hasMore: true } }) }), /repeated a page/);
  await assert.rejects(collectInstallCounts({ token: 'mock', fetchImpl: async () => Response.json({ data: [{ source: 'FlicLabs/agent-skills', slug: 'geminilaunch-publish', installs: -1 }], pagination: { hasMore: false } }) }), /invalid install count/);
});
