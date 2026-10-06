---
name: facesearchai-api-integration
description: Build a server-side integration with FaceSearchAI's paid, credit-metered API, including secure key storage, response normalization, and charge-aware failure handling. Use for developer integrations; not for identifying a person in an uploaded photo.
---

Integrate the existing FaceSearchAI API into the user's application. This is a developer workflow: help write and test code without identifying people from images, finding someone's identity or private information, or executing a biometric search through the assistant. Use mocked responses and synthetic fixtures for development.

## Paid service contract

The public API documentation is https://www.facesearchai.com/api-access?utm_source=skills_sh&utm_medium=agent_skill&utm_campaign=facesearchai_api. The production search route is `POST https://api-v2.facesearchai.com/api/v1/api-service/search` with `X-API-Key` and multipart `file` or `url`. Search uses API credits, which are separate from website search credits. Subscription and top-up requirements belong to the service's backend; do not reimplement the search with an anonymous endpoint to avoid payment.

Read [the API reference](references/api.md) for actual response differences and billing semantics. Use [the server adapter](scripts/facesearchai-client.mjs) as a working starting point. It makes one request, handles HTTP and application errors, accepts a caller-selected timeout, and never retries an ambiguous charged request automatically.

## Build the integration

1. Store `FACESEARCHAI_API_KEY` only in the application's server environment or secret store. Do not ask the user to paste it in chat, embed it in client bundles, log it, or publish it in source. In ChatGPT, do not run calls that would cause the assistant to collect or process access credentials; provide code and mocked verification instead.
2. Keep image uploads and API requests on the application's server. Expose only the narrow application feature requested. User image input requires clear purpose, meaningful consent, deletion controls, and enforcement of the service's restrictions. A consent checkbox is not permission to identify third parties through the assistant.
3. Send `X-API-Key` to the fixed HTTPS service origin. Do not accept a user-provided API base URL. Prefer file input to arbitrary remote URLs; if your application accepts URLs, validate network destinations and redirect behavior before fetching them.
4. Preserve the backend's match scores as similarity signals. Do not manufacture confidence values, claim that a score proves identity, or infer sensitive characteristics.
5. Treat missing key, missing entitlement, insufficient credits, rate limits, and backend errors as distinct failures. Handle errors returned inside a successful HTTP response. A timeout may have spent a credit; reconcile the account before deciding whether another request is warranted.
6. Verify with injected mock transport that one action sends one request, errors do not leak keys or biometric data, and both documented and deployed response formats normalize correctly. State whether a real paid request was tested; mock tests are not payment evidence.

## Payment and distribution

Every production call goes through the existing paid API endpoint and its credit guard. Installing the skill is free; service usage consumes the customer's existing paid entitlement. The adapter does not create subscriptions or spend money on behalf of the user.

Outside ChatGPT, users without API access can obtain it through FaceSearchAI's website and store the resulting key themselves. In ChatGPT, help developers implement integrations and serve existing account capabilities; do not promote plans, sell credits, initiate checkout, or use API keys as a substitute for OAuth in a user-facing ChatGPT connector. A future direct-search ChatGPT app needs its own OAuth account integration, privacy review, and server-side entitlement checks.

Close temporary browser tabs after reference checks. Do not send photos, search results, or recipient information to analytics or arbitrary third parties.
