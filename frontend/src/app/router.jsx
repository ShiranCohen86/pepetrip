import { createBrowserRouter } from 'react-router-dom';
import AppShell from '../layouts/AppShell.jsx';
import ProtectedRoute from '../features/auth/ProtectedRoute.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import CreateTripPage from '../pages/CreateTripPage.jsx';
import TripDetailPage from '../pages/TripDetailPage.jsx';
import StatsPage from '../pages/StatsPage.jsx';
import SettingsPage from '../pages/SettingsPage.jsx';
import AdminPage from '../pages/AdminPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import SharedTripPage from '../pages/SharedTripPage.jsx';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/shared/:token', element: <SharedTripPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/trips/new', element: <CreateTripPage /> },
          { path: '/trips/:id', element: <TripDetailPage /> },
          { path: '/world', element: <StatsPage /> },
          { path: '/settings', element: <SettingsPage /> },
          { path: '/admin', element: <AdminPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
