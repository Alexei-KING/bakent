import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
// --- CORRECCIÓN 1: Agregamos "import type" ---
import type { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { Auth } from 'src/modules/auth/decorators/auth.decorator';
import { Role } from 'src/common/enums/role.enum';


@Auth(Role.SUPERVISOR)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  create(
    @Body() createSaleDto: CreateSaleDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.salesService.create(createSaleDto, user);
  }

  // Mover paymentMethod ARRIBA de :id para evitar conflicto de rutas
  @Get('paymentMethod')
  findAllPaymentMethods() {
    return this.salesService.findAllpaymentMethod();
  }

  @Get()
  findAll() {
    return this.salesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salesService.findOne(id);
  }
}