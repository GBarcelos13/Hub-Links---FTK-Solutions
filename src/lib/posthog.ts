import posthog from 'posthog-js';

export function initPostHog() {
  const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
  if (!key) return; // analytics disabled if key not set
  posthog.init(key, {
    api_host: 'https://us.i.posthog.com',
    // Desabilita captura automática — faremos via useLocation para SPA
    capture_pageview: false,
    // Captura de cliques e inputs automaticamente
    autocapture: true,
    // Persistência via localStorage
    persistence: 'localStorage',
  });
}

export { posthog };
