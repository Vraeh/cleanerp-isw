import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn
} from 'typeorm';
import { Equipamiento } from './Equipamiento';
import { Instalacion } from './Instalacion';
import { Usuario } from './Usuario';

@Entity('transferencias_equipamiento')
export class TransferenciaEquipamiento {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  equipamientoId!: number;

  @Column({ type: 'int', nullable: true })
  instalacionOrigenId?: number | null;

  @Column({ type: 'int', nullable: true })
  instalacionDestinoId?: number | null;

  @CreateDateColumn()
  fecha!: Date;

  @Column()
  responsableId!: number;

  @Column({ type: 'varchar', nullable: true })
  motivo?: string | null;

  @ManyToOne(() => Equipamiento)
  @JoinColumn({ name: 'equipamientoId' })
  equipamiento!: Equipamiento;

  @ManyToOne(() => Instalacion, { nullable: true })
  @JoinColumn({ name: 'instalacionOrigenId' })
  instalacionOrigen?: Instalacion | null;

  @ManyToOne(() => Instalacion, { nullable: true })
  @JoinColumn({ name: 'instalacionDestinoId' })
  instalacionDestino?: Instalacion | null;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'responsableId' })
  responsable!: Usuario;
}
