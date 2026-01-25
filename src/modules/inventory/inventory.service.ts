import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryEntry } from './entities/inventory.entity';
import { StockMovement } from './entities/StockMovement.entity';
import { MovementCategory } from './entities/moment-category.entity';
import { Product } from '../products/entities/product.entity';
import type { CreateInventoryDto } from './dto/create-inventory.dto';
import type { UserActiveInterface } from 'src/common/interfaces/user-active.interface';

@Injectable()
export class InventoryService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(MovementCategory)
    private readonly categoryRepo: Repository<MovementCategory>,
  ) {}

  async registerInventoryTransaction(
    dto: CreateInventoryDto,
    user: UserActiveInterface,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { observation, categoryId, items } = dto;

      const category = await queryRunner.manager.findOne(MovementCategory, {
        where: { id: categoryId },
      });
      if (!category) throw new NotFoundException('Categoría no válida');

      const inventoryEntry = queryRunner.manager.create(InventoryEntry, {
        observation,
        category,
        user: { id: user.sub },
      });

      const savedEntry = await queryRunner.manager.save(inventoryEntry);

      const movements: StockMovement[] = [];
      const productRepo = queryRunner.manager.getRepository(Product);

      for (const item of items) {
        const product = await productRepo.findOneBy({ id: item.productId });

        if (!product) throw new NotFoundException('Producto no encontrado');

        const currentStock = Number(product.stock);
        const quantityChange = item.quantity * category.factor;
        const updatedStock = currentStock + quantityChange;

        if (updatedStock < 0) {
          throw new BadRequestException(
            `Stock insuficiente para ${product.name}. Actual: ${currentStock}`,
          );
        }
        await productRepo.update(product.id, { stock: updatedStock });
        const movement = queryRunner.manager.create(StockMovement, {
          product: { id: product.id },
          quantity: item.quantity,
          inventoryEntry: savedEntry,
        });
        movements.push(movement);
      }
      await queryRunner.manager.save(StockMovement, movements);

      await queryRunner.commitTransaction();
      return { message: 'Transacción exitosa' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  async findAllEntries() {
    return await this.dataSource.getRepository(InventoryEntry).find({
      relations: ['user', 'category', 'movements', 'movements.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllCategories() {
    return await this.categoryRepo.find({ order: { name: 'ASC' } });
  }
}
