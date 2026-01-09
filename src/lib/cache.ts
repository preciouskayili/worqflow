type CacheEntry<T> = {
  value: T;
  expiresAt?: number;
};

export default class Cache<T> {
  private cache = new Map<string, CacheEntry<T>>();

  set(key: string, value: T, ttlMs?: number) {
    this.cache.set(key, {
      value,
      expiresAt: ttlMs ? Date.now() + ttlMs : undefined,
    });
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) return undefined;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}
