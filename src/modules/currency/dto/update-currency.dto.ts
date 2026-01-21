import { PartialType } from '@nestjs/swagger';
import { CreateExchangeRateDto } from './create-currency.dto';

export class UpdateCurrencyDto extends PartialType(CreateExchangeRateDto) {}
