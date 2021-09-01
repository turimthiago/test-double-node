import { User } from "../../src/domain/entities/user";
import { UserRepository } from "../../src/domain/protocols/repositories/user-repository";

export class UserRepositoryFakeMemory implements UserRepository {
    users: User[] = [];

    async create(user: Omit<User, "id">): Promise<User> {
        const id = Math.floor(Math.random() * 11);
        const newUser = new User({
            id,
            email: user.email,
            password: user.password,
        });
        this.users.push(newUser);
        return newUser;
    }

    async findByEmail(email: string): Promise<User> {
        const index = this.users.findIndex((user) => email === user.email);
        return this.users[index];
    }

    async findById(id: number): Promise<User> {
        const index = this.users.findIndex((user) => id === user.id);
        return this.users[index];
    }

    clear() {
        this.users = [];
    }

}