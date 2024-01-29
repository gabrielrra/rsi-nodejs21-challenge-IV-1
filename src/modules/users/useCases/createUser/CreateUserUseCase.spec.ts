import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { CreateUserError } from './CreateUserError';
import { ICreateUserDTO } from '../createUser/ICreateUserDTO';
import { compare } from 'bcryptjs';

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

const testUser: ICreateUserDTO = {
  name: 'teste',
  email: 'teste@email.com',
  password: 'password_123',
};

describe('CreateUserUseCase', () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

    // newTestUser = await createUserUseCase.execute(testUser);
  });

  it('Should be able to create an user', async () => {
    const user = await createUserUseCase.execute(testUser);

    expect(user).toHaveProperty('id');
  });

  it('Should have a hashed password', async () => {
    const user = await createUserUseCase.execute(testUser);

    expect(user.password).not.toBe(testUser.password);

    const passwordMatch = await compare(testUser.password, user.password);

    expect(passwordMatch).toBeTruthy();
  });

  it('Should NOT be able to create user with already existing email', async () => {
    expect(async () => {
      await createUserUseCase.execute(testUser);
      await createUserUseCase.execute(testUser);
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
