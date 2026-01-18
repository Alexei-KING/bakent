import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Client } from './client.entity';

@Entity('client_credit_profiles')
export class ClientCreditProfile {
  @PrimaryGeneratedColumn()
  id: number;
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  creditLimit: number;
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  currentDebt: number;
  @Column({ default: true })
  isActive: boolean;

  @OneToOne(() => Client, (client) => client.creditProfile)
  client: Client;
}
