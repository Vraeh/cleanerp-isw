import {
  Entity, PrimaryGeneratedColumn, Column, OneToMany
} from 'typeorm';
import { StockInstalacion } from './StockInstalacion';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nombre!: string;

  // consumible, equipamiento
  @Column({ type: 'varchar' })
  categoria!: string;

  // clinico, estandar, universal
  @Column({ type: 'varchar' })
  compatibilidad!: string;

  @Column({ nullable: true })
  unidad!: string;

  @Column({ nullable: true })
  descripcion!: string;

  @OneToMany(() => StockInstalacion, stock => stock.producto)
  stockPorInstalacion!: StockInstalacion[];
}
