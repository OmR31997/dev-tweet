import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

function buildApiProxyConfig(apiProxyTarget: string | undefined) {
  const target = apiProxyTarget?.trim().replace(/\/$/, '');
  if (!target || !/^https?:\/\//i.test(target)) return undefined;
  return {
    '/api': {
      target,
      changeOrigin: true,
      secure: true,
      rewrite: (path: string) => {
        const stripped = path.replace(/^\/api/, '');
        return stripped.length > 0 ? stripped : '/';
      },
    },
    '/socket.io': {
      target,
      changeOrigin: true,
      secure: true,
      ws: true,
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const siteUrl = (env.VITE_SITE_URL || 'https://devtweethub.web.app').replace(/\/$/, '');
  const apiProxy = buildApiProxyConfig(env.API_PROXY_TARGET ?? env.VITE_API_PROXY_TARGET);

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'html-site-url',
        transformIndexHtml(html) {
          return html.replaceAll('%SITE_URL%', siteUrl);
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify — file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      ...(apiProxy ? { proxy: apiProxy } : {}),
    },
    preview: {
      ...(apiProxy ? { proxy: apiProxy } : {}),
    },
  };
});
