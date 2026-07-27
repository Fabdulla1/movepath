# MovePath

MovePath is a static React application for U.S. citizens moving from the United States to Germany. MovePath Plus adds paid premium features while staying fully backend-free and GitHub Pages compatible.

## Current Route

MovePath currently supports one relocation route: United States to Germany.

## Stack

- React, TypeScript, Vite
- Vitest and jsdom
- ESLint and Oxlint
- Plain CSS
- GitHub Actions and GitHub Pages
- Lemon Squeezy hosted checkout plus License API

## Local Development

```bash
npm ci
npm run dev
```

## Checks

```bash
npm run lint
npm run typecheck
npm test -- --run
npm run build
```

## MovePath Plus Architecture

MovePath Plus remains backend-free. The app uses:

- Lemon Squeezy hosted checkout for purchase
- Lemon Squeezy License API for activate, validate, and deactivate
- Browser-only local storage for entitlements, custom tasks, and assignments
- Client-side feature gates through a shared entitlement interface

No private API keys, bearer tokens, webhooks, or databases are used in the frontend.

## Required Vite Variables

See [.env.example](C:/Users/Farhan/Desktop/expat/.env.example).

- `VITE_LEMON_CHECKOUT_URL`
- `VITE_LEMON_STORE_ID`
- `VITE_LEMON_PRODUCT_ID`
- `VITE_LEMON_VARIANT_ID`
- `VITE_SUPPORT_EMAIL`

The provided checkout URL is currently treated as the configured Test Mode checkout link. Test and live products use different IDs and different checkout URLs.

## Hosted Checkout Integration

All "Unlock MovePath Plus" buttons open the configured Lemon Squeezy hosted checkout URL. The app does not use the overlay checkout in this phase, does not append license data to the URL, and does not unlock Plus based on redirects or URL parameters.

## Activation, Validation, and Deactivation

- Activation requires purchase email and license key.
- Restoration after clearing browser data uses the same activation flow. Customers can retrieve purchase and license details from Lemon Squeezy My Orders.
- Validation runs after activation, on app open when the last successful validation is older than 24 hours, and before premium export or premium print.
- Deactivation removes the local entitlement only after Lemon Squeezy confirms success, unless the user explicitly clears local license data.
- Reset relocation plan clears questionnaire answers, checklist progress, custom tasks, and household assignments while preserving the saved Plus license on that browser.
- Deactivate Plus and erase all data first attempts to release the browser activation in Lemon Squeezy, then clears both relocation data and local license data.

An offline grace period of seven days is available only after a previous successful activation and validation.

## Security Limitations

MovePath Plus uses client-side feature gates. That means the UI and local checks can improve access control for a static site, but they are not equivalent to a server-enforced entitlement system. License keys are stored locally after activation because the app has no backend.

Clearing browser cookies and site data or local storage removes MovePath's local activation record. The Lemon Squeezy purchase remains valid, but clearing local data before remote deactivation may leave an activation counted toward the five-device limit. Customers can restore access with their purchase email and license key, and support can help with abandoned activation slots.

## Test Mode

Keep the first implementation and validation cycle in Lemon Squeezy Test Mode.

1. Configure the Test Mode store, product, and variant IDs.
2. Use the provided Test Mode checkout URL.
3. Complete a test purchase and collect the generated license key.
4. Activate the license on `https://movepath.online/#activate`.
5. Validate premium access, refresh persistence, activation limits, deactivation, and restore flow.
6. Confirm a normal relocation-plan reset preserves Plus access.
7. Confirm full erase deactivates remotely before clearing local data.

Do not switch to Live Mode until a separate live product, live variant, and live checkout URL exist.

## Moving To Live Mode Later

When the paid flow is approved:

1. Copy the test product to Live Mode in Lemon Squeezy.
2. Replace checkout URL, store ID, product ID, and variant ID with live values.
3. Re-run checkout, activation, validation, restore, and deactivation tests.

## Legal Copy

The app keeps legal and contact copy neutral until the project has confirmed operator details. It does not invent a legal entity name, street address, or phone number.

## Troubleshooting

- If activation is disabled, confirm that all `VITE_LEMON_*` IDs are configured.
- If a purchase succeeds but Plus does not unlock, activate the browser with purchase email and license key.
- If premium access disappears after time offline, refresh validation while online.
- If GitHub Actions fails on `npm ci`, verify that `package-lock.json` is committed and in sync with `package.json`.
