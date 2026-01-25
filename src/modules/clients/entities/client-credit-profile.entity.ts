import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Client } from './client.entity';

@Entity('client_credit_profiles')
export class ClientCreditProfile {
  @PrimaryGeneratedColumn()
  id: number;
  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  creditLimit: number;
  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  currentDebt: number;
  @Column({ default: true })
  isActive: boolean;

  @OneToOne(() => Client, (client) => client.creditProfile)
  client: Client;
}
