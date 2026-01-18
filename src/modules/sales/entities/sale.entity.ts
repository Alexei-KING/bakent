import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { SaleDetail } from './sale-detail.entity';
import { Client } from 'src/modules/clients/entities/client.entity';
import { PaymentMethod } from './payment-method.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn()
  id: number;
  @Column('decimal', { precision: 12, scale: 2 })
  total: number;

  @ManyToOne(() => PaymentMethod, (pm) => pm.sales, { eager: true })
  @JoinColumn({ name: 'paymentMethodId' })
  paymentMethod: PaymentMethod;

  @OneToMany(() => SaleDetail, (saleDetail) => saleDetail.sale, {
    cascade: true,
  })
  saleDetails: SaleDetail[];

  @ManyToOne(() => Client, (client) => client.sale)
  client: Client;

  @ManyToOne(() => User, (user) => user.sale)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
