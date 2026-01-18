import {
  IsNumber,
  IsString,

  IsNotEmpty,
  IsInt,
} from 'class-validator';

export class CreateProductDto {
  @IsString()

  @IsNotEmpty()
  name: string;
  @IsNumber()
  price: number;
  @IsInt()
  stock: number;
  @IsInt()
  minStock: number;
  @IsInt()
  categoryId: number;
}
