import { configureStore } from '@reduxjs/toolkit';
import authReducer, { setCredentials, clearAuth } from '../features/auth/authSlice.js';
import uiReducer from '../features/ui/uiSlice.js';
import { registerAuth } from '../services/http.js';
import { authApi } from '../services/authApi.js';

export const store = configureStore({
  reducer: { auth: authReducer, ui: uiReducer },
});

// Wire the axios interceptor to the store (token read + transparent refresh).
registerAuth({
  getToken: () => store.getState().auth.accessToken,
  refresh: async () => {
    const data = await authApi.refresh();
    store.dispatch(setCredentials(data));
    return data.accessToken;
  },
  onAuthFail: () => store.dispatch(clearAuth()),
});
