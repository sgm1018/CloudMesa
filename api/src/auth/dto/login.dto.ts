import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class LoginDto {
  @ApiProperty({
    example: 's@s.es',
    description: 'User email',
    required: true
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Admin7',
    description: 'User password',
    required: true
  })
  @IsNotEmpty()
  password: string;

  constructor() {
  
  }
}