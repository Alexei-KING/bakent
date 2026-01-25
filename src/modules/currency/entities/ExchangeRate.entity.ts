import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Currency } from './currency.entity';
import { User } from '../../users/entities/user.entity';

@Entity('exchange_rates')
@Index(['currency', 'createdAt'])
export class ExchangeRate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', {
    precision: 14,
    scale: 4,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  rateValue: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Currency, (currency) => currency.rates)
  @JoinColumn({ name: 'currencyId' })
  currency: Currency;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
