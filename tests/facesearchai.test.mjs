import test from 'node:test';
import assert from 'node:assert/strict';
import { FaceSearchAIClient, normalizeResponse } from '../skills/facesearchai-api-integration/scripts/facesearchai-client.mjs';

test('both response contracts preserve server results and balances', () => {
  const results = [{ sourceUrl: 'https://example.com/owned-image', score: 0.75 }];
  assert.deepEqual(normalizeResponse({ status: 'success', data: results, remaining_credits: 0 }), { results, creditsRemaining: 0, shareId: null });
  assert.equal(normalizeResponse({ status: 'success', results, credits_remaining: 9 }).creditsRemaining, 9);
  assert.equal(normalizeResponse({ status: 'success', results }).creditsRemaining, null);
  assert.throws(() => normalizeResponse({ status: 'error', error_code: 'NO_CREDITS' }), /NO_CREDITS/);
});

test('one action sends one fixed-origin request and key stays in headers', async () => {
  const calls = [];
  const client = new FaceSearchAIClient({ apiKey: 'fixture-secret', fetchImpl: async (...args) => {
    calls.push(args);
    return Response.json({ status: 'success', data: [], remaining_credits: 3 });
  }});
  const result = await client.searchFile(new Blob(['synthetic-fixture']));
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], 'https://api-v2.facesearchai.com/api/v1/api-service/search');
  assert.equal(calls[0][1].headers['X-API-Key'], 'fixture-secret');
  assert.equal(calls[0][1].redirect, 'error');
  assert.equal(result.creditsRemaining, 3);
  assert.equal(JSON.stringify(client).includes('fixture-secret'), false);
});

test('uncertain delivery never retries and never exposes transport details', async () => {
  let calls = 0;
  const client = new FaceSearchAIClient({ apiKey: 'fixture-secret', fetchImpl: async () => {
    calls++; throw new Error('Authorization: fixture-secret; private-data');
  }});
  await assert.rejects(client.searchFile(new Blob(['fixture'])), error => {
    assert.equal(error.code, 'DELIVERY_UNKNOWN_CHECK_CREDITS');
    assert.equal(error.message.includes('fixture-secret'), false);
    return true;
  });
  assert.equal(calls, 1);
});

test('auth failures and HTTP-200 service failures remain failures', async () => {
  for (const status of [401, 200]) {
    const client = new FaceSearchAIClient({ apiKey: 'fixture', fetchImpl: async () => Response.json(
      { detail: { status: 'error', error_code: 'MISSING_API_KEY', message: 'private-data' } }, { status })
    });
    await assert.rejects(client.searchFile(new Blob(['fixture'])), error => error.code === 'MISSING_API_KEY' && !error.message.includes('private-data'));
  }
});

test('invalid local input sends no request', async () => {
  let calls = 0;
  const client = new FaceSearchAIClient({ apiKey: 'fixture', fetchImpl: async () => { calls++; } });
  await assert.rejects(client.searchFile(new Blob([])), /INVALID_FILE/);
  assert.equal(calls, 0);
  assert.throws(() => new FaceSearchAIClient({}), /MISSING_API_KEY/);
});
