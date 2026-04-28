import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn
} from 'typeorm';
import { Trabajador } from './Trabajador';

@Entity('licencias')
export class Licencia {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  trabajadorId!: number;

  // medica, mutual, maternidad, paternidad, administrativa
  @Column({ type: 'varchar' })
  tipo!: string;

  @Column({ type: 'date' })
  fechaInicio!: string;

  @Column({ type: 'date' })
  fechaFin!: string;

  @Column({ type: 'int' })
  dias!: number;

  // pendiente, devuelta, rechazada
  @Column({ type: 'varchar', default: 'pendiente' })
  estado!: string;

  @Column({ type: 'boolean', default: false })
  habilitaReemplazo!: boolean;

  @Column({ nullable: true })
  notas!: string;

  @ManyToOne(() => Trabajador)
  @JoinColumn({ name: 'trabajadorId' })
  trabajador!: Trabajador;
}
