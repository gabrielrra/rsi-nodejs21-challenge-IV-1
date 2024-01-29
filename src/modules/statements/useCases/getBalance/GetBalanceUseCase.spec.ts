import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { GetBalanceError } from './GetBalanceError';
import { GetBalanceUseCase } from './GetBalanceUseCase';
import { User } from '../../../users/entities/User';
import { randomUUID } from 'crypto';

let getBalanceUseCase: GetBalanceUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

let testUser: User;

describe('GetBalanceUseCase', () => {
  beforeAll(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    testUser = await inMemoryUsersRepository.create({
      name: 'teste',
      email: 'teste@email.com',
      password: 'password_123',
    });
  });
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );
  });

  it('Should be able to get user balance', async () => {
    const balance = await getBalanceUseCase.execute({
      user_id: testUser.id,
    });

    expect(balance).toHaveProperty('balance');
  });

  it('Should not be able to get balance for non existing user', async () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: randomUUID(),
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
