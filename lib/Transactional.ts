import { wrapInTransaction } from 'typeorm-transactional-cls-hooked';
import { Options } from 'typeorm-transactional-cls-hooked/dist/wrapInTransaction';
import {
  wrapExceptionToResultType,
  wrapResultTypeToException,
} from './wrap-functions';

export function Transactional(options?: Options): MethodDecorator {
  return (
    target: any,
    methodName: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
  ) => {
    const originalMethod = descriptor.value;

    const wrappedMethod = wrapResultTypeToException(originalMethod);
    const unwrappedMethod = wrapExceptionToResultType(
      wrapInTransaction(wrappedMethod, {
        ...options,
        name: methodName,
      }),
    );

    descriptor.value = unwrappedMethod;

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
