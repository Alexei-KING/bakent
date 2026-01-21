import { IsNumber, IsPositive, IsInt } from 'class-validator';

export class CreateExchangeRateDto {
  @IsNumber()
  @IsPositive()
  rateValue: number;

  @IsInt()
  currencyId: number;
}
