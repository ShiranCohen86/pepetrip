import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { selectAuthStatus } from './authSlice.js';
import { Spinner } from '../../components/ui';

export default function ProtectedRoute() {
  const status = useSelector(selectAuthStatus);
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="splash">
        <Spinner size="lg" />
        <p>Loading your trips…</p>
      </div>
    );
  }
  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
