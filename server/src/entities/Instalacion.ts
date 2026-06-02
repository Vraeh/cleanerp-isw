import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, OneToMany, JoinColumn
} from 'typeorm';
import { Cliente } from './Cliente';
import { Usuario } from './Usuario';

@Entity('instalaciones')
export class Instalacion {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nombre!: string;

  @Column({ type: 'varchar', nullable: true })
  direccion?: string | null;

  @Column()
  clienteId!: number;

  @Column({ type: 'int', nullable: true })
  supervisorId?: number | null;

  @ManyToOne(() => Cliente, cliente => cliente.instalaciones)
  @JoinColumn({ name: 'clienteId' })
  cliente!: Cliente;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'supervisorId' })
  supervisor?: Usuario | null;
}
