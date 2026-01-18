import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity('roles')
export class Roles {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ['ADMINISTRADOR', 'SUPERVISOR', 'VENDEDOR'],
    unique: true,
  })
  name: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
