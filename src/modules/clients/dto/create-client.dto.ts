import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateClientDto {
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  fullname: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  taxId: string;

  @IsEmail()
  @IsOptional()
  email?: string;
  @IsString()
  @MinLength(10)
  phone: string;
  @IsString()
  @IsOptional()
  address?: string;
  @IsNumber()
  @IsOptional()
  creditLimit?: number;
}
