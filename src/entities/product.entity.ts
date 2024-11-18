import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from './category.entity';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  price: number;

  @JoinColumn()
  @ManyToOne(() => Category, (category) => category.products)
  category: Category;

  @Column()
  @Index()
  categoryId: number;
}
