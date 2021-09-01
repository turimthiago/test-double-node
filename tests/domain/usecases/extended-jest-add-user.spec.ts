import { User } from "../../../src/domain/entities/user";
import { EmailSender } from "../../../src/domain/notification/email-sender";
import { Hasher } from "../../../src/domain/protocols/cryptography/hasher";
import { UserRepository } from "../../../src/domain/protocols/repositories/user-repository";
import { AddUser } from "../../../src/domain/usecases/add-user";
import { mock, MockProxy } from 'jest-mock-extended';

/**
 * Tests utililizando Jest e jest-extended-mock
 * https://www.npmjs.com/package/jest-mock-extended
 */
describe("AddUser usecase", () => {
  let sut: AddUser;
  let userRepository: MockProxy<UserRepository>;
  let emailSender: MockProxy<EmailSender>;
  let hasher: MockProxy<Hasher>;

  beforeAll(() => {
    userRepository = mock<UserRepository>();
    userRepository.create.mockResolvedValue(new User({ id: 1, email: 'email@mail.com', password: 'hashed_password' }));
    hasher = mock<Hasher>();
    hasher.hash.mockResolvedValue('hashed_password');
    emailSender = mock<EmailSender>();
    sut = new AddUser(userRepository, emailSender, hasher);
  });

  beforeEach(() => {
  });

  it('Should create User', async () => {
    const userRequest = {
      email: 'email@mail.com',
      password: 'password',
      confirmPassword: 'password'
    };
    const result = await sut.perform(userRequest);
    expect(result.id).toBeTruthy();
  });

  // Spy
  it('Should call SenderEmail.send with corrects values', async () => {
    const userRequest = {
      email: 'email@mail.com',
      password: 'password',
      confirmPassword: 'password'
    };
    await sut.perform(userRequest);
    expect(emailSender.send).toHaveBeenCalledWith({ to: 'email@mail.com', message: 'User created. Congrats' })
  });

  // Spy
  it('Should call UserRepository.create with corrects values', async () => {
    const userRequest = {
      email: 'email@mail.com',
      password: 'password',
      confirmPassword: 'password'
    };
    await sut.perform(userRequest);
    expect(userRepository.create).toHaveBeenCalledWith({ email: userRequest.email, password: 'hashed_password' });
  });

  // Stub
  it('Should throw if SenderEmail.send throws', async () => {
    emailSender.send.mockRejectedValueOnce(new Error())
    const userRequest = {
      email: 'dummy@mail.com',
      password: 'dummy_password',
      confirmPassword: 'dummy_password'
    };
    const promise = sut.perform(userRequest);
    await expect(promise).rejects.toThrow();
  });
});

