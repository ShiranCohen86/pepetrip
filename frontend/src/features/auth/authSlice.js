import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../services/authApi.js';

/** Silent session restore on app load (uses the refresh cookie). */
export const bootstrapAuth = createAsyncThunk('auth/bootstrap', () => authApi.refresh());

export const loginWithGoogle = createAsyncThunk('auth/login', (credential) =>
  authApi.googleLogin(credential),
);

export const loginDemo = createAsyncThunk('auth/demo', () => authApi.devLogin());

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await authApi.logout();
  } catch {
    /* ignore — clear client state regardless */
  }
});

const authSlice = createSlice({
  name: 'auth',
  // status: 'loading' | 'authenticated' | 'unauthenticated'
  initialState: { user: null, accessToken: null, status: 'loading' },
  reducers: {
    setCredentials(state, { payload }) {
      state.user = payload.user;
      state.accessToken = payload.accessToken;
      state.status = 'authenticated';
    },
    clearAuth(state) {
      state.user = null;
      state.accessToken = null;
      state.status = 'unauthenticated';
    },
    setUser(state, { payload }) {
      state.user = payload;
    },
  },
  extraReducers: (builder) => {
    const authenticate = (state, { payload }) => {
      state.user = payload.user;
      state.accessToken = payload.accessToken;
      state.status = 'authenticated';
    };
    const deauthenticate = (state) => {
      state.user = null;
      state.accessToken = null;
      state.status = 'unauthenticated';
    };
    builder
      .addCase(bootstrapAuth.fulfilled, authenticate)
      .addCase(bootstrapAuth.rejected, deauthenticate)
      .addCase(loginWithGoogle.fulfilled, authenticate)
      .addCase(loginDemo.fulfilled, authenticate)
      .addCase(logout.fulfilled, deauthenticate);
  },
});

export const { setCredentials, clearAuth, setUser } = authSlice.actions;
export default authSlice.reducer;

export const selectAuth = (s) => s.auth;
export const selectUser = (s) => s.auth.user;
export const selectAuthStatus = (s) => s.auth.status;
