import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { configApi } from '../../services/configApi.js';
import { loginWithGoogle } from './authSlice.js';
import { Spinner } from '../../components/ui';

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
  const dispatch = useDispatch();
  const ref = useRef(null);
  const [error, setError] = useState(null);
  const { data: config, isLoading } = useQuery({ queryKey: ['config'], queryFn: configApi.get });

  useEffect(() => {
    const clientId = config?.googleClientId;
    if (!clientId || !ref.current) return undefined;
    let cancelled = false;

    loadGsi()
      .then(() => {
        if (cancelled || !ref.current) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (resp) => dispatch(loginWithGoogle(resp.credential)),
        });
        window.google.accounts.id.renderButton(ref.current, {
          theme: 'filled_blue',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          width: 280,
        });
      })
      .catch(() => setError('Could not load Google sign-in. Check your connection.'));

    return () => {
      cancelled = true;
    };
  }, [config, dispatch]);

  if (isLoading) return <Spinner />;
  if (!config?.googleClientId) {
    return (
      <p className="muted" style={{ maxWidth: '34ch' }}>
        Google sign-in isn’t configured yet. Set <code>GOOGLE_CLIENT_ID</code> on the server.
      </p>
    );
  }
  return (
    <div className="stack" style={{ alignItems: 'center' }}>
      <div ref={ref} />
      {error && <p className="field__error">{error}</p>}
    </div>
  );
}
