import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn
} from 'typeorm';
import { Trabajador } from './Trabajador';
import { Proyecto } from './Proyecto';

@Entity('contratos_laborales')
export class ContratoLaboral {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  trabajadorId!: number;

  @Column()
  proyectoId!: number;

  // plazo_fijo, indefinido, obra_faena
  @Column({ type: 'varchar' })
  tipo!: string;

  @Column({ type: 'date' })
  fechaInicio!: string;

  @Column({ type: 'date', nullable: true })
  fechaFin!: string;

  // activo, terminado, suspendido
  @Column({ type: 'varchar', default: 'activo' })
  estado!: string;

  @Column({ nullable: true })
  cargo!: string;

  @Column({ type: 'numeric', nullable: true })
  salario!: number;

  @ManyToOne(() => Trabajador, trabajador => trabajador.contratos)
  @JoinColumn({ name: 'trabajadorId' })
  trabajador!: Trabajador;

  @ManyToOne(() => Proyecto)
  @JoinColumn({ name: 'proyectoId' })
  proyecto!: Proyecto;
}
