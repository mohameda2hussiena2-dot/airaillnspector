export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? window.location.origin : '');

if (!API_URL && !import.meta.env.DEV && typeof window !== 'undefined') {
  console.warn('VITE_API_URL is not set. API requests will likely fail in production.');
}

export const getApiUrl = (path: string) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${cleanPath}`;
};
