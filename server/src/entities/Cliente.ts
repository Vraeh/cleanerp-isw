import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, OneToMany, JoinColumn
} from 'typeorm';
import { TipoEstablecimiento } from './TipoEstablecimiento';
import { Instalacion } from './Instalacion';
import { Proyecto } from './Proyecto';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  rut!: string;

  @Column()
  nombre!: string;

  @Column({ type: 'varchar', nullable: true })
  direccion?: string | null;

  @Column({ type: 'varchar', nullable: true })
  ciudad?: string | null;

  @Column({ type: 'varchar', nullable: true })
  nombreContacto?: string | null;

  @Column({ type: 'varchar', nullable: true })
  emailContacto?: string | null;

  @Column({ type: 'varchar', nullable: true })
  telefonoContacto?: string | null;

  @Column()
  tipoEstablecimientoId!: number;

  @ManyToOne(() => TipoEstablecimiento, tipo => tipo.clientes)
  @JoinColumn({ name: 'tipoEstablecimientoId' })
  tipoEstablecimiento!: TipoEstablecimiento;

  @OneToMany(() => Instalacion, instalacion => instalacion.cliente)
  instalaciones!: Instalacion[];

  @OneToMany(() => Proyecto, proyecto => proyecto.cliente)
  proyectos!: Proyecto[];
}
