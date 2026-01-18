import {
  IsArray,
  IsEnum,
  IsPositive,
  IsInt,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SaleItemDto {
  @IsNumber()
  productId: number;
  @IsInt()
  @IsPositive()
  quantity: number;
}

export class CreateSaleDto {
  @IsNumber()
  clientId: number;

  @IsNumber()
  paymentMethodId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];
}
