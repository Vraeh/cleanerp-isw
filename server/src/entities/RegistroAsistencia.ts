import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn
} from 'typeorm';
import { Trabajador } from './Trabajador';
import { Instalacion } from './Instalacion';
import { TokenAsistencia } from './TokenAsistencia';

@Entity('registros_asistencia')
export class RegistroAsistencia {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  trabajadorId!: number;

  @Column()
  instalacionId!: number;

  @Column({ type: 'int', nullable: true })
  tokenId?: number | null;

  @Column({ type: 'date' })
  fecha!: string;

  @Column({ type: 'time', nullable: true })
  horaEntrada?: string | null;

  @Column({ type: 'time', nullable: true })
  horaSalida?: string | null;

  // aprobado, token_invalido, token_expirado, ausente, licencia
  @Column({ type: 'varchar', default: 'ausente' })
  estadoValidacion!: string;

  @ManyToOne(() => Trabajador)
  @JoinColumn({ name: 'trabajadorId' })
  trabajador!: Trabajador;

  @ManyToOne(() => Instalacion)
  @JoinColumn({ name: 'instalacionId' })
  instalacion!: Instalacion;

  @ManyToOne(() => TokenAsistencia, { nullable: true })
  @JoinColumn({ name: 'tokenId' })
  token?: TokenAsistencia | null;
}
