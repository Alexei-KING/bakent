import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryEntry } from './entities/inventory.entity';
import { StockMovement } from './entities/StockMovement.entity';
import { MovementCategory } from './entities/moment-category.entity';
import { ProductsModule } from '../products/products.module';
import { Product } from '../products/entities/product.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventoryEntry,
      StockMovement,
      MovementCategory,
      Product,
    ]),
    ProductsModule,
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
