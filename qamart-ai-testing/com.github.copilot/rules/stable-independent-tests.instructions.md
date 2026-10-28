---
name: 'QA Mart stable independent tests'
description: 'Use when writing, fixing or reviewing Playwright specs for QA Mart: no hard waits, no test.only, independent tests, web-first assertions.'
applyTo: 'tests/**/*.spec.ts'
---
# Stable, independent tests

## No hard waits
- Never use `page.waitForTimeout`, `setTimeout` or any fixed sleep, and never wait for `networkidle`.
- Rely on auto-waiting and web-first assertions: `toBeVisible`, `toHaveText`, `toHaveCount`, `toHaveURL`. QA Mart's product list loads slowly on purpose; assert on the list and it retries.
- To wait on the app, wait on a signal: `waitForURL`, `waitForResponse('**/api/orders')`, or `expect.poll`.
- Do not read a value and then assert on it (`textContent()` then `toBe`). Assert on the locator.

## No `.only`
- Never commit `test.only`, `test.describe.only` or `describe.only`. They silently skip the rest of the suite. A hook blocks the edit; do not work around it.
- To run one test use `npx playwright test <file> -g "<name>"`. To park a test that exposes an app bug use `test.fixme()` with a `BUG:` comment.

## Independent tests
- Every test sets up what it needs: sign in through the `signedInPage` fixture or the login form, and add its own products to the cart. The cart lives in the browser, so a new test starts empty.
- No test depends on another test's order, state or created order. Tests must pass in any order and in parallel.
- `api.reset()` wipes orders for the whole app. Do not call it from a test that can run in parallel with order-placing tests.
- Assert something the user can see. One behaviour per test.
- Never weaken an assertion or edit `app/` to make a test pass. If the app is wrong, keep the test and report the bug with the `bug-report` skill.
