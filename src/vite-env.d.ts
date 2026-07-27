/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LEMON_CHECKOUT_URL?: string
  readonly VITE_LEMON_STORE_ID?: string
  readonly VITE_LEMON_PRODUCT_ID?: string
  readonly VITE_LEMON_VARIANT_ID?: string
  readonly VITE_SUPPORT_EMAIL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
