# GeminiLaunch and FaceSearchAI agent skills

Practical AI workflows for two existing services: publish and maintain websites on GeminiLaunch, and build integrations with FaceSearchAI's paid API.

[![skills.sh](https://skills.sh/b/FlicLabs/agent-skills)](https://skills.sh/FlicLabs/agent-skills)

## Install

```sh
npx skills add FlicLabs/agent-skills
```

Install an individual workflow:

```sh
npx skills add FlicLabs/agent-skills --skill geminilaunch-publish
npx skills add FlicLabs/agent-skills --skill geminilaunch-update
npx skills add FlicLabs/agent-skills --skill facesearchai-api-integration
```

| Skill | Useful outcome | Service entitlement |
| --- | --- | --- |
| [geminilaunch-publish](skills/geminilaunch-publish/SKILL.md) | Publish HTML, supported React code, or a static ZIP; verify the actual URL and social card | Existing publishing account; a free tier is available |
| [geminilaunch-update](skills/geminilaunch-update/SKILL.md) | Maintain an existing site in place and preserve its URL | Existing paid editing entitlement |
| [facesearchai-api-integration](skills/facesearchai-api-integration/SKILL.md) | Build and test a secure integration with the paid API | Production API requests consume the customer's API credits |

Examples: “Publish this static site on GeminiLaunch.” “Update my existing GeminiLaunch site with the new opening hours.” “Add FaceSearchAI's paid API to my server; test it with mocked responses.”

Browse on skills.sh: [publish](https://www.skills.sh/FlicLabs/agent-skills/geminilaunch-publish) · [update](https://www.skills.sh/FlicLabs/agent-skills/geminilaunch-update) · [FaceSearchAI integration](https://www.skills.sh/FlicLabs/agent-skills/facesearchai-api-integration).

The skills are free to install. Product subscriptions and credits are billed by the respective service, not by skills.sh. Setup links include campaign parameters to distinguish visits originating from these skills; the package does not send telemetry, photos, API keys, or results to a separate analytics service.

## Connect GeminiLaunch

Remote MCP endpoint: `https://www.geminilaunch.com/api/mcp`.

Use OAuth in your agent's MCP connection settings. Authentication stays on GeminiLaunch. The live documentation describes `list_sites`, `publish_site`, `update_site`, `set_seo_metadata`, and `delete_project`. Discover actual tool schemas after connecting. This package does not claim that an authenticated publish was executed during its own release checks.

[GeminiLaunch connection guide](https://www.geminilaunch.com/mcp) · [GeminiLaunch](https://www.geminilaunch.com)

## Integrate FaceSearchAI

The developer skill includes a dependency-free server adapter and mocked tests. It supports both documented and inspected response shapes, keeps keys server-side, and makes no automatic retry after uncertain delivery. This package does not execute a real biometric search or identify a person from a photograph.

[FaceSearchAI API documentation](https://www.facesearchai.com/api-access) · [API reference and billing semantics](skills/facesearchai-api-integration/references/api.md)

## ChatGPT distribution

The repository also contains portable ChatGPT/Codex plugin manifests and a packaging script:

```sh
npm test
npm run check:public
npm run package:chatgpt
```

This generates two ZIPs under `dist/`: GeminiLaunch with its existing OAuth MCP endpoint and two skills; FaceSearchAI Developer as a skills-only developer integration. Generated packages remove purchase directions and campaign parameters from ChatGPT instructions.

A [GitHub Actions workflow template](integrations/github-actions/checks.yml) is included. Automated checks run through the commands above; the workflow template is not active in this repository because the available GitHub credential cannot create workflow files.

ChatGPT currently permits access to existing paid accounts but prohibits selling digital subscriptions or credits, including freemium upsells. The plugin packages do not include checkout tools or promote upgrades. The FaceSearchAI package is a developer workflow; a direct-search ChatGPT app would need OAuth and privacy review. [OpenAI plugin guidelines](https://developers.openai.com/plugins/plugin-guidelines)

Publishing to GitHub makes the skills installable. skills.sh listing follows real installations and its indexing; publishing a repository alone is not proof of leaderboard placement. ChatGPT package upload, review submission, approval, and public publication are separate states. [skills.sh listing guidance](https://www.skills.sh/docs/faq) · [OpenAI submission process](https://developers.openai.com/plugins/deploy/submission)

## Foundation and license

Built on the open Agent Skills format, the [Vercel skills CLI](https://github.com/vercel-labs/skills), and the [OpenAI portable plugin format](https://developers.openai.com/plugins/build/plugins). Existing hosted capabilities are reused instead of operating another billing or search backend. [OpenAI's app examples](https://github.com/openai/openai-apps-sdk-examples) informed the connection and packaging approach; no third-party application source was copied.

New skill instructions, adapter, verification helpers, and tests are MIT licensed. Included product logos remain their owners' trademarks; the code license does not grant trademark rights.
