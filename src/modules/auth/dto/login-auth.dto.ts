import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  cedula: string;
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;
}
