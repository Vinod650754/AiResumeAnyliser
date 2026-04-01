const rawApiBase =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000';

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

export const API_BASE_URL = (() => {
  const normalized = trimTrailingSlash(rawApiBase);
  return normalized.endsWith('/api') ? normalized : `${normalized}/api`;
})();

console.log('API BASE:', API_BASE_URL);
