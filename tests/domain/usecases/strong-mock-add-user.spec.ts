import { EmailSender } from '../../../src/domain/notification/email-sender';
import { mock, when, verify, instance, It } from 'strong-mock';
import { AddUser } from '../../../src/domain/usecases/add-user';
import { Hasher } from '../../../src/domain/protocols/cryptography/hasher';
import { UserRepositoryFakeMemory } from '../../fakes/user-memory-repository';

/*
* Testes utilizando strong-mock
* https://www.npmjs.com/package/strong-mock
*/
describe("AddUser usecase", () => {

  // Mock
  it('Should throw if SenderEmail.send throws', async () => {
    const hasher = mock<Hasher>();
    when(hasher.hash(It.isString())).thenResolve('hashed_password').once();
    const emailSender = mock<EmailSender>();
    when(emailSender.send({ to: 'email@mail.com', message: 'User created. Congrats' })).thenReject(new Error());
    const sut = new AddUser(new UserRepositoryFakeMemory(), instance(emailSender), instance(hasher));
    const userRequest = {
      email: 'email@mail.com',
      password: 'password',
      confirmPassword: 'password'
    };
    const promise = sut.perform(userRequest);
    await expect(promise).rejects.toThrow();
    verify(emailSender);
  });
});


