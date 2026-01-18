import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { InventoryEntry } from './inventory.entity';

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  quantity: number;

  @ManyToOne(() => Product)
  product: Product;

  @ManyToOne(() => InventoryEntry, (entry) => entry.movements)
  inventoryEntry: InventoryEntry;
}
