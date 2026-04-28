import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn
} from 'typeorm';
import { Instalacion } from './Instalacion';
import { Usuario } from './Usuario';

@Entity('tokens_asistencia')
export class TokenAsistencia {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 6 })
  codigo!: string;

  @Column()
  instalacionId!: number;

  @Column()
  supervisorId!: number;

  @CreateDateColumn()
  fechaGeneracion!: Date;

  @Column({ type: 'timestamptz' })
  fechaExpiracion!: Date;

  // vigente, utilizado, expirado
  @Column({ type: 'varchar', default: 'vigente' })
  estado!: string;

  @ManyToOne(() => Instalacion)
  @JoinColumn({ name: 'instalacionId' })
  instalacion!: Instalacion;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'supervisorId' })
  supervisor!: Usuario;
}
