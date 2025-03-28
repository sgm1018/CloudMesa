import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsEmail } from "class-validator";
import { User } from "src/users/entities/user.entity";

export class RegisterDto {
  @ApiProperty({
    example: 'John',
    description: 'User\'s name',
    required: true
  })
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User\'s surname',
    required: true
  })
  @IsNotEmpty()
  readonly surname: string;

  @ApiProperty({
    example: 'usuario@ejemplo.com',
    description: 'User\'s email',
    required: true
  })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({
    example: 'password123',
    description: 'User\'s password',
    required: true
  })
  @IsNotEmpty()
  readonly password: string;

  @ApiProperty({
    example: 'abc123xyz789',
    description: 'User\'s public key',
    required: true
  })
  @IsNotEmpty()
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