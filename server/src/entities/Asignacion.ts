import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn
} from 'typeorm';
import { Trabajador } from './Trabajador';
import { Instalacion } from './Instalacion';

@Entity('asignaciones')
export class Asignacion {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  trabajadorId!: number;

  @Column()
  instalacionId!: number;

  @Column({ type: 'date' })
  fechaInicio!: string;

  @Column({ type: 'date', nullable: true })
  fechaFin?: string | null;

  @Column({ type: 'boolean', default: true })
  esActual!: boolean;

  @ManyToOne(() => Trabajador, trabajador => trabajador.asignaciones)
  @JoinColumn({ name: 'trabajadorId' })
  trabajador!: Trabajador;

  @ManyToOne(() => Instalacion)
  @JoinColumn({ name: 'instalacionId' })
  instalacion!: Instalacion;
}
