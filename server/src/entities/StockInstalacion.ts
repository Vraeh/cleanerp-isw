import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, Unique
} from 'typeorm';
import { Producto } from './Producto';
import { Instalacion } from './Instalacion';

@Entity('stock_instalacion')
@Unique(['productoId', 'instalacionId'])
export class StockInstalacion {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  productoId!: number;

  @Column()
  instalacionId!: number;

  @Column({ type: 'int', default: 0 })
  stockActual!: number;

  @Column({ type: 'int', default: 0 })
  umbralMinimo!: number;

  @Column({ type: 'int', default: 0 })
  umbralMaximo!: number;

  @ManyToOne(() => Producto, producto => producto.stockPorInstalacion)
  @JoinColumn({ name: 'productoId' })
  producto!: Producto;

  @ManyToOne(() => Instalacion)
  @JoinColumn({ name: 'instalacionId' })
  instalacion!: Instalacion;
}
