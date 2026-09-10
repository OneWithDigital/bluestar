import { useMemo, useSyncExternalStore } from 'react';

// The shared site uses native links. A page reload preserves the demo session,
// and popstate also updates these read-only hooks for browser navigation.
function subscribe(listener: () => void) {
  window.addEventListener('popstate', listener);
  return () => window.removeEventListener('popstate', listener);
}

export function usePathname() {
  return useSyncExternalStore(subscribe, () => window.location.pathname, () => '/');
}

export function useSearchParams() {
  const search = useSyncExternalStore(subscribe, () => window.location.search, () => '');
  return useMemo(() => new URLSearchParams(search), [search]);
}
