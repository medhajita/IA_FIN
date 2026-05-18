export const FINCOACH_DATA_CHANGED = 'fincoach:data-changed';

export function notifyDataChanged(detail = {}) {
  window.dispatchEvent(new CustomEvent(FINCOACH_DATA_CHANGED, { detail }));
}

export function subscribeDataChanged(callback) {
  window.addEventListener(FINCOACH_DATA_CHANGED, callback);
  return () => window.removeEventListener(FINCOACH_DATA_CHANGED, callback);
}
