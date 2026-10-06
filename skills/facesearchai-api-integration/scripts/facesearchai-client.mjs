const ENDPOINT = 'https://api-v2.facesearchai.com/api/v1/api-service/search';

export class FaceSearchAIError extends Error {
  constructor(code, status = null) {
    super(`FaceSearchAI request failed (${code}).`);
    this.name = 'FaceSearchAIError';
    this.code = code;
    this.status = status;
  }
}

export function normalizeResponse(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new FaceSearchAIError('INVALID_RESPONSE');
  }
  const payload = body.detail && typeof body.detail === 'object' ? body.detail : body;
  if (payload.status === 'error' || payload.error_code) {
    throw new FaceSearchAIError(safeCode(payload.error_code));
  }
  const results = Array.isArray(body.data) ? body.data : body.results;
  if (body.status !== 'success' || !Array.isArray(results)) {
    throw new FaceSearchAIError('INVALID_RESPONSE');
  }
  const balance = body.remaining_credits ?? body.credits_remaining;
  return {
    results,
    creditsRemaining: Number.isFinite(balance) && balance >= 0 ? balance : null,
    shareId: typeof body.share_id === 'string' ? body.share_id : null,
  };
}

function safeCode(value) {
  return typeof value === 'string' && /^[A-Z0-9_]{1,64}$/.test(value)
    ? value : 'SERVICE_ERROR';
}

export class FaceSearchAIClient {
  #apiKey;
  #fetch;
  #timeoutMs;

  constructor({ apiKey, fetchImpl = fetch, timeoutMs = 60000 } = {}) {
    if (typeof apiKey !== 'string' || !apiKey.trim()) {
      throw new FaceSearchAIError('MISSING_API_KEY');
    }
    if (!Number.isInteger(timeoutMs) || timeoutMs <= 0 || timeoutMs > 300000) {
      throw new FaceSearchAIError('INVALID_TIMEOUT');
    }
    this.#apiKey = apiKey.trim();
    this.#fetch = fetchImpl;
    this.#timeoutMs = timeoutMs;
  }

  async searchFile(file) {
    if (!(file instanceof Blob) || file.size === 0) {
      throw new FaceSearchAIError('INVALID_FILE');
    }
    const form = new FormData();
    form.append('file', file, 'upload');
    let response;
    try {
      response = await this.#fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'X-API-Key': this.#apiKey },
        body: form,
        redirect: 'error',
        signal: AbortSignal.timeout(this.#timeoutMs),
      });
    } catch {
      // Never copy transport errors: they can contain headers, filenames or data.
      throw new FaceSearchAIError('DELIVERY_UNKNOWN_CHECK_CREDITS');
    }
    let body;
    try { body = await response.json(); }
    catch { throw new FaceSearchAIError('INVALID_RESPONSE', response.status); }
    if (!response.ok) {
      const payload = body?.detail && typeof body.detail === 'object' ? body.detail : body;
      throw new FaceSearchAIError(safeCode(payload?.error_code), response.status);
    }
    return normalizeResponse(body);
  }
}
