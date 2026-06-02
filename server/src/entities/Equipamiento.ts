import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn
} from 'typeorm';
import { Producto } from './Producto';
import { Instalacion } from './Instalacion';

@Entity('equipamiento')
export class Equipamiento {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  productoId!: number;

  @Column({ unique: true })
  numeroSerie!: string;

  @Column({ type: 'int', nullable: true })
  instalacionId?: number | null;

  // operativo, mantenimiento, baja
  @Column({ type: 'varchar', default: 'operativo' })
  estado!: string;

  @Column({ type: 'date', nullable: true })
  fechaCompra?: string | null;

  @Column({ type: 'date', nullable: true })
  fechaUltimoMantenimiento?: string | null;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'productoId' })
  producto!: Producto;

  @ManyToOne(() => Instalacion, { nullable: true })
  @JoinColumn({ name: 'instalacionId' })
  instalacion?: Instalacion | null;
}
