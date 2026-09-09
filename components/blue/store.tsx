'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { seed, localDate, type State } from '@/lib/demo-model';
type API = {
  state: State;
  transact: <T>(fn: (draft: State) => T) => T;
  reset: () => void;
};
const Context = createContext<API | null>(null);
const key = 'blue-star-barns-demo-v3';
export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State | null>(null);
  const current = useRef<State | null>(null);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    let initial = seed();
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.version === 3 && saved.seedDay === localDate())
          initial = saved;
      }
    } catch {
      setStorageError(true);
    }
    current.current = initial;
    setState(initial);
  }, []);
  function commit(next: State) {
    current.current = next;
    try {
      sessionStorage.setItem(key, JSON.stringify(next));
    } catch {
      setStorageError(true);
    }
    setState(next);
  }
  function transact<T>(fn: (draft: State) => T): T {
    if (!current.current)
      throw Error('The demo is loading. Try again in a moment.');
    const draft = structuredClone(current.current);
    const result = fn(draft);
    draft.revision++;
    commit(draft);
    return result;
  }
  if (!state)
    return (
      <div className="demo-loading" role="status">
        Preparing the sample fleet…
      </div>
    );
  return (
    <Context.Provider value={{ state, transact, reset: () => commit(seed()) }}>
      {storageError && (
        <div className="error">
          Browser storage is unavailable. Changes last until this page reloads.
        </div>
      )}
      {children}
    </Context.Provider>
  );
}
export function useDemo() {
  const ctx = useContext(Context);
  if (!ctx) throw Error('Demo context missing');
  return ctx;
}
