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

      // 1. Obtener la categoría y su factor (+1 o -1)
      const category = await queryRunner.manager.findOne(MovementCategory, {
        where: { id: categoryId },
      });
      if (!category) throw new NotFoundException('Categoría no válida');

      // 2. Crear la cabecera del movimiento (La "Factura")
      const inventoryEntry = queryRunner.manager.create(InventoryEntry, {
        observation,
        category,
        user: { id: user.sub },
      });

      const movements: StockMovement[] = [];
      
      // OPTIMIZACIÓN: Instanciamos el repo UNA sola vez fuera del bucle
      const productRepo = queryRunner.manager.getRepository(Product);

      // 3. Procesar cada item
      for (const item of items) {
        const product = await productRepo.findOneBy({ id: item.productId });

        if (!product) throw new NotFoundException(`Producto con ID ${item.productId} no encontrado`);

        // Calcular nuevo stock
        const currentStock = Number(product.stock);
        const quantityChange = item.quantity * category.factor; // Ej: 5 * -1 = -5
        const updatedStock = currentStock + quantityChange;

        if (updatedStock < 0) {
          throw new BadRequestException(
            `Stock insuficiente para ${product.name}. Actual: ${currentStock}, Intentas restar: ${item.quantity}`
          );
        }

        // Actualizar el producto
        // Usamos update para ser más eficientes que save en actualizaciones parciales
        await productRepo.update(product.id, { stock: updatedStock });

        // Crear el registro del movimiento (El "Renglón")
        const movement = queryRunner.manager.create(StockMovement, {
          product: { id: product.id },
          quantity: item.quantity,
          inventoryEntry, // Enlazamos con la cabecera
        });
        movements.push(movement);
      }

      // 4. Guardar todo junto
      inventoryEntry.movements = movements;
      const savedEntry = await queryRunner.manager.save(inventoryEntry);

      await queryRunner.commitTransaction(); // ¡Éxito! Confirmamos cambios en BD
      return { message: 'Transacción exitosa', id: savedEntry.id };

    } catch (error) {
      await queryRunner.rollbackTransaction(); // ¡Error! Deshacemos todo
      throw error;
    } finally {
      await queryRunner.release(); // Liberamos la conexión
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