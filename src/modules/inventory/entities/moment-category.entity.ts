import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('movement_categories')
export class MovementCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  factor: number;
}
