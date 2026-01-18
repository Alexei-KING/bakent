import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  IsInt,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  cedula: string;

  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  name: string;

  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  lastname: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @IsInt()
  role: number;
}
