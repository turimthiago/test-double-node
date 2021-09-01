import { EmailSender } from '../../../src/domain/notification/email-sender';
import { AddUser } from '../../../src/domain/usecases/add-user';
import { UserRepositoryFakeMemory } from '../../fakes/user-memory-repository';
import { Hasher } from '../../../src/domain/protocols/cryptography/hasher';
import { anyString, mock, when, verify, instance, objectContaining } from 'ts-mockito';
import { anyObject } from 'omnimock';
/*
* Testes utilizando ts-mockito
* https://www.npmjs.com/package/ts-mockito
*/
describe("AddUser usecase", () => {
  /**
   * Mock
   */
  it('Should throw if SenderEmail.send throws', async () => {
    const hasher = mock<Hasher>();
    when(hasher.hash(anyString())).thenResolve('hashed_password');
    const emailSender = mock<EmailSender>();
    when(emailSender.send({ to: 'email@mail.com', message: 'User created. Congrats' })).thenReject(new Error());
    const sut = new AddUser(new UserRepositoryFakeMemory(), instance(emailSender), instance(hasher));
    const userRequest = {
      email: 'email@mail.com',
      password: 'password',
      confirmPassword: 'password'
    };
    await sut.perform(userRequest);
    verify(emailSender.send(objectContaining({ to: 'email@mail.com', message: 'User created. Congrats' }))).once();
  });

  /**
   * Mock para validar comportamento
   * SenderEmail.send não deve ser chamado, caso Hasher.hash dispare erro
   */
  it('Should not call SenderEmail.send if Hasher.hash throws', async () => {
    const hasher = mock<Hasher>();
    when(hasher.hash(anyString())).thenReject(new Error());
    const emailSender = mock<EmailSender>();
    const sut = new AddUser(new UserRepositoryFakeMemory(), instance(emailSender), instance(hasher));
    const userRequest = {
      email: 'email@mail.com',
      password: 'password',
      confirmPassword: 'password'
    };
    const promise = sut.perform(userRequest);
    expect(promise).rejects.toThrow();
    verify(emailSender.send(anyObject())).never();
  });
});


