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

export function Transactional(): MethodDecorator {
  return (
    target: any,
    methodName: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
  ) => {
    const originalMethod = descriptor.value;

    console.log({ target, methodName, descriptor });
    console.log('this', this);
    console.log(originalMethod);

    const wrappedMethod = wrapMethod(originalMethod);

    descriptor.value = wrapInTransaction(wrappedMethod, {
      name: methodName,
    });

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
