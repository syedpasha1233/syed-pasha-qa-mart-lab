---
description: Run the QA Mart smoke test (login, search and add to cart, checkout) against http://localhost:3000 and report the result per flow. Asks no questions.
argument-hint: no arguments needed
---
Base URL: `http://localhost:3000` (the `baseURL` in `playwright.config.ts`; the app is `node app/server.js`). Do not ask questions; do every step below.

1. If `node_modules` is missing, run `npm install` and `npx playwright install chromium`.
2. Write the spec below to `tests/lab/qamart-smoke.spec.ts`, replacing any earlier copy. Do not change it. It uses relative paths on purpose, so `baseURL` supplies the host.
3. Run `npx playwright test tests/lab/qamart-smoke.spec.ts --project=chromium`. Playwright starts the app itself (`webServer`) and reuses it if it already answers on `http://localhost:3000/api/health`.
4. If a test fails, read the failure and the trace path. Do not edit the spec or `app/` to make it pass. Say whether it looks like an application bug, a test bug or an environment problem.

```ts
import { test, expect } from '../fixtures';
import { users, products, shipping } from '../test-data';

test.describe('QA Mart smoke', () => {
  test('login - standard user lands on the product list, greeted by name', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Sign in to QA Mart' })).toBeVisible();
    await page.getByLabel('Email').fill(users.standard.email);
    await page.getByLabel('Password').fill(users.standard.password);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(/\/products$/);
    await expect(page.getByTestId('greeting')).toHaveText('Hi, Asha');
  });

  test('search and add to cart - a product found by name reaches the cart', async ({ signedInPage: page }) => {
    const card = page.getByRole('listitem').filter({ hasText: products.mouse.name });
    await card.getByRole('button', { name: 'Add to cart' }).click();

    await expect(page.getByTestId('toast')).toHaveText(`${products.mouse.name} added to cart`);
    await expect(page.getByTestId('cart-count')).toHaveText('1');
    await page.getByRole('link', { name: /^Cart/ }).click();
    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.getByTestId('cart-subtotal')).toHaveText('₹799');
  });

  test('checkout - valid delivery details place the order and show the confirmation', async ({ signedInPage: page }) => {
    await page.getByRole('listitem').filter({ hasText: products.mouse.name }).getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('link', { name: /^Cart/ }).click();
    await page.getByRole('button', { name: 'Checkout' }).click();
    await expect(page.getByTestId('order-total')).toHaveText('₹799');

    await page.getByLabel('Full name').fill(shipping.fullName);
    await page.getByLabel('Mobile number').fill(shipping.mobile);
    await page.getByLabel('Delivery address').fill(shipping.address);
    await page.getByLabel('PIN code').fill(shipping.pin);
    await page.getByRole('button', { name: 'Place order' }).click();

    await expect(page).toHaveURL(/\/confirmation$/);
    await expect(page.getByRole('heading', { name: 'Order confirmed' })).toBeVisible();
    await expect(page.getByTestId('order-id')).toBeVisible();
    await expect(page.getByTestId('order-paid')).toHaveText('₹799');
  });
});
```

Finish with exactly this table, one row per test, then one line naming the first failure's likely cause (or "all green"):

| Flow | Test | Result | Duration |
|---|---|---|---|
| login | ... | PASS or FAIL | ... |
| search and add to cart | ... | PASS or FAIL | ... |
| checkout | ... | PASS or FAIL | ... |
