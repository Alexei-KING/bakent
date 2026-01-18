import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Sale } from './sale.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('sale_details')
export class SaleDetail {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  priceAtSale: number;

  @ManyToOne(() => Sale, (sale) => sale.saleDetails)
  sale: Sale;
  @ManyToOne(() => Product, (product) => product.saleDetails)
  product: Product;
}
