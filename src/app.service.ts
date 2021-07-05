import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { User } from './entities/user.entity';

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

  @Transactional()
  async createUser() {
    await this.usersRepository.save(
      this.usersRepository.create({
        firstName: 'Tom',
      }),
    );

    await this.hook();

    return this.returnHook();
  }
}
