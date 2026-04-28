import {
  Entity, PrimaryGeneratedColumn, Column,
  OneToMany
} from 'typeorm';
import { ContratoLaboral } from './ContratoLaboral';
import { Asignacion } from './Asignacion';

@Entity('trabajadores')
export class Trabajador {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  rut!: string;

  @Column()
  nombres!: string;

  @Column()
  apellidos!: string;

  @Column({ nullable: true })
  email!: string;

  @Column({ nullable: true })
  telefono!: string;

  @Column({ nullable: true })
  direccion!: string;

  @Column({ type: 'date', nullable: true })
  fechaNacimiento!: string;

  // capital, cuprum, habitat, planvital, provida, uno
  @Column({ nullable: true })
  afp!: string;

  // fonasa_a, fonasa_b, fonasa_c, fonasa_d, isapre_*
  @Column({ nullable: true })
  salud!: string;

  // completa, parcial, turno
  @Column({ nullable: true })
  tipoJornada!: string;

  @Column({ nullable: true })
  horarioColacion!: string;

  @Column({ nullable: true })
  cargo!: string;

  @Column({ nullable: true })
  cuentaRut!: string;

  @OneToMany(() => ContratoLaboral, contrato => contrato.trabajador)
  contratos!: ContratoLaboral[];

  @OneToMany(() => Asignacion, asignacion => asignacion.trabajador)
  asignaciones!: Asignacion[];
}
