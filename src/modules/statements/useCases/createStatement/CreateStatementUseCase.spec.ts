import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { CreateStatementError } from './CreateStatementError';
import { CreateStatementUseCase } from './CreateStatementUseCase';
import { User } from '../../../users/entities/User';
import { OperationType } from '../../entities/Statement';
import { randomUUID } from 'crypto';

let createStatementUseCase: CreateStatementUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

let testUser: User;

describe('CreateStatementUseCase', () => {
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
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );
  });

  it('Should be able to create a new statement', async () => {
    const statement = await createStatementUseCase.execute({
      user_id: testUser.id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'deposit test',
    });

    expect(statement).toHaveProperty('id');
  });

  it('Should NOT be able to create a statement for user that does not exist', async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: randomUUID(),
        type: OperationType.DEPOSIT,
        amount: 100,
        description: 'deposit test',
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it('Should NOT be able to create a withdraw statement when insufficient funds', async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: testUser.id,
        type: OperationType.DEPOSIT,
        amount: 100,
        description: 'Deposit 100',
      });
      await createStatementUseCase.execute({
        user_id: testUser.id,
        type: OperationType.WITHDRAW,
        amount: 200,
        description: 'Withdraw 200',
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
