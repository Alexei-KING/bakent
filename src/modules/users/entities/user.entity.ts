import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Roles } from './roles.entity';
import { Sale } from '../../sales/entities/sale.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ unique: true, nullable: false })
  cedula: string;
  @Column()
  name: string;
  @Column()
  lastname: string;
  @Column({ nullable: true })
  phone: string;
  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: false, select: false })
  password: string;
  @Column({ type: 'text', nullable: true, select: false })
  refreshTokenHash?: string | null;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Roles, (role) => role.users, {
    eager: true,
  })
  @JoinColumn({ name: 'roleId' })
  role: Roles;

  @OneToMany(() => Sale, (sale) => sale.user)
  sale: Sale[];
}
