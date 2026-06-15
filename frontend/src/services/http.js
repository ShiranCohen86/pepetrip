import axios from 'axios';

const baseURL = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1`;

export const http = axios.create({ baseURL, withCredentials: true });

// Auth handlers are registered by the store so this module stays store-agnostic.
let getToken = () => null;
let refresh = null;
let onAuthFail = () => {};

export function registerAuth(handlers) {
  getToken = handlers.getToken ?? getToken;
  refresh = handlers.refresh ?? refresh;
  onAuthFail = handlers.onAuthFail ?? onAuthFail;
}

http.interceptors.request.use((cfg) => {
  const token = getToken();
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

/** Normalize the API error envelope into a plain Error with code/status/details. */
function toApiError(error) {
  const data = error.response?.data?.error;
  const err = new Error(data?.message || error.message || 'Request failed');
  err.code = data?.code;
  err.status = error.response?.status;
  err.details = data?.details;
  return err;
}

let refreshing = null;

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { response, config } = error;
    const isAuthRoute = config?.url?.includes('/auth/');

    if (response?.status === 401 && refresh && !config.__retried && !isAuthRoute) {
      config.__retried = true;
      try {
        refreshing = refreshing || refresh();
        const newToken = await refreshing;
        refreshing = null;
        config.headers.Authorization = `Bearer ${newToken}`;
        return http(config);
      } catch (refreshErr) {
        refreshing = null;
        onAuthFail();
        return Promise.reject(toApiError(refreshErr));
      }
    }
    return Promise.reject(toApiError(error));
  },
);

/** Unwrap the `{ data }` envelope. */
export const unwrap = (promise) => promise.then((res) => res.data.data);
