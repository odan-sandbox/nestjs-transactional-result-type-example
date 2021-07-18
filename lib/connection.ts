import { EntityManager } from 'typeorm';
import { getNamespace } from 'cls-hooked';
import { NAMESPACE_NAME } from 'typeorm-transactional-cls-hooked';
import {
  getEntityManagerForConnection,
  setEntityManagerForConnection,
} from 'typeorm-transactional-cls-hooked/dist/common';

export async function execute(
  entityManager: EntityManager,
  callback: () => Promise<unknown>,
) {
  const context = getNamespace(NAMESPACE_NAME);

  await context.runAndReturn(async () => {
    setEntityManagerForConnection('default', context, entityManager);
    await callback();
  });
}

export async function runInTransaction(
  callback: (entityManager: EntityManager) => Promise<unknown>,
) {
  const context = getNamespace(NAMESPACE_NAME);
  await context.runAndReturn(async () => {
    const entityManager = getEntityManagerForConnection('default', context);
    await callback(entityManager);
  });
}
