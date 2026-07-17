import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

const localStore = new Map();
const memoryStorage = {
  clear: () => localStore.clear(),
  getItem: (key) => (localStore.has(key) ? localStore.get(key) : null),
  key: (index) => [...localStore.keys()][index] ?? null,
  removeItem: (key) => localStore.delete(key),
  setItem: (key, value) => localStore.set(key, String(value)),
  get length() {
    return localStore.size;
  },
};

Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: memoryStorage,
});

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  cleanup();
  document.head
    .querySelectorAll('script[src*="xlsx-js-style"]')
    .forEach((script) => script.remove());
});
