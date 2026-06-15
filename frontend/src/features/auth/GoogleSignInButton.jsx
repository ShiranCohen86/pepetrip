import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { configApi } from '../../services/configApi.js';
import { loginWithGoogle } from './authSlice.js';
import { Spinner } from '../../components/ui';
import { useTranslation } from '../../i18n';

let scriptPromise = null;
function loadGsi() {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Google sign-in'));
    document.head.appendChild(s);
    return undefined;
  });
  return scriptPromise;
}

export function GoogleSignInButton() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const ref = useRef(null);
  const [errorKey, setErrorKey] = useState(null);
  const { data: config, isLoading } = useQuery({ queryKey: ['config'], queryFn: configApi.get });
  const clientId = config?.googleClientId;

  useEffect(() => {
    if (!clientId || !ref.current) return undefined;
    const container = ref.current;
    let cancelled = false;

    loadGsi()
      .then(() => {
        if (cancelled || !container) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (resp) => dispatch(loginWithGoogle(resp.credential)),
        });
        // Clear any button GSI rendered on a previous effect run before
        // re-rendering. Otherwise a second renderButton() stacks another GSI
        // iframe and orphans the first one's window — clicking then throws
        // "Cannot read properties of null (reading 'postMessage')" from GSI.
        container.innerHTML = '';
        window.google.accounts.id.renderButton(container, {
          theme: 'filled_blue',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          width: 280,
        });
      })
      .catch(() => setErrorKey('login.googleLoadError'));

    return () => {
      cancelled = true;
      // Dismiss any pending GSI prompt/flow tied to this mount.
      window.google?.accounts?.id?.cancel?.();
    };
    // Depend on the primitive clientId, not the `config` object — React Query
    // hands back a new object reference on every refocus refetch, which would
    // otherwise re-run this effect needlessly.
  }, [clientId, dispatch]);

  if (isLoading) return <Spinner />;
  if (!config?.googleClientId) {
    return (
      <p className="muted" style={{ maxWidth: '34ch' }}>
        {t('login.googleNotConfigured')}
      </p>
    );
  }
  return (
    <div className="stack" style={{ alignItems: 'center' }}>
      <div ref={ref} />
      {errorKey && <p className="field__error">{t(errorKey)}</p>}
    </div>
  );
}
