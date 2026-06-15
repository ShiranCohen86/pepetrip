import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectAuthStatus } from '../features/auth/authSlice.js';
import { GoogleSignInButton } from '../features/auth/GoogleSignInButton.jsx';
import { DemoLoginButton } from '../features/auth/DemoLoginButton.jsx';

export default function LoginPage() {
  const status = useSelector(selectAuthStatus);
  if (status === 'authenticated') return <Navigate to="/" replace />;

  return (
    <div className="login">
      <div className="login__logo" aria-hidden="true">
        🧭
      </div>
      <div className="stack" style={{ gap: '0.5rem' }}>
        <h1 className="login__title">PepeTrip</h1>
        <p className="login__tagline">
          Plan your next trip in seconds with an AI travel planner. Sign in to get started.
        </p>
      </div>
      <GoogleSignInButton />
      <DemoLoginButton />
      {status === 'loading' && <p className="muted">Checking your session…</p>}
    </div>
  );
}
