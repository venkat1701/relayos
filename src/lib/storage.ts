type StorageValue = string | null;

class MemoryStorageFallback {
  private readonly values = new Map<string, string>();

  getItem(key: string): StorageValue {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

const memoryStorage = new MemoryStorageFallback();

function getBrowserStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storage = window.localStorage;
    const probeKey = "__relayos_storage_probe__";
    storage.setItem(probeKey, "1");
    storage.removeItem(probeKey);
    return storage;
  } catch {
    return null;
  }
}

export function getStoredValue(key: string): StorageValue {
  const storage = getBrowserStorage();
  if (storage) {
    try {
      return storage.getItem(key);
    } catch {
      return memoryStorage.getItem(key);
    }
  }
  return memoryStorage.getItem(key);
}

export function setStoredValue(key: string, value: string): void {
  const storage = getBrowserStorage();
  if (storage) {
    try {
      storage.setItem(key, value);
      return;
    } catch {
      // Fall through to memory storage.
    }
  }
  memoryStorage.setItem(key, value);
}

export function removeStoredValue(key: string): void {
  const storage = getBrowserStorage();
  if (storage) {
    try {
      storage.removeItem(key);
    } catch {
      // Ignore and fall back.
    }
  }
  memoryStorage.removeItem(key);
}
