import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn
} from 'typeorm';
import { Producto } from './Producto';
import { Instalacion } from './Instalacion';
import { Usuario } from './Usuario';

@Entity('movimientos_inventario')
export class MovimientoInventario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  productoId!: number;

  @Column({ type: 'int', nullable: true })
  instalacionOrigenId?: number | null;

  @Column({ type: 'int', nullable: true })
  instalacionDestinoId?: number | null;

  // entrada, salida, transferencia
  @Column({ type: 'varchar' })
  tipo!: string;

  @Column({ type: 'int' })
  cantidad!: number;

  @CreateDateColumn()
  fecha!: Date;

  @Column()
  responsableId!: number;

  @Column({ type: 'varchar', nullable: true })
  notas?: string | null;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'productoId' })
  producto!: Producto;

  @ManyToOne(() => Instalacion, { nullable: true })
  @JoinColumn({ name: 'instalacionOrigenId' })
  instalacionOrigen?: Instalacion | null;

  @ManyToOne(() => Instalacion, { nullable: true })
  @JoinColumn({ name: 'instalacionDestinoId' })
  instalacionDestino?: Instalacion | null;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'responsableId' })
  responsable!: Usuario;
}
