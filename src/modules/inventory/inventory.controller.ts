// src/modules/inventory/inventory.controller.ts
import { Controller, Post, Body, Get } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../../common/enums/role.enum';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import type { UserActiveInterface } from 'src/common/interfaces/user-active.interface';

@Auth(Role.SUPERVISOR)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  create(
    @Body() dto: CreateInventoryDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.inventoryService.registerInventoryTransaction(dto, user);
  }

  @Get()
  findAll() {
    return this.inventoryService.findAllEntries();
  }

  @Get('categories')
  findCategories() {
    return this.inventoryService.findAllCategories();
  }
}
