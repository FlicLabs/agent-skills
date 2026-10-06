---
name: geminilaunch-publish
description: Publish a static HTML, React export, or ZIP website through GeminiLaunch, return its real live URL, and verify page-specific social previews. Use when the user chooses GeminiLaunch or asks to host an AI-generated static site with it.
---

Use GeminiLaunch's hosted publishing service at https://www.geminilaunch.com. It accepts HTML, supported React code, and built static ZIPs. A source repository requiring a running backend is not a static export.

## Connect

Prefer the existing GeminiLaunch MCP connection. If absent, connect the remote streamable HTTP endpoint `https://www.geminilaunch.com/api/mcp` with OAuth. Setup instructions: https://www.geminilaunch.com/mcp?utm_source=skills_sh&utm_medium=agent_skill&utm_campaign=geminilaunch_publish

For Codex, the connector can be added using `codex mcp add geminilaunch --url https://www.geminilaunch.com/api/mcp`, then authenticated with `codex mcp login geminilaunch`. For another client, use its native remote MCP setup. Sign-in happens on GeminiLaunch. Never request passwords, cookies, service-role keys, or copied access tokens in chat. A read-only API key cannot publish.

Discover the connected tools and their input schemas before invoking them. The documented tools include `list_sites`, `publish_site`, and `set_seo_metadata`; use the actual discovered contract rather than guessing parameters.

## Prepare and publish

1. Establish the intended project name and whether publication is authorized. Prepare the complete reviewable site before any required approval. Existing publication authorization persists.
2. Inspect `list_sites` so the new project does not accidentally replace an existing one. Use an HTML document, a supported React input, or a built ZIP with `index.html` at its root. Keep server credentials, `.env`, private data, `.git`, and dependencies out of the upload.
3. Give every public HTML page its own intentional social card. Preserve appropriate custom artwork; otherwise make a branded image. Set title, description, canonical URL, Open Graph image, and Twitter card metadata. Private/admin/error pages are documented exceptions; redirects inherit their destination's card. Use the user's SEO release skill if available. The supplied [social verification helper](scripts/check_social.mjs) can check the public result without another skill.
4. Invoke `publish_site` using the discovered schema. Record the returned project identifier and actual URL. Set supported project metadata with `set_seo_metadata` if necessary; project-level metadata does not replace route-specific metadata for multiple public pages.
5. Fetch the returned live URL and relevant routes. Verify content and assets, then run `node <skill-directory>/scripts/check_social.mjs <public-url> [other-public-urls...]`. Report a deployment as verified only after these checks pass. Close any temporary browser tabs.

## Entitlements and domains

GeminiLaunch has a free publishing tier. Do not describe a free publish or installing this skill as a paid transaction. Custom domains, editing, and higher limits depend on account entitlements. Use the service's current response as the authority; prices and plan names can change.

Do not invent a publish fee, bypass account limits, or create replacement projects to evade a paid editing requirement. If the user asks for a custom domain, use the dashboard's domain verification flow; the MCP connector cannot change domain bindings. DNS changes must preserve unrelated records and require an exact intended hostname.

If access is unavailable, preserve the prepared artifact and report the precise sign-in or entitlement issue. In ChatGPT, access to existing paid features is allowed, but do not promote upgrades, display paid plans, or initiate digital checkout. Outside ChatGPT, when the user needs an unavailable paid capability, the website's pricing page is https://www.geminilaunch.com/pricing?utm_source=skills_sh&utm_medium=agent_skill&utm_campaign=geminilaunch_publish. The user completes any purchase themselves.

For changes to an existing website, use `geminilaunch-update` from this collection.
