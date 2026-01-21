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
import { Auth } from 'src/modules/auth/decorators/auth.decorator';
import { Role } from 'src/common/enums/role.enum';

@Auth(Role.SUPERVISOR)
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

  @Get('latest/:code')
  getLatest(@Param('code') code: string) {
    return this.rateService.getLatestRate(code);
  }

  @Get('history/:id')
  getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.rateService.getHistory(id);
  }
}
