import { UserError } from "../entities/errors/user-error";
import { User } from "../entities/user";
import { EmailSender } from "../notification/email-sender";
import { Hasher } from "../protocols/cryptography/hasher";
import { UserRepository } from "../protocols/repositories/user-repository";

export class AddUser {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailSender: EmailSender,
    private readonly hasher: Hasher
  ) { }

  async perform(request: AddUserRequest): Promise<AddUserResponse> {
    const { email, password, confirmPassword } = request;
    if (password !== confirmPassword) throw UserError.passwordMismatch();
    const emaiIsAlreadyInUse = await this.userRepository.findByEmail(email);
    if (emaiIsAlreadyInUse) throw UserError.emailAlreadyInUse(email);
    const hashedPassword = await this.hasher.hash(password);
    const createUser = new User({ email, password: hashedPassword });
    const { id } = await this.userRepository.create(createUser);
    if (!id) throw new Error('Error to create user')
    await this.emailSender.send({
      to: email,
      message: 'User created. Congrats'
    })
    return { id };
  }
}

export interface AddUserRequest {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AddUserResponse {
  id: number;
}
