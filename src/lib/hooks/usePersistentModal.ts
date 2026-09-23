"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type Dispatch,
  type SetStateAction,
} from "react";

const MODAL_PARAM = "modal";
const DRAFT_PREFIX = "modal-draft:";
const CHANGE_EVENT = "persistent-modal-change";

function readOpenModals(): string[] {
  if (typeof window === "undefined") return [];
  const raw = new URLSearchParams(window.location.search).get(MODAL_PARAM);
  return raw ? raw.split(",").filter(Boolean) : [];
}

function writeOpenModals(names: string[]) {
  const url = new URL(window.location.href);
  if (names.length) url.searchParams.set(MODAL_PARAM, names.join(","));
  else url.searchParams.delete(MODAL_PARAM);
  window.history.replaceState(window.history.state, "", url.toString());
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function isModalInUrl(name: string): boolean {
  return readOpenModals().includes(name);
}

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("popstate", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("popstate", callback);
  };
}

export function openUrlModal(name: string) {
  const open = readOpenModals();
  if (!open.includes(name)) writeOpenModals([...open, name]);
}

export function closeUrlModal(name: string) {
  const open = readOpenModals();
  if (open.includes(name)) writeOpenModals(open.filter((n) => n !== name));
  clearModalDraft(name);
}

const mountedModals = new Map<string, number>();
let staleSweepArmed = false;

function armStaleSweep() {
  if (staleSweepArmed) return;
  staleSweepArmed = true;
  const sweep = () => {
    window.removeEventListener("pointerdown", sweep, true);
    window.removeEventListener("keydown", sweep, true);
    const open = readOpenModals();
    const stale = open.filter((n) => !mountedModals.get(n));
    if (!stale.length) return;
    writeOpenModals(open.filter((n) => mountedModals.get(n)));
    stale.forEach(clearModalDraft);
  };
  window.addEventListener("pointerdown", sweep, true);
  window.addEventListener("keydown", sweep, true);
}

export function useUrlModal(
  name: string,
): [boolean, Dispatch<SetStateAction<boolean>>] {
  const isOpen = useSyncExternalStore(
    subscribe,
    () => isModalInUrl(name),
    () => false,
  );

  useEffect(() => {
    armStaleSweep();
    mountedModals.set(name, (mountedModals.get(name) ?? 0) + 1);
    return () => {
      const count = (mountedModals.get(name) ?? 1) - 1;
      if (count > 0) mountedModals.set(name, count);
      else mountedModals.delete(name);
    };
  }, [name]);

  const setOpen = useCallback<Dispatch<SetStateAction<boolean>>>(
    (value) => {
      const next =
        typeof value === "function" ? value(isModalInUrl(name)) : value;
      if (next) openUrlModal(name);
      else closeUrlModal(name);
    },
    [name],
  );

  return [isOpen, setOpen];
}

const VALUE_FIELD = "__value";

export function useUrlModalValue<T>(
  name: string,
): [T | null, Dispatch<SetStateAction<T | null>>] {
  const [isOpen, setOpen] = useUrlModal(name);
  const [value, setValue] = useState<T | null>(() => {
    if (typeof window === "undefined" || !isModalInUrl(name)) return null;
    return (readDraft(name)[VALUE_FIELD] as T | undefined) ?? null;
  });
  const latest = useRef(value);

  const setPersistedValue = useCallback<Dispatch<SetStateAction<T | null>>>(
    (action) => {
      const next =
        typeof action === "function"
          ? (action as (p: T | null) => T | null)(latest.current)
          : action;
      latest.current = next;
      setValue(next);
      if (next == null) {
        setOpen(false);
      } else {
        setOpen(true);
        writeDraftField(name, VALUE_FIELD, next);
      }
    },
    [name, setOpen],
  );

  return [isOpen ? value : null, setPersistedValue];
}

function readDraft(name: string): Record<string, unknown> {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_PREFIX + name);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeDraftField(name: string, field: string, value: unknown) {
  try {
    const draft = readDraft(name);
    draft[field] = value;
    window.sessionStorage.setItem(DRAFT_PREFIX + name, JSON.stringify(draft));
  } catch {
    // Storage full / blocked (private mode) — persistence is best-effort.
  }
}

export function hasModalDraft(name: string): boolean {
  if (typeof window === "undefined" || !isModalInUrl(name)) return false;
  return Object.keys(readDraft(name)).length > 0;
}

export function clearModalDraft(name: string) {
  try {
    window.sessionStorage.removeItem(DRAFT_PREFIX + name);
  } catch {
    // ignore
  }
}

export function useModalDraft<T>(
  name: string,
  field: string,
  initial: T | (() => T),
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const fallback =
      typeof initial === "function" ? (initial as () => T)() : initial;
    if (typeof window === "undefined") return fallback;
    if (!isModalInUrl(name)) {
      clearModalDraft(name);
      return fallback;
    }
    const draft = readDraft(name);
    return field in draft ? (draft[field] as T) : fallback;
  });

  const setPersistedValue = useCallback<Dispatch<SetStateAction<T>>>(
    (action) => {
      setValue((prev) => {
        const next =
          typeof action === "function" ? (action as (p: T) => T)(prev) : action;
        if (isModalInUrl(name)) writeDraftField(name, field, next);
        return next;
      });
    },
    [name, field],
  );

  return [value, setPersistedValue];
}
