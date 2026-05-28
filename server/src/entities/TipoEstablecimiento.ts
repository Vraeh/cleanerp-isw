import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Cliente } from './Cliente';

@Entity('tipos_establecimiento')
export class TipoEstablecimiento {
  @PrimaryGeneratedColumn()
  id!: number;

  // hospital, consultorio, universidad, oficina_publica, colegio
  @Column({ unique: true })
  nombre!: string;

  @Column({ type: 'varchar', nullable: true })
  descripcion?: string | null;

  @OneToMany(() => Cliente, cliente => cliente.tipoEstablecimiento)
  clientes!: Cliente[];
}
