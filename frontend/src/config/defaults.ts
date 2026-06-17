/** Shared local-dev defaults — imported by `env.ts` and `next.config.ts`. */
export const DEFAULT_API_ORIGIN = "http://localhost:4000";
export const DEFAULT_APP_ORIGIN = "http://localhost:3000";
export const DEFAULT_API_PREFIX = "/api";

/** Production ingress fallback when deploying behind AWS (override with API_URL). */
export const DEFAULT_INGRESS_ORIGIN =
  "http://k8s-ingressn-ingressn-a7b587dfee-d7fa6c49f98c4941.elb.ap-south-1.amazonaws.com:80";
