# FaceSearchAI API contract

Checked 2026-10-06 against the public API page, the production missing-key response, and the current search implementation. No paid search was executed.

Endpoint: `POST https://api-v2.facesearchai.com/api/v1/api-service/search`

Authentication: `X-API-Key`. Body: multipart `file` or `url`. API credentials and credits are separate from website credits.

The public documentation shows `results`, `credits_remaining`, and per-result `url`, `image_url`, `score`. The inspected implementation returns `data`, `remaining_credits`, `credit_balance`, `topup_credits`, and optional `share_id`. The adapter supports both without inventing absent balances or similarity scores. Treat the actual response as authoritative.

The implementation validates input before spending a credit, deducts before calling the search provider, and refunds explicit provider failure or exceptions. A successful search uses a credit. A client timeout does not establish that a refund happened. No idempotency guarantee is documented; do not invent one or automatically retry.

The production route returned HTTP 401 with `detail.error_code: MISSING_API_KEY` when called without a key and without an image. This confirms the public authentication guard, not a successful paid transaction. Atomic concurrency behavior and Stripe payment collection have not been independently exercised by this package.

Do not rely on marketing example counts, storage claims, or prices as guaranteed runtime behavior. Read current website terms and privacy details for any production application. Documentation links:

- https://www.facesearchai.com/api-access
- https://www.facesearchai.com/pricing
- https://www.facesearchai.com/privacy
- https://www.facesearchai.com/terms-of-service

## Server-side usage

```js
import { FaceSearchAIClient } from './facesearchai-client.mjs';

const client = new FaceSearchAIClient({
  apiKey: process.env.FACESEARCHAI_API_KEY,
});

// The application supplies a consented file Blob. Mock this call in development.
const result = await client.searchFile(fileBlob);
// result.creditsRemaining can be null if the server did not provide a balance.
```

The adapter is infrastructure for the application's developer. Do not run it through an assistant to identify someone from a photograph.
