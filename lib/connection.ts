import { getConnection } from 'typeorm';
import { getNamespace } from 'cls-hooked';
import { NAMESPACE_NAME } from 'typeorm-transactional-cls-hooked';
import { setEntityManagerForConnection } from 'typeorm-transactional-cls-hooked/dist/common';

export async function execute(callback: () => Promise<unknown>) {
  const context = getNamespace(NAMESPACE_NAME);

  await getConnection().transaction(async (entityManager) => {
    await context.runAndReturn(async () => {
      setEntityManagerForConnection('default', context, entityManager);
      await callback();
    });
  });
}
