import { wrapInTransaction } from 'typeorm-transactional-cls-hooked';
import { Options } from 'typeorm-transactional-cls-hooked/dist/wrapInTransaction';

type Func = (...args: unknown[]) => Promise<unknown>;

function wrapMethod(fn: Func) {
  async function wrapped(this: unknown, ...args) {
    console.log('wrapMethod - this', this, fn, args);
    const result = await fn.apply(this, args);

    if (result && result.error) {
      throw result.error;
    }

    return result;
  }

  return wrapped;
}

function unwrapMethod(fn: Func) {
  async function unwrapped(this: unknown, ...args) {
    console.log('unwrapMethod - this', this, fn, args);
    const result = await fn.apply(this, args).catch((error) => {
      return { error };
    });

    return result;
  }

  return unwrapped;
}

export function Transactional(): MethodDecorator {
  return (
    target: any,
    methodName: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
  ) => {
    const originalMethod = descriptor.value;

    console.log({ target, methodName, descriptor });

    const wrappedMethod = wrapMethod(originalMethod);

    descriptor.value = unwrapMethod(
      wrapInTransaction(wrappedMethod, {
        name: methodName,
      }),
    );

    Reflect.getMetadataKeys(originalMethod).forEach((previousMetadataKey) => {
      const previousMetadata = Reflect.getMetadata(
        previousMetadataKey,
        originalMethod,
      );
      Reflect.defineMetadata(
        previousMetadataKey,
        previousMetadata,
        descriptor.value,
      );
    });

    Object.defineProperty(descriptor.value, 'name', {
      value: originalMethod.name,
      writable: false,
    });
  };
}
