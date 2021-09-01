export class User {
  id?: number;
  email: string;
  password: string;

  constructor({
    id,
    email,
    password,
  }: {
    id?: number;
    email: string;
    password: string;
  }) {
    this.id = id;
    this.email = email;
    this.password = password;
  }
}
