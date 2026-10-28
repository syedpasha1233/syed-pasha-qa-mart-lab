---
name: checkout-test-design
description: Designs test cases for the QA Mart checkout flow. Use when the user asks to plan, design, extend or find gaps in checkout tests, including coupons, order summary totals, delivery form validation, empty cart, stock limits or order confirmation.
---

# Checkout Test Design

Use this skill when the user wants test cases, a test plan or a coverage review for QA Mart checkout (`/cart` then `/checkout` then `/confirmation`).

## Rules

1. Start from the story. Read `docs/stories/US-101-coupon-story.md`, `US-103-stock-limits.md`, `US-105-secure-ordering.md` and `US-106-checkout-details.md`, and `docs/team-conventions.md`. Cite the acceptance criterion for every case, for example `US-106 AC4`.
2. Take expected values from the story, never from what the app currently does. If the live app disagrees, keep the story's value and add `Observed: <what the app does>`.
3. Apply the techniques below, and name the technique on each case.
4. Mark every case UI or API. Use the UI for what the shopper sees and the API (`/api/coupons/validate`, `/api/orders`) for rules and status codes.
5. Use the data in `tests/test-data.ts` (`users`, `shipping`, `products`, `coupons`). Use `asha@qamart.test` for a first order and `ravi@qamart.test` for a returning shopper.
6. Each case is independent: it adds its own products and does not rely on another case.
7. Use the template in `docs/templates/test-case.md` when it fits.

## Techniques and boundaries

| Area | Technique | Cases (expected from the story) |
|---|---|---|
| Order summary | Equivalence, calculation | Total = Subtotal - Discount (US-106 AC1); two products sum correctly |
| Mobile number | Boundary value | 9 digits rejected, 10 accepted, 11 rejected, letters rejected: "Enter a 10-digit mobile number" (US-106 AC4) |
| PIN code | Boundary value | 5 digits rejected, 6 accepted, 7 rejected, leading 0 rejected: "Enter a 6-digit PIN code" (US-106 AC6) |
| Required fields | Negative | Empty Full name: "Enter your full name"; empty Delivery address: "Enter your delivery address" (US-106 AC3, AC5) |
| Field errors | Accessibility | Invalid field has `aria-invalid="true"` and `aria-errormessage` (US-106 AC7) |
| Empty cart | State | "Place order" disabled and "Your cart is empty" shown (US-106 AC8) |
| FLAT100 | Boundary value | 499 no discount, 500 gives 100 off, 501 gives 100 off (US-101 AC3) |
| SAVE10 | Boundary, cap | 10% rounded down; capped at 200 (US-101 AC2) |
| WELCOME50 | State | 50% off capped at 250 on a first order only; rejected for the returning shopper (US-101 AC4) |
| Codes | Equivalence | Lower case and surrounding spaces accepted (AC1); `SUMMER25` "This coupon has expired" (AC5); unknown code "Invalid coupon code" (AC6) |
| Stock | Boundary value | At the limit accepted, limit + 1 rejected with 422 naming the product, sold-out product rejected with 422 (US-103 AC2-4) |
| Security | Negative (API) | No token 401, mismatched token 403, valid token 201 (US-105) |
| Confirmation | Happy path | Valid details lead to `/confirmation` with `order-id` and `order-paid` equal to the total (US-106 AC2) |

## Output format

# Checkout Test Design

## Story coverage
(Acceptance criteria covered and any not covered.)

## Test cases
| ID | Flow - behaviour (title) | Story AC | Technique | UI/API | Data | Expected |
|---|---|---|---|---|---|---|

## Data and isolation notes
(Fixtures needed; which cases must not run in parallel, for example anything calling `api.reset()`.)

## Open questions
(Anything the stories leave unclear. Ask rather than assume.)
