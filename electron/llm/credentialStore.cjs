const path = require("path");

const PROVIDERS = new Set(["openai", "anthropic", "openrouter"]);

class CredentialStoreError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "CredentialStoreError";
    this.code = code;
  }
}

function createCredentialStore({
  safeStorage,
  filePath,
  fsPromises,
  platform = process.platform,
}) {
  if (!safeStorage || !filePath || !fsPromises) throw new Error("Credential store dependencies are required.");

  function assertProvider(provider) {
    if (!PROVIDERS.has(provider)) {
      throw new CredentialStoreError("invalid_provider", "That AI provider is not supported.");
    }
  }

  function assertSecureStorage() {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new CredentialStoreError(
        "secure_storage_unavailable",
        "Secure operating-system credential storage is unavailable.",
      );
    }
    if (
      platform === "linux" &&
      typeof safeStorage.getSelectedStorageBackend === "function" &&
      safeStorage.getSelectedStorageBackend() === "basic_text"
    ) {
      throw new CredentialStoreError(
        "secure_storage_unavailable",
        "A secure Linux credential backend is unavailable.",
      );
    }
  }

  async function readFile() {
    try {
      const contents = await fsPromises.readFile(filePath, "utf8");
      const parsed = JSON.parse(contents);
      return parsed && parsed.version === 1 && parsed.credentials && typeof parsed.credentials === "object"
        ? parsed
        : { version: 1, credentials: {} };
    } catch (error) {
      if (error?.code === "ENOENT") return { version: 1, credentials: {} };
      if (error instanceof SyntaxError) {
        throw new CredentialStoreError("credential_store_corrupt", "The encrypted credential store is unreadable.");
      }
      throw new CredentialStoreError("credential_store_read_failed", "The encrypted credential store could not be read.");
    }
  }

  async function writeFile(data) {
    const directory = path.dirname(filePath);
    const temporaryPath = `${filePath}.tmp`;
    try {
      await fsPromises.mkdir(directory, { recursive: true, mode: 0o700 });
      await fsPromises.writeFile(temporaryPath, `${JSON.stringify(data)}\n`, { encoding: "utf8", mode: 0o600 });
      await fsPromises.rename(temporaryPath, filePath);
      if (typeof fsPromises.chmod === "function") await fsPromises.chmod(filePath, 0o600);
    } catch {
      throw new CredentialStoreError("credential_store_write_failed", "The encrypted credential store could not be updated.");
    }
  }

  async function encrypt(value) {
    if (typeof safeStorage.encryptStringAsync === "function") return safeStorage.encryptStringAsync(value);
    return safeStorage.encryptString(value);
  }

  async function decrypt(value) {
    if (typeof safeStorage.decryptStringAsync === "function") return safeStorage.decryptStringAsync(value);
    return safeStorage.decryptString(value);
  }

  return {
    async status() {
      const data = await readFile();
      return Object.fromEntries([...PROVIDERS].map((provider) => [provider, Boolean(data.credentials[provider])]));
    },

    async set(provider, credential) {
      assertProvider(provider);
      assertSecureStorage();
      if (typeof credential !== "string" || credential.trim().length < 8 || credential.length > 10000) {
        throw new CredentialStoreError("invalid_credential", "Enter a valid API key.");
      }
      const data = await readFile();
      const encrypted = await encrypt(credential.trim());
      data.credentials[provider] = Buffer.from(encrypted).toString("base64");
      await writeFile(data);
      return { configured: true };
    },

    async get(provider) {
      assertProvider(provider);
      assertSecureStorage();
      const data = await readFile();
      const encoded = data.credentials[provider];
      if (!encoded) {
        throw new CredentialStoreError("missing_credential", "Configure an API key for this provider first.");
      }
      try {
        return await decrypt(Buffer.from(encoded, "base64"));
      } catch {
        throw new CredentialStoreError("credential_decrypt_failed", "The saved API key could not be decrypted.");
      }
    },

    async delete(provider) {
      assertProvider(provider);
      const data = await readFile();
      delete data.credentials[provider];
      await writeFile(data);
      return { configured: false };
    },
  };
}

module.exports = { CredentialStoreError, createCredentialStore };

