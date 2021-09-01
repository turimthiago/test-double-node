import { User } from "../../../src/domain/entities/user";
import { EmailSender } from "../../../src/domain/notification/email-sender";
import { Hasher } from "../../../src/domain/protocols/cryptography/hasher";
import { UserRepository } from "../../../src/domain/protocols/repositories/user-repository";
import { AddUser } from "../../../src/domain/usecases/add-user";

/**
 * Testes utlizando Jest
 */
const userRepositoryMock: jest.Mocked<UserRepository> = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn()
}

const emailSenderMock: jest.Mocked<EmailSender> = {
  send: jest.fn()
}

const hasherMock: jest.Mocked<Hasher> = {
  hash: jest.fn()
}

describe("AddUser usecase", () => {
  let sut: AddUser;

  beforeAll(() => {
    userRepositoryMock.create.mockResolvedValue(new User({ id: 1, email: 'email@mail.com', password: 'hashed_password' }));
    hasherMock.hash.mockResolvedValue('hashed_password');
    sut = new AddUser(userRepositoryMock, emailSenderMock, hasherMock);
  });

  beforeEach(() => {
  });

  it('Should create User', async () => {
    const userRequest = {
      email: 'email@mail.com',
      password: 'password',
      confirmPassword: 'password'
    };
    const sut = new AddUser(userRepositoryMock, emailSenderMock, hasherMock);
    const result = await sut.perform(userRequest);
    expect(result.id).toBeTruthy();
    expect(userRepositoryMock.create).toHaveBeenCalledTimes(1);
  });

  /**
   * Spy
   */
  it('Should call SenderEmail.send with corrects values', async () => {
    const spySend = jest.spyOn(emailSenderMock, 'send');
    const userRequest = {
      email: 'email@mail.com',
      password: 'password',
      confirmPassword: 'password'
    };
    await sut.perform(userRequest);
    expect(spySend).toHaveBeenCalledWith({ to: 'email@mail.com', message: 'User created. Congrats' })
  });

  /**
   * Utilização spy para validação de parâmetros passados pelo SUT
   */
  it('Should call UserRepository.create with corrects values', async () => {
    //Criamos os spy
    const createSpy = jest.spyOn(userRepositoryMock, 'create');
    const userRequest = {
      email: 'email@mail.com',
      password: 'password',
      confirmPassword: 'password'
    };
    await sut.perform(userRequest);
    expect(createSpy).toHaveBeenCalledWith({ email: userRequest.email, password: 'hashed_password' });
  });

  it('Should throw if SenderEmail.send throws', async () => {
    const userRequest = {
      email: 'email@mail.com',
      password: 'password',
      confirmPassword: 'password'
    };
    emailSenderMock.send.mockRejectedValueOnce(new Error());
    const promise = sut.perform(userRequest);
    await expect(promise).rejects.toThrow();
  });
});

