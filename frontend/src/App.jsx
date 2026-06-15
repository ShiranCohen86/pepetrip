import { RouterProvider } from 'react-router-dom';
import { router } from './app/router.jsx';
import { useThemeEffect } from './hooks/useTheme.js';
import { useAuthBootstrap } from './features/auth/useAuthBootstrap.js';
import { ToastProvider } from './components/ui';
import { DeviceProvider } from './hooks/responsive';
import { LocaleProvider } from './i18n';

export default function App() {
  useThemeEffect();
  useAuthBootstrap();
  return (
    <LocaleProvider>
      <DeviceProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </DeviceProvider>
    </LocaleProvider>
  );
}
