const DEFAULT_TEST_CHECKOUT_URL =
  'https://movepath.lemonsqueezy.com/checkout/buy/8c5089a8-7ffc-4307-87f0-ae8b10fd9c59'
const DEFAULT_SUPPORT_EMAIL = 'abdulla11099@gmail.com'

export type MonetizationConfig = {
  checkoutUrl: string
  supportEmail: string
  storeId: string
  productId: string
  variantId: string
  isConfigured: boolean
  missing: string[]
  isTestModeUrl: boolean
}

export function getMonetizationConfig(): MonetizationConfig {
  const checkoutUrl =
    normalizeString(import.meta.env.VITE_LEMON_CHECKOUT_URL) || DEFAULT_TEST_CHECKOUT_URL
  const storeId = normalizeNumericId(import.meta.env.VITE_LEMON_STORE_ID)
  const productId = normalizeNumericId(import.meta.env.VITE_LEMON_PRODUCT_ID)
  const variantId = normalizeNumericId(import.meta.env.VITE_LEMON_VARIANT_ID)
  const supportEmail = normalizeString(import.meta.env.VITE_SUPPORT_EMAIL)

  const missing = [
    !storeId ? 'VITE_LEMON_STORE_ID' : null,
    !productId ? 'VITE_LEMON_PRODUCT_ID' : null,
    !variantId ? 'VITE_LEMON_VARIANT_ID' : null,
    !supportEmail ? 'VITE_SUPPORT_EMAIL' : null,
  ].filter(Boolean) as string[]

  return {
    checkoutUrl,
    supportEmail: supportEmail || DEFAULT_SUPPORT_EMAIL,
    storeId,
    productId,
    variantId,
    isConfigured: missing.length === 0,
    missing,
    isTestModeUrl: checkoutUrl === DEFAULT_TEST_CHECKOUT_URL,
  }
}

export const monetizationConfig = getMonetizationConfig()

function normalizeString(value: string | undefined) {
  return value?.trim() ?? ''
}

function normalizeNumericId(value: string | undefined) {
  return normalizeString(value).replace(/^#/, '')
}
