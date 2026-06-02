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

  @Column({ type: 'varchar', nullable: true })
  unidad?: string | null;

  @Column({ type: 'varchar', nullable: true })
  descripcion?: string | null;

  @OneToMany(() => StockInstalacion, stock => stock.producto)
  stockPorInstalacion!: StockInstalacion[];
}
