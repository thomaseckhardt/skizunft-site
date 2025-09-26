import normalize from 'normalize-url';

export const normalizeUrl = (url: string, options?: object) => {
  if (typeof url !== 'string') return url;

  return normalize(url, options);
};

export const normalizePath = (url: string) => {
  if (typeof url !== 'string') return url;
  if (url === '') return '/';

  url = addLeadingSlash(url);
  url = addTrailingSlash(url);

  return url;
};

export const addLeadingSlash = (url: string) => {
  if (typeof url !== 'string') return url;
  if (url.startsWith('/') || url.startsWith('http') || url.includes('@')) {
    return url;
  }
  return `/${url}`;
};

export const removeLeadingSlash = (url: string) => {
  if (typeof url !== 'string') return url;
  if (url.startsWith('/')) {
    return url.slice(1);
  }
  return url;
};

export const addTrailingSlash = (url: string) => {
  if (typeof url !== 'string') return url;
  if (url.endsWith('//')) {
    url = url.slice(0, -1);
  }
  if (
    url.endsWith('/') ||
    url.includes('?') ||
    url.includes('#') ||
    url.includes('@')
  ) {
    return url;
  }
  return `${url}/`;
};

export const removeTrailingSlash = (url: string) => {
  if (typeof url !== 'string') return url;
  return url.replace(/\/+$/, '');
};

export const addSlashed = (url: string) => {
  return addTrailingSlash(addLeadingSlash(url));
};
