import { Module } from '@nestjs/common';
import { ExchangeRateService } from './currency.service';
import { ExchangeRateController } from './currency.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Currency } from './entities/currency.entity';
import { ExchangeRate } from './entities/ExchangeRate.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Currency, ExchangeRate])],
  controllers: [ExchangeRateController],
  providers: [ExchangeRateService],
})
export class CurrencyModule {}
