import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ExchangeRateService } from './currency.service';
import { CreateExchangeRateDto } from './dto/create-currency.dto';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import type { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { AuthGuard } from '../auth/guard/auth.guard';
import { UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('exchange-rates')
export class ExchangeRateController {
  constructor(private readonly rateService: ExchangeRateService) {}

  @Post()
  create(
    @Body() createDto: CreateExchangeRateDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.rateService.create(createDto, user);
  }
  @Get('tasa/cambio')
  getAllLatestRates() {
    return this.rateService.getAllLatestRates();
  }

  @Get('latest/:code')
  getLatest(@Param('code') code: string) {
    return this.rateService.getLatestRate(code);
  }

  @Get('history/:id')
  getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.rateService.getHistory(id);
  }
}
