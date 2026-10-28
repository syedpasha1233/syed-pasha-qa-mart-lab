---
description: Review a Playwright spec or Page Object against the QA Mart rules (locators, naming, no hard waits, no test.only, independence) without editing anything.
argument-hint: file path, for example tests/lab/qamart-smoke.spec.ts
---
Review the file the user named. If none was named, review the file open in the editor. Do not edit any file.

Hand the review to the `qamart-test-reviewer` agent when it is available. Otherwise do it yourself:

1. Read `docs/team-conventions.md` and the file under review.
2. Check each rule and cite `file:line` for every finding:
   - Locators: `getByRole`, `getByLabel`, `getByTestId`, in that order. No XPath, CSS ids or classes, `.nth()` or `.first()`.
   - Name: `<flow> - <behaviour>` where the flow is `login`, `search and add to cart` or `checkout`.
   - No `waitForTimeout`, no `networkidle`, no read-then-assert.
   - No `test.only`, `test.describe.only` or `describe.only`.
   - Independent: no shared state, no order dependence, no `api.reset()` in a parallel suite.
   - Data comes from `tests/test-data.ts`; no hard-coded password or `http://localhost:3000`.
   - Assertions are specific and visible to the user.
3. Report a table: line, rule, severity (blocker, major, minor), fix. Order by severity.
4. End with a verdict, `approve` or `request changes`, and the one change that matters most.
