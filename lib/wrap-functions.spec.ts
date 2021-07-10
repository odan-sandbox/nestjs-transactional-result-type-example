import {
  wrapExceptionToResultType,
  wrapResultTypeToException,
} from './wrap-functions';

class ForTest {
  public error = new Error('hoge');
  async returnResultType() {
    return { error: this.error };
  }

  async throwException() {
    throw this.error;
  }
}

describe('wrap-functions', () => {
  const forTest = new ForTest();

  describe('wrapResultTypeToException', () => {
    it('should be convert result type to exception', async () => {
      const wrapped = wrapResultTypeToException(forTest.returnResultType).bind(
        forTest,
      );
      await expect(wrapped()).rejects.toThrow(forTest.error);
    });
  });
  describe('wrapExceptionToResultType', () => {
    it('should be convert exception to result type', async () => {
      const wrapped = wrapExceptionToResultType(forTest.returnResultType).bind(
        forTest,
      );
      await expect(wrapped()).resolves.toEqual({
        error: forTest.error,
      });
    });
  });
});
