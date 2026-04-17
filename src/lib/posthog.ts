import posthog from 'posthog-js';

export function initPostHog() {
  posthog.init('phc_D5H6jyLiPti5o9iyhv3EcS74RKNLWhgEQzsje6L3R4Kv', {
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
