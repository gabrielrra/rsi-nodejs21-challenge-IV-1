import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { GetStatementOperationError } from './GetStatementOperationError';
import { GetStatementOperationUseCase } from './GetStatementOperationUseCase';
import { User } from '../../../users/entities/User';
import { randomUUID } from 'crypto';
import { OperationType } from '../../entities/Statement';

let getStatementOperationUseCase: GetStatementOperationUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

let testUser: User;

describe('GetStatementOperationUseCase', () => {
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
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );
  });

  it('Should be able to get statement operations', async () => {
    //create a statement
    const statement = await inMemoryStatementsRepository.create({
      user_id: testUser.id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'deposit test',
    });
    const getStatementRes = await getStatementOperationUseCase.execute({
      user_id: testUser.id,
      statement_id: statement.id,
    });

    expect(getStatementRes.id).toBe(statement.id);
  });

  it('Should not be able to get statement for non existing user', async () => {
    expect(async () => {
      const statement = await inMemoryStatementsRepository.create({
        user_id: testUser.id,
        type: OperationType.DEPOSIT,
        amount: 100,
        description: 'deposit test',
      });
      await getStatementOperationUseCase.execute({
        user_id: randomUUID(),
        statement_id: statement.id,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it('Should not be able to get non existing statement for existing user', async () => {
    expect(async () => {
      await inMemoryStatementsRepository.create({
        user_id: testUser.id,
        type: OperationType.DEPOSIT,
        amount: 100,
        description: 'deposit test',
      });
      await getStatementOperationUseCase.execute({
        user_id: testUser.id,
        statement_id: randomUUID(),
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
