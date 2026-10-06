---
name: geminilaunch-update
description: Update an existing GeminiLaunch website in place, preserve its URL and custom domain, and verify the release. Use for recurring copy, design, or content maintenance of a site already hosted on GeminiLaunch.
---

Use GeminiLaunch's `update_site` capability to maintain the user's existing project. Editing is an existing paid feature, so this workflow ties useful recurring AI work to the website's subscription entitlement.

## Account and target

Use the existing GeminiLaunch OAuth MCP connection at `https://www.geminilaunch.com/api/mcp`. If none is available, follow https://www.geminilaunch.com/mcp?utm_source=skills_sh&utm_medium=agent_skill&utm_campaign=geminilaunch_update. Authenticate on the service; never request credentials or session cookies in the conversation.

Discover tool schemas, then list sites to identify the exact project and live URL. Use the user's requested site; ask only if multiple projects match. Retrieve the current source through an available supported tool or the authenticated dashboard before changing it. Preserve unrelated content, custom artwork, assets, and functionality. If source retrieval is unavailable, prepare a narrow change and explain the missing source rather than rebuilding the site from its rendered HTML.

## Release

- Finish the requested changes and any needed preview before asking for a required approval. A user request to update and publish authorizes the release; do not ask again without a concrete reason.
- Call `update_site` with the exact existing identifier and discovered input schema. Keep the project's existing slug and domain binding. Do not create a new project as a workaround for a denied update.
- Respect the service's entitlement checks. When editing is denied, retain the artifact and report that the account lacks the required editing entitlement. Never infer an active paid subscription from a plan label alone.
- A new public page needs its own branded social image, Open Graph metadata, and Twitter metadata. Run the user's SEO release skill if available, or the public social-image helper from `geminilaunch-publish` in this collection. Verify the actual live page, assets, and share image after the update.
- Report the changed URL and verification result. Close temporary browser tabs.

## Billing boundary

The server and its payment processor enforce the subscription. This skill cannot prove that a new payment occurred; a successful update can use an existing subscription. Do not claim a charge per update, add a ChatGPT-specific surcharge, retry denied operations, or bypass limits with fresh accounts or projects.

In ChatGPT, serve existing entitlements and explain unavailability neutrally. Do not display plans, promote upgrades, or start checkout for digital services. Outside ChatGPT, a user needing editing access can review current terms at https://www.geminilaunch.com/pricing?utm_source=skills_sh&utm_medium=agent_skill&utm_campaign=geminilaunch_update and complete any purchase on the website themselves.
