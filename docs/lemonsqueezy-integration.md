# Lemon Squeezy Integration

## Overview

MovePath Plus uses Lemon Squeezy hosted checkout and the public License API while remaining a static GitHub Pages application.

## Public Configuration

The app expects:

- `VITE_LEMON_CHECKOUT_URL`
- `VITE_LEMON_STORE_ID`
- `VITE_LEMON_PRODUCT_ID`
- `VITE_LEMON_VARIANT_ID`
- `VITE_SUPPORT_EMAIL`

These are public configuration values, not secrets.

## Why This Stays Backend-Free

Checkout is hosted by Lemon Squeezy. Browser activation, validation, and deactivation call the License API directly. No private Lemon Squeezy API key is embedded in the app.

## Hosted Checkout

The current implementation uses this provided checkout URL for every MovePath Plus purchase CTA:

`https://movepath.lemonsqueezy.com/checkout/buy/8c5089a8-7ffc-4307-87f0-ae8b10fd9c59`

The URL itself does not visibly encode "test mode", but Lemon Squeezy’s docs state that test and live products have different checkout URLs and different IDs. Treat this as Test Mode only if it was copied while Lemon Squeezy Test Mode was active.

## License API Endpoints

- `POST https://api.lemonsqueezy.com/v1/licenses/activate`
- `POST https://api.lemonsqueezy.com/v1/licenses/validate`
- `POST https://api.lemonsqueezy.com/v1/licenses/deactivate`

Requests use:

- `Accept: application/json`
- `Content-Type: application/x-www-form-urlencoded`

## Browser-Level CORS Verification

Date verified: `2026-07-27`

Result:

- A real headless Microsoft Edge browser loaded the app origin at `http://127.0.0.1:4173`.
- From that page origin, a `POST` request to `https://api.lemonsqueezy.com/v1/licenses/validate` with an invalid key completed normally.
- The browser exposed an HTTP `404` response with JSON body `{"valid":false,"error":"license_key not found."}`.
- Because the request returned a normal fetch response instead of a browser CORS exception, direct browser calls from the frontend origin were allowed in this validation run.

## Offline Grace Policy

- Plus remains available for up to seven days after a successful activation and validation.
- The app revalidates on open when the last successful validation is older than 24 hours.
- Premium calendar export and premium print trigger validation before use.
- Definitive invalid, disabled, expired, or mismatched responses revoke access immediately.

## Test Mode Procedure

1. Obtain the test checkout URL from Lemon Squeezy Share.
2. Configure the test store, product, and variant IDs.
3. Run or deploy the app.
4. Complete a test purchase.
5. Confirm that Lemon Squeezy generates a license key.
6. Activate MovePath Plus with purchase email and license key.
7. Refresh and confirm persistence.
8. Validate on another browser.
9. Test the activation limit.
10. Deactivate one browser and restore another.
11. Disable the test license and confirm access revocation after validation.

Do not use real card details in Test Mode.

## Live Mode Later

Test and live products use different IDs and different checkout URLs. Do not promote the current configuration to Live Mode by changing copy alone. Replace all IDs and the checkout URL with the live equivalents and repeat the validation cycle.
