import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';
import { AppModule } from './app.module';
import { AppService } from './app.service';
import { User } from './entities/user.entity';

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

    it.only('return error', async () => {
      jest
        .spyOn(service, 'returnHook')
        .mockResolvedValue({ error: new Error('returnHook error') });

      await expect(usersRepository.count()).resolves.toBe(0);
      await service.createUser('Tom').catch((error) => {
        console.log({ error });
      });
      await expect(usersRepository.count()).resolves.toBe(0);
      expect(service['returnHook']).toBeCalled();
    });
  });
});
