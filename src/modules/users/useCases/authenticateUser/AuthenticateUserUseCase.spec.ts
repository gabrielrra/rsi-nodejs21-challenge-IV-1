import { JwtPayload, verify } from 'jsonwebtoken';
import authConfig from '../../../../config/auth';
import { User } from '../../../users/entities/User';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { AuthenticateUserUseCase } from './AuthenticateUserUseCase';
import { IncorrectEmailOrPasswordError } from './IncorrectEmailOrPasswordError';
import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { ICreateUserDTO } from '../createUser/ICreateUserDTO';
import { randomUUID } from 'crypto';

let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

const testUser: ICreateUserDTO = {
  name: 'teste',
  email: 'teste@email.com',
  password: 'password_123',
};
let newTestUser: User;

describe('AuthenticateUserUseCase', () => {
  beforeAll(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

    newTestUser = await createUserUseCase.execute(testUser);

    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository,
    );
  });

  it('Should be able to authenticate user', async () => {
    const authRes = await authenticateUserUseCase.execute({
      email: testUser.email,
      password: testUser.password,
    });

    expect(authRes).toHaveProperty('token');
  });

  it('Should be able to decode token using secret key', async () => {
    const authRes = await authenticateUserUseCase.execute({
      email: testUser.email,
      password: testUser.password,
    });
    const decoded = verify(authRes.token, authConfig.jwt.secret) as JwtPayload;

    expect(decoded.sub).toBe(newTestUser.id);
  });

  it('Should NOT be able to authenticate with wrong password', async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: testUser.email,
        password: randomUUID(),
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it('Should NOT be able to authenticate with non existing email', async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: `${randomUUID()}@email.com`,
        password: 'password',
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
