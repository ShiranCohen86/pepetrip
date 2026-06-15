/**
 * Resolve a stored media path (e.g. "/uploads/x.png") to a loadable URL.
 * Same-origin in prod; in dev the Vite proxy forwards /uploads to the API.
 */
export const mediaUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//.test(url)) return url;
  return `${import.meta.env.VITE_API_BASE_URL ?? ''}${url}`;
};
