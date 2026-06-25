/**
 * makeStubRepo<T>() — generic repository stub for integration tests.
 *
 * Returns a Proxy that throws `Error('not stubbed: <method>')` for any
 * unhandled property access. Callers can override specific methods by
 * spreading a partial:
 *
 *   const repo = makeStubRepo<IPreferenciaRepository>({ findById: vi.fn().mockResolvedValue(...) })
 *
 * This replaces the `as never` casts previously used to silence the
 * type-checker when only a subset of methods was needed. Now drift
 * between test stubs and real interfaces surfaces as a runtime error
 * if a route under test calls an unstubbed method.
 *
 * Regression B.W7.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function makeStubRepo<T extends Record<string, any>>(
  overrides: Partial<T> = {}
): T {
  return new Proxy(overrides, {
    get(target, prop, receiver) {
      if (prop in target) {
        return Reflect.get(target, prop, receiver);
      }
      throw new Error(`makeStubRepo: method "${String(prop)}" is not stubbed. Add an override for it in your test.`);
    },
  }) as unknown as T;
}
