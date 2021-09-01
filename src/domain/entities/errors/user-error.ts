export class UserError extends Error {
  constructor(message: string, name: string) {
    super(message);
    this.message = message;
    this.name = name;
  }

  static passwordMismatch(): UserError {
    return new UserError("Password mismatch", "PasswordMismatch");
  }

  static emailAlreadyInUse(email: string) {
    return new UserError(
      `Email ${email} is already in use`,
      "EmailAlreadyInUse"
    );
  }
}
