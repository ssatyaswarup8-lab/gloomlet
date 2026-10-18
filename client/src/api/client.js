
export { API } from './paths.js';

const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  const externalSignal = options.signal;
  const abortFromExternal = () => controller.abort();

  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener('abort', abortFromExternal, { once: true });
  }

  try {
    const response = await fetch(`${BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(body.error || `Request failed (${response.status})`);
    }

    return body;
  } catch (error) {
    if (error.name === 'AbortError') {
      if (externalSignal?.aborted) throw error;
      throw new Error('The request took too long. Please try again.');
    }

    if (error instanceof TypeError) {
      throw new Error('Pip’s server is taking a nap. Check that the backend is running.');
    }

    throw error;
  } finally {
    clearTimeout(timeout);
    externalSignal?.removeEventListener('abort', abortFromExternal);
  }
}

export const get = (path, options = {}) => request(path, options);

export const post = (path, body, options = {}) =>
  request(path, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
  });
