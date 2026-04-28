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

  @Column({ nullable: true })
  instalacionId!: number;

  // operativo, mantenimiento, baja
  @Column({ type: 'varchar', default: 'operativo' })
  estado!: string;

  @Column({ type: 'date', nullable: true })
  fechaCompra!: string;

  @Column({ type: 'date', nullable: true })
  fechaUltimoMantenimiento!: string;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'productoId' })
  producto!: Producto;

  @ManyToOne(() => Instalacion, { nullable: true })
  @JoinColumn({ name: 'instalacionId' })
  instalacion!: Instalacion;
}
