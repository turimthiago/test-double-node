import { User } from "../../../src/domain/entities/user";
import { EmailSender } from "../../../src/domain/notification/email-sender";
import { Hasher } from "../../../src/domain/protocols/cryptography/hasher";
import { AddUser } from "../../../src/domain/usecases/add-user";
import { UserRepositoryFakeMemory } from "../../fakes/user-memory-repository";

class EmailSenderSpy implements EmailSender {
  params?: EmailSender.Params;

  async send(params: EmailSender.Params): Promise<void> {
    this.params = params;
  }

  clear() {
    this.params = undefined;
  }

}

class HasherStub implements Hasher {
  async hash(value: string): Promise<string> {
    return 'hashed_password';
  }
}

describe("AddUser usecase", () => {
  let sut: AddUser;
  let userRepository: UserRepositoryFakeMemory;
  let senderEmailSpy: EmailSenderSpy;

  beforeEach(() => {
    userRepository = new UserRepositoryFakeMemory();
    senderEmailSpy = new EmailSenderSpy();
    const hasherStub = new HasherStub();
    sut = new AddUser(userRepository, senderEmailSpy, hasherStub);
  });

  //Exemplo de fake e stub. Garante que o Usecase chama o método gravar do repositório.
  // Após execução verifica de objecto existe.
  it("Should create User", async () => {
    const userRequest = {
      email: 'dummy_email',
      password: 'dummy_password',
      confirmPassword: 'dummy_password'
    };
    const result = await sut.perform(userRequest);
    const user = await userRepository.findById(result.id);
    expect(user).toBeTruthy();
  });

  //Exemplo de teste com spy. Garante que o método EmailSender.send seja chamado com os valores corretos
  it('Should call SenderEmail.send with corrects values', async () => {
    const userRequest = {
      email: 'email@mail.com',
      password: 'password',
      confirmPassword: 'password'
    };
    await sut.perform(userRequest);
    expect(senderEmailSpy.params).toEqual({ to: 'email@mail.com', message: 'User created. Congrats' });
  });

  // Spy
  it('Should call UserRepository.create with corrects values', async () => {
    let params: Omit<User, "id">;
    userRepository.create = async (user: Omit<User, "id">) => {
      params = { email: user.email, password: user.password };
      return new User({ id: 1, email: 'email@mail.com', password: 'password' });
    }
    const userRequest = {
      email: 'email@mail.com',
      password: 'password',
      confirmPassword: 'password'
    };
    await sut.perform(userRequest);
    expect(params!).toEqual({ email: userRequest.email, password: 'hashed_password' });
  });

  // Stub
  it('Should throw if SenderEmail.send throws', async () => {
    const userRequest = {
      email: 'email@mail.com',
      password: 'password',
      confirmPassword: 'password'
    };
    senderEmailSpy.send = async () => {
      throw new Error();
    }
    const promise = sut.perform(userRequest);
    await expect(promise).rejects.toThrow();
  });

});

