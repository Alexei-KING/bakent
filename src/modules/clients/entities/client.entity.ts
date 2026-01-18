import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { ClientCreditProfile } from './client-credit-profile.entity';
import { Sale } from '../../sales/entities/sale.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  fullname: string;
  @Column({ unique: true })
  taxId: string;
  @Column({ unique: true })
  email: string;
  @Column({ unique: true })
  phone: string;
  @Column({ unique: true })
  address: string;

  @OneToOne(
    () => ClientCreditProfile,
    (creditProfile) => creditProfile.client,
    { cascade: true, eager: true },
  )
  @JoinColumn({ name: 'creditProfileId' })
  creditProfile: ClientCreditProfile;

  @OneToMany(() => Sale, (sale) => sale.client)
  sale: Sale[];
}
