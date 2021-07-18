import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';
import { AppModule } from './app.module';
import { AppService } from './app.service';
import { User } from './entities/user.entity';

import { execute } from '../lib/connection';

describe('AppService', () => {
  let service: AppService;
  let usersRepository: Repository<User>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = moduleRef.get<AppService>(AppService);
    usersRepository = moduleRef.get<Repository<User>>(getRepositoryToken(User));

    await getConnection().synchronize(true);
  });

  describe('createUser', () => {
    it('ok', async () => {
      await expect(usersRepository.count()).resolves.toBe(0);
      await service.createUser('Tom');
      await expect(usersRepository.count()).resolves.toBe(1);
    });
    it('revert', async () => {
      jest.spyOn(service, 'hook').mockRejectedValue(new Error('hook error'));

      await expect(usersRepository.count()).resolves.toBe(0);
      await service.createUser('Tom').catch((error) => {
        console.log({ error });
      });
      await expect(usersRepository.count()).resolves.toBe(0);
    });

    it('return error', async () => {
      const error = new Error('returnHook error');
      jest.spyOn(service, 'returnHook').mockResolvedValue({ error });

      await expect(usersRepository.count()).resolves.toBe(0);
      await expect(service.createUser('Tom')).resolves.toEqual({ error });
      await expect(usersRepository.count()).resolves.toBe(0);
      expect(service['returnHook']).toBeCalled();
    });
  });

  describe('createUserForMandatory', () => {
    describe('outside transaction', () => {
      it('should throw error', async () => {
        await expect(service.createUserForMandatory('Tom')).resolves.toEqual({
          error: expect.any(Error),
        });
      });
    });

    describe('inside transaction', () => {
      it('ok', async () => {
        await getConnection().transaction(async (entityManager) => {
          await execute(entityManager, async () => {
            await expect(
              service.createUserForMandatory('Tom'),
            ).resolves.toBeUndefined();
          });
        });
      });
    });
  });
});
