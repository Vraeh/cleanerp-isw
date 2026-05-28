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

  @Column({ type: 'varchar', nullable: true })
  email?: string | null;

  @Column({ type: 'varchar', nullable: true })
  telefono?: string | null;

  @Column({ type: 'varchar', nullable: true })
  direccion?: string | null;

  @Column({ type: 'date', nullable: true })
  fechaNacimiento?: string | null;

  // capital, cuprum, habitat, planvital, provida, uno
  @Column({ type: 'varchar', nullable: true })
  afp?: string | null;

  // fonasa_a, fonasa_b, fonasa_c, fonasa_d, isapre_*
  @Column({ type: 'varchar', nullable: true })
  salud?: string | null;

  // completa, parcial, turno
  @Column({ type: 'varchar', nullable: true })
  tipoJornada?: string | null;

  @Column({ type: 'varchar', nullable: true })
  horarioColacion?: string | null;

  @Column({ type: 'varchar', nullable: true })
  cargo?: string | null;

  @Column({ type: 'varchar', nullable: true })
  cuentaRut?: string | null;

  @OneToMany(() => ContratoLaboral, contrato => contrato.trabajador)
  contratos!: ContratoLaboral[];

  @OneToMany(() => Asignacion, asignacion => asignacion.trabajador)
  asignaciones!: Asignacion[];
}
