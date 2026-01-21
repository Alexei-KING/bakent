import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ExchangeRate } from './ExchangeRate.entity';

@Entity()
export class Currency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string; // 'USD', 'EUR'

  @Column()
  symbol: string; // '$', '€'

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => ExchangeRate, (rate) => rate.currency)
  rates: ExchangeRate[];
}
