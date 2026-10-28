# qamart-ai-testing

## 1. Overview

An Agent Plugins 1.0 plugin for AI-assisted testing of QA Mart (http://localhost:3000). It covers three flows: **login**, **search and add to cart**, and **checkout**. QA Mart has no search box, so "search" means finding a product card by name.

## 2. Install

Registered in the `qa-mart-lab` marketplace (`.claude-plugin/marketplace.json`):

```
/plugin install qamart-ai-testing@qa-mart-lab
```

Or register the folder locally, the same way as `playwright-qa-toolkit`. Add this to your VS Code user settings and replace the path with the real absolute path of this folder.

Unix/macOS:

```json
{
  "chat.plugins.enabled": true,
  "chat.pluginLocations": {
    "/absolute/path/to/qamart-ai-testing": true
  }
}
```

Windows:

```json
{
  "chat.plugins.enabled": true,
  "chat.pluginLocations": {
    "C:\\absolute\\path\\to\\qamart-ai-testing": true
  }
}
```

Needs Node.js 20 or newer (hooks, MCP and the app). `.github/copilot/settings.json` still recommends only `playwright-qa-toolkit@qa-mart-lab`; add `"qamart-ai-testing@qa-mart-lab": true` under `enabledPlugins` to recommend this plugin to the team.

## 3. What's inside (13 components)

| # | Type | Name | Purpose |
|---|------|------|---------|
| 1 | Instruction | `locators-and-naming` | `getByRole`/`getByLabel`/`getByTestId`, test titles `<flow> - <behaviour>`, real QA Mart selectors |
| 2 | Instruction | `stable-independent-tests` | No hard waits, no `test.only`, independent tests |
| 3 | Command | `/smoke-test` | Runs login, search and add to cart, and checkout against http://localhost:3000, no questions asked |
| 4 | Command | `/review-test` | Reviews a spec against the QA Mart rules, read-only |
| 5 | Skill | `checkout-test-design` | Designs checkout cases from the stories: coupons, totals, form boundaries, stock |
| 6 | Skill | `bug-report` | Turns a failure into a report in `docs/templates/bug-report.md` |
| 7 | Agent | `qamart-test-planner` | Explores the app, saves a plan to `specs/` (step 1) |
| 8 | Agent | `qamart-test-healer` | Runs and fixes failing tests, reports app bugs (step 3) |
| 9 | Agent | `qamart-test-reviewer` | Read-only reviewer: tools are `read` and `search` only |
| 10 | MCP server | `playwright` | Browser automation (`npx @playwright/mcp`), no credentials |
| 11 | MCP server | `github` | GitHub issues and code (`https://api.githubcopilot.com/mcp/`); sign-in is handled by the client, no token in this repo |
| 12 | Hook | `block-only.cjs` (`preToolUse`) | Blocks edits that add `test.only` / `describe.only` (exit code 2 with a message) |
| 13 | Hook | `run-lint.cjs` (`postToolUse`) | Runs `scripts/lint-specs.cjs` after spec edits; never blocks |

The six requested component types have two entries each; the agents row has three because the request names a planner, a healer and a reviewer.

Planner, Generator, Healer hand-off: `qamart-test-planner` saves a plan, its **Generate the tests** hand-off sends it to the default agent (the generator step) to write `tests/lab/*.spec.ts`, and **Run and heal the tests** hands over to `qamart-test-healer`, which can hand over to `qamart-test-reviewer`.

## 4. Folder structure

```
qamart-ai-testing/
├── plugin.json
├── mcp.json
├── README.md
├── skills/
│   ├── checkout-test-design/SKILL.md
│   └── bug-report/SKILL.md
├── scripts/
│   ├── block-only.cjs
│   └── run-lint.cjs
└── com.github.copilot/
    ├── agents/
    │   ├── qamart-test-planner.agent.md
    │   ├── qamart-test-healer.agent.md
    │   └── qamart-test-reviewer.agent.md
    ├── commands/
    │   ├── smoke-test.md
    │   └── review-test.md
    ├── rules/
    │   ├── locators-and-naming.instructions.md
    │   └── stable-independent-tests.instructions.md
    └── hooks/
        └── hooks.json
```

## 5. 60-second demo

1. **Install (10 s):** `/plugin install qamart-ai-testing@qa-mart-lab`, or register the folder as above and reload VS Code.
2. **Run (40 s):** in the repo root type `/smoke-test`. It installs dependencies if needed, writes `tests/lab/qamart-smoke.spec.ts`, runs it (Playwright starts QA Mart on port 3000) and reports.
3. **See the results (10 s):** a table like this:

| Flow | Test | Result |
|---|---|---|
| login | login - standard user lands on the product list, greeted by name | PASS |
| search and add to cart | search and add to cart - a product found by name reaches the cart | PASS |
| checkout | checkout - valid delivery details place the order and show the confirmation | PASS |

4. **Bonus:** ask the agent to add `test.only` to that spec. The edit is blocked with `BLOCKED by qamart-ai-testing`.

## 6. Verification

1. Reload VS Code, open Extensions and enter `@agentPlugins`; check `qamart-ai-testing` is installed.
2. Open Chat > Open Customizations and confirm the skills, agents, commands, instructions, hooks and MCP servers appear.
3. Run **MCP: List Servers** and check `playwright` and `github`.
4. Disable the plugin and verify all components disappear; enable it and verify they return.

## 7. Troubleshooting

- **MCP `github` asks to sign in:** authentication is client-managed. Sign in when prompted; never put a token in `mcp.json`.
- **Hook does nothing:** needs `node` on the PATH. The scripts read the tool event from stdin and fail open on bad input.
- **Lint hook is silent:** it only reports for `*.spec.ts` and `pages/**/*.ts` and needs `scripts/lint-specs.cjs` in the workspace.
- **Port 3000 busy:** see the "Port 3000 busy?" section of the repository README.
- **Duplicate behaviour:** search for duplicate copies under `.github` and other registered plugin locations.

## 8. Removal or disable

- Disable: set the path to `false` in `chat.pluginLocations`, or disable it from `@agentPlugins`.
- Remove: `/plugin uninstall qamart-ai-testing`, or delete the path entry and this folder.

## 9. Safety notes

- The reviewer agent has no edit or execute tools. The planner edits only `specs/`.
- No agent edits `app/` or changes an expected value to match the app.
- The MCP and hook files contain no tokens, passwords or cookies. Do not paste credentials into prompts.
- Plugins can run code on your machine (hooks, `npx`). Review the scripts before installing.
