---
name: bug-report
description: Writes a bug report for QA Mart in the team template. Use when a Playwright test fails, the app behaves differently from a story, or the user asks to report, file, write up or triage a defect in login, search and add to cart, or checkout.
---

# Bug Report

Use this skill when the user wants a failure or a surprising behaviour turned into a bug report.

## Rules

1. Decide the classification first: `application bug`, `test bug`, `environment issue` or `unconfirmed`. A failing test is a signal, not proof that the app is wrong.
2. Find the story and acceptance criterion in `docs/stories/`. If the test matches the story and the app does not, the app is wrong: classify it as an application bug and keep the test unchanged.
3. Use only evidence you have: the failing command, error text, trace or screenshot path, status codes, messages and amounts. Do not invent logs or DOM.
4. Fill in every section of `docs/templates/bug-report.md`. Use exact values (for example `422`, `"Laptop Stand is out of stock"`, `₹799`).
5. State the design (v1 or v2), the test account (email only, never the password), the browser and the commit.
6. Keep confirmed facts apart from guesses. Give a confidence of High, Medium or Low and say what would raise it.
7. Never edit `app/` or weaken a test to hide the defect.
8. Create a GitHub issue through the `github` MCP server only when the user asks. Show the report first and ask before creating the issue.

## Severity guide

- Critical: orders placed in someone else's name, wrong amount charged, checkout cannot complete (for example `US-105`).
- High: a story acceptance criterion fails on a main flow (login, cart, checkout).
- Medium: wrong message, wrong rounding, or a cap that is not applied.
- Low: cosmetic or copy issues.

## Output format

Return the report exactly in the structure of `docs/templates/bug-report.md`:

# Bug report

**Title:**

**Story / acceptance criterion:**

**Classification:** **Severity:** **Confidence:**

## Environment

## Steps to reproduce

## Expected result

## Actual result

## Evidence

## Impact and workaround
