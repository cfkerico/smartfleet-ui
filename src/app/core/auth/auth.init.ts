import { keycloak } from './keycloak';

export function initKeycloak() {
  return () => {
    // ✅ Protection SSR (important)
    if (typeof window === 'undefined') {
      return Promise.resolve();
    }

    return keycloak.init({
      onLoad: 'check-sso',
      checkLoginIframe: false,
      pkceMethod: 'S256'
    }).then((authenticated) => {

      if (!authenticated) {
        console.warn('User not authenticated');
      }

      // 🔄 Refresh automatique du token
      keycloak.onTokenExpired = () => {
        console.warn('Token expired, refreshing...');

        keycloak.updateToken(30)
          .then((refreshed) => {
            if (refreshed) {
              console.log('Token refreshed');
            } else {
              console.log('Token still valid');
            }
          })
          .catch(() => {
            console.error('Failed to refresh token, redirecting to login');
            keycloak.login();
          });
      };

    }).catch((err) => {
      console.error('Keycloak initialization failed', err);
    });
  };
}