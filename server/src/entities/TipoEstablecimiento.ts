import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Cliente } from './Cliente';

@Entity('tipos_establecimiento')
export class TipoEstablecimiento {
  @PrimaryGeneratedColumn()
  id!: number;

  // hospital, consultorio, universidad, oficina_publica, colegio
  @Column({ unique: true })
  nombre!: string;

  @Column({ nullable: true })
  descripcion!: string;

  @OneToMany(() => Cliente, cliente => cliente.tipoEstablecimiento)
  clientes!: Cliente[];
}
