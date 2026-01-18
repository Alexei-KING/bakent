import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { MovementCategory } from './moment-category.entity';
import { StockMovement } from './StockMovement.entity';

@Entity('inventory')
export class InventoryEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  observation: string;

  @ManyToOne(() => MovementCategory, { eager: true })
  category: MovementCategory;

  @ManyToOne(() => User)
  user: User;

  @OneToMany(() => StockMovement, (movement) => movement.inventoryEntry)
  movements: StockMovement[];

  @CreateDateColumn()
  createdAt: Date;
}
