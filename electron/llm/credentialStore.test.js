import { describe, expect, it, vi } from "vitest";
import { Buffer } from "node:buffer";
import credentialStoreModule from "./credentialStore.cjs";

const { createCredentialStore } = credentialStoreModule;

function harness(overrides = {}) {
  let file;
  const fsPromises = {
    readFile: vi.fn(async () => {
      if (file === undefined) throw Object.assign(new Error("missing"), { code: "ENOENT" });
      return file;
    }),
    mkdir: vi.fn(async () => {}),
    writeFile: vi.fn(async (_path, contents) => {
      file = contents;
    }),
    rename: vi.fn(async () => {}),
    chmod: vi.fn(async () => {}),
  };
  const safeStorage = {
    isEncryptionAvailable: () => true,
    encryptStringAsync: vi.fn(async (value) => Buffer.from(`encrypted:${value}`)),
    decryptStringAsync: vi.fn(async (buffer) => buffer.toString().replace(/^encrypted:/, "")),
    getSelectedStorageBackend: () => "kwallet",
  };
  const store = createCredentialStore({
    safeStorage,
    fsPromises,
    filePath: "/private/app/llm-credentials.json",
    platform: "darwin",
    ...overrides,
  });
  return { store, fsPromises, safeStorage, getFile: () => file, setFile: (value) => { file = value; } };
}

describe("encrypted credential store", () => {
  it("stores only an encrypted blob and round-trips the key", async () => {
    const { store, getFile } = harness();
    await expect(store.set("openai", "sk-secret-value")).resolves.toEqual({ configured: true });
    expect(getFile()).not.toContain("sk-secret-value");
    await expect(store.get("openai")).resolves.toBe("sk-secret-value");
    await expect(store.status()).resolves.toEqual({ openai: true, anthropic: false, openrouter: false });
  });

  it("replaces and deletes a credential", async () => {
    const { store, getFile } = harness();
    await store.set("anthropic", "first-secret");
    await store.set("anthropic", "second-secret");
    await expect(store.get("anthropic")).resolves.toBe("second-secret");
    await expect(store.delete("anthropic")).resolves.toEqual({ configured: false });
    expect(getFile()).not.toContain("second-secret");
    await expect(store.get("anthropic")).rejects.toMatchObject({ code: "missing_credential" });
  });

  it("fails closed when encryption is unavailable", async () => {
    const { store } = harness({ safeStorage: { isEncryptionAvailable: () => false } });
    await expect(store.set("openai", "sk-secret-value")).rejects.toMatchObject({ code: "secure_storage_unavailable" });
  });

  it("rejects Linux basic_text fallback", async () => {
    const safeStorage = {
      isEncryptionAvailable: () => true,
      getSelectedStorageBackend: () => "basic_text",
    };
    const { store } = harness({ safeStorage, platform: "linux" });
    await expect(store.set("openrouter", "sk-secret-value")).rejects.toMatchObject({ code: "secure_storage_unavailable" });
  });

  it("reports corrupt storage without leaking its contents", async () => {
    const { store, setFile } = harness();
    setFile("{contains-secret: nope");
    await expect(store.status()).rejects.toMatchObject({ code: "credential_store_corrupt", message: "The encrypted credential store is unreadable." });
  });
});
