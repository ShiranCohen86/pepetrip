import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { configApi } from '../../services/configApi.js';
import { loginDemo } from './authSlice.js';
import { Button } from '../../components/ui';

/** One-click demo sign-in. Only rendered when the server enables dev login. */
export function DemoLoginButton() {
  const dispatch = useDispatch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const { data: config } = useQuery({ queryKey: ['config'], queryFn: configApi.get });

  if (!config?.devLogin) return null;

  const onClick = async () => {
    setBusy(true);
    setError(null);
    try {
      await dispatch(loginDemo()).unwrap();
    } catch (e) {
      setError(e?.message || 'Demo login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="stack" style={{ alignItems: 'center', gap: '0.4rem' }}>
      <Button variant="primary" onClick={onClick} loading={busy}>
        🧭 Try the demo
      </Button>
      <span className="muted" style={{ fontSize: '0.78rem' }}>
        No account needed · dev only
      </span>
      {error && <p className="field__error">{error}</p>}
    </div>
  );
}
