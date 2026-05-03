/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  /** Optional; prefer API_PROXY_TARGET in env (not bundled) for vite.config proxy target. */
  readonly VITE_API_PROXY_TARGET?: string;
  /** Public origin without trailing slash (SEO: canonical, OG, JSON-LD). */
  readonly VITE_SITE_URL?: string;
}
