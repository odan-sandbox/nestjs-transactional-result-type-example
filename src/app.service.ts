import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';
import { Transactional } from '../lib/Transactional';
import { User } from './entities/user.entity';
import { Propagation } from 'typeorm-transactional-cls-hooked';
import { runInTransaction } from '../lib/connection';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getHello(): Promise<string> {
    console.log(await this.usersRepository.find());
    return 'Hello World!';
  }

  async hook() {
    console.log('hook');
  }

  async returnHook() {
    return undefined;
  }

  private async _createUser(name: string) {
    await this.usersRepository.save(
      this.usersRepository.create({
        firstName: name,
      }),
    );

    await this.hook();

    return this.returnHook();
  }

  @Transactional({ propagation: Propagation.MANDATORY })
  async createUserForMandatory(name: string) {
    await runInTransaction(async (entityManager) => {
      console.log({ entityManager });
    });
    return this._createUser(name);
  }
  @Transactional()
  async createUser(name: string) {
    return this._createUser(name);
  }
}
