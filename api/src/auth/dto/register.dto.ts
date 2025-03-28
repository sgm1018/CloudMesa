import { User } from "src/users/entities/user.entity";

export class RegisterDto {
  readonly name: string;
  readonly surname: string;
  readonly email: string;
  readonly password: string;
  readonly publicKey: string;

  constructor() {}


  toEntidad() : User{
    const user : User = new User();
    user.email = this.email;
    user.name = this.name;
    user.surname = this.surname;
    user.publicKey = this.publicKey;
    return user
  }
}