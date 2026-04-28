import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn
} from 'typeorm';
import { SolicitudReabastecimiento } from './SolicitudReabastecimiento';
import { Producto } from './Producto';

@Entity('items_solicitud')
export class ItemSolicitud {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  solicitudId!: number;

  @Column()
  productoId!: number;

  @Column({ type: 'int' })
  cantidad!: number;

  @ManyToOne(() => SolicitudReabastecimiento, solicitud => solicitud.items)
  @JoinColumn({ name: 'solicitudId' })
  solicitud!: SolicitudReabastecimiento;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'productoId' })
  producto!: Producto;
}
