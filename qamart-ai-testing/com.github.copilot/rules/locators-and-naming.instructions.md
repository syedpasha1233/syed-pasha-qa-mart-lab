---
name: 'QA Mart locators and naming'
description: 'Use when writing or changing Playwright specs or Page Objects for QA Mart: locator choice, test names and the real selectors for login, search and add to cart, and checkout.'
applyTo: 'tests/**/*.ts,pages/**/*.ts'
---
# Locators and naming

## Locators, in this order
1. `getByRole` with a name
2. `getByLabel`
3. `getByTestId` (`data-testid`) when there is no accessible name
4. `getByText` only for static copy

Never use XPath, CSS ids or classes, `nth-child`, `.nth()` or `.first()` to pick a product. v2 reorders products and renames classes and ids; accessible names and test ids stay the same. Scope a product with `page.getByRole('listitem').filter({ hasText: <name> })`.

## Test names
- Title is `<flow> - <behaviour>`, with the flow one of `login`, `search and add to cart`, `checkout`.
- Example: `checkout - empty full name shows "Enter your full name"`.
- Put the story id (for example `US-104`) in the `test.describe` title, not in the test title.

## Real selectors (base URL comes from `baseURL`, http://localhost:3000; use relative paths such as `/login`)
| Flow | Element | Locator |
|---|---|---|
| login | heading | `getByRole('heading', { name: 'Sign in to QA Mart' })` |
| login | fields | `getByLabel('Email')`, `getByLabel('Password')` |
| login | submit | `getByRole('button', { name: 'Sign in' })` |
| login | error | `getByRole('alert')` |
| login | greeting | `getByTestId('greeting')` ("Hi, Asha") |
| search and add to cart | product list | `getByRole('list', { name: 'Products' })` |
| search and add to cart | product card | `getByRole('listitem').filter({ hasText: products.mouse.name })` |
| search and add to cart | add | `card.getByRole('button', { name: 'Add to cart' })` |
| search and add to cart | feedback | `getByTestId('toast')`, `getByTestId('cart-count')` |
| search and add to cart | cart | `getByRole('link', { name: /^Cart/ })`, `getByTestId('cart-subtotal')`, `getByTestId('qty-<id>')` |
| checkout | open | `getByRole('button', { name: 'Checkout' })` |
| checkout | form | `getByLabel('Full name')`, `getByLabel('Mobile number')`, `getByLabel('Delivery address')`, `getByLabel('PIN code')` |
| checkout | coupon | `getByLabel('Coupon code')`, `getByRole('button', { name: 'Apply coupon' })`, `getByTestId('coupon-message')` |
| checkout | summary | `getByTestId('order-subtotal')`, `getByTestId('order-discount')`, `getByTestId('order-total')` |
| checkout | submit | `getByRole('button', { name: 'Place order' })` |
| checkout | result | `getByRole('heading', { name: 'Order confirmed' })`, `getByTestId('order-id')`, `getByTestId('order-paid')` |

QA Mart has no search box. "Search" means finding the product card by its name in the product list.

## Data
Credentials, shipping details and prices come from `tests/test-data.ts` (`users`, `shipping`, `products`, `coupons`). Never type them into a spec.
