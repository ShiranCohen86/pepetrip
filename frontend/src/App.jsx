import { RouterProvider } from 'react-router-dom';
import { router } from './app/router.jsx';
import { useThemeEffect } from './hooks/useTheme.js';
import { useAuthBootstrap } from './features/auth/useAuthBootstrap.js';
import { ToastProvider } from './components/ui';

export default function App() {
  useThemeEffect();
  useAuthBootstrap();
  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
}
