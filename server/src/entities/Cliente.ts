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

  @Column({ nullable: true })
  direccion!: string;

  @Column({ nullable: true })
  ciudad!: string;

  @Column({ nullable: true })
  nombreContacto!: string;

  @Column({ nullable: true })
  emailContacto!: string;

  @Column({ nullable: true })
  telefonoContacto!: string;

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
