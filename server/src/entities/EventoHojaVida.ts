import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn
} from 'typeorm';
import { Trabajador } from './Trabajador';
import { Usuario } from './Usuario';
import { Instalacion } from './Instalacion';

@Entity('eventos_hoja_vida')
export class EventoHojaVida {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  trabajadorId!: number;

  // amonestacion, felicitacion, observacion_cliente, denuncia_ley_karin
  @Column({ type: 'varchar' })
  tipo!: string;

  @Column({ type: 'date' })
  fecha!: string;

  @Column({ type: 'text' })
  descripcion!: string;

  @Column()
  registradoPorId!: number;

  @Column({ nullable: true })
  instalacionId!: number;

  @ManyToOne(() => Trabajador)
  @JoinColumn({ name: 'trabajadorId' })
  trabajador!: Trabajador;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'registradoPorId' })
  registradoPor!: Usuario;

  @ManyToOne(() => Instalacion, { nullable: true })
  @JoinColumn({ name: 'instalacionId' })
  instalacion!: Instalacion;
}
