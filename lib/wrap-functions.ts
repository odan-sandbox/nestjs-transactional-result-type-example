export type Func = (...args: unknown[]) => Promise<unknown>;

export function wrapResultTypeToException(fn: Func) {
  async function wrapped(this: unknown, ...args) {
    const result = await fn.apply(this, args);

    if (result && result.error) {
      throw result.error;
    }

    return result;
  }

  return wrapped;
}

export function wrapExceptionToResultType(fn: Func) {
  async function wrapped(this: unknown, ...args) {
    const result = await fn.apply(this, args).catch((error) => {
      return { error };
    });

    return result;
  }

  return wrapped;
}
