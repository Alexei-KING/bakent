import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Category } from '../../categorys/entities/category.entity';
import { SaleDetail } from '../../sales/entities/sale-detail.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;
  @Column({ type: 'int', default: 0 })
  stock: number;
  @Column({ type: 'int', default: 5 })
  minStock: number;

  @ManyToOne(() => Category, (category) => category.products, {
    eager: true,
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @OneToMany(() => SaleDetail, (saleDetail) => saleDetail.product)
  saleDetails: SaleDetail[];
}
