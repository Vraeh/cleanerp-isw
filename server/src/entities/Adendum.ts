import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn
} from 'typeorm';
import { Proyecto } from './Proyecto';

@Entity('adendums')
export class Adendum {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  proyectoId!: number;

  @Column({ type: 'int' })
  numero!: number;

  @Column()
  descripcion!: string;

  @Column({ type: 'date' })
  fecha!: string;

  @Column({ type: 'numeric', nullable: true })
  monto!: number;

  @ManyToOne(() => Proyecto, proyecto => proyecto.adendums)
  @JoinColumn({ name: 'proyectoId' })
  proyecto!: Proyecto;
}
