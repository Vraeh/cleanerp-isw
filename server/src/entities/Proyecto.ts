import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, OneToMany, JoinColumn
} from 'typeorm';
import { Cliente } from './Cliente';
import { Adendum } from './Adendum';

@Entity('proyectos')
export class Proyecto {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nombre!: string;

  @Column({ nullable: true })
  descripcion!: string;

  @Column({ type: 'date' })
  fechaInicio!: string;

  @Column({ type: 'date', nullable: true })
  fechaFin!: string;

  @Column({ type: 'numeric', nullable: true })
  presupuesto!: number;

  @Column({ nullable: true })
  estandarLimpieza!: string;

  // activo, finalizado, suspendido
  @Column({ type: 'varchar', default: 'activo' })
  estado!: string;

  @Column()
  clienteId!: number;

  @ManyToOne(() => Cliente, cliente => cliente.proyectos)
  @JoinColumn({ name: 'clienteId' })
  cliente!: Cliente;

  @OneToMany(() => Adendum, adendum => adendum.proyecto)
  adendums!: Adendum[];
}
