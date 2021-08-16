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

    // result 型の関数 => 例外を throw する関数に変換
    const wrappedMethod = wrapResultTypeToException(originalMethod);

    // 変換した例外を throw する関数をトランザクションを管理する内部関数に渡す
    const inTransactionMethod = wrapInTransaction(wrappedMethod, {
      ...options,
      name: methodName,
    });

    // 例外を throw する関数 => result 型の関数に変換
    const unwrappedMethod = wrapExceptionToResultType(inTransactionMethod);

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
