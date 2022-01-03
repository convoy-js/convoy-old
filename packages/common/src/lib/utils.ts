export function isBigInt(value: unknown): value is bigint {
  return !Number.isSafeInteger(value);
}

export function increment<V extends bigint | number>(val: V): V {
  return (!isBigInt(val) ? ++val : val + BigInt(1)) as V;
}

export function decrement<V extends bigint | number>(val: V): V {
  return (!isBigInt(val) ? --val : val - BigInt(1)) as V;
}

export function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

export const cloneClassInstance = <T>(instance: T): T =>
  Object.assign(Object.create(Object.getPrototypeOf(instance)), instance);
