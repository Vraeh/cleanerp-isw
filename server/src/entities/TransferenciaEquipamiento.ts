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

  @Column({ nullable: true })
  instalacionOrigenId!: number;

  @Column({ nullable: true })
  instalacionDestinoId!: number;

  @CreateDateColumn()
  fecha!: Date;

  @Column()
  responsableId!: number;

  @Column({ nullable: true })
  motivo!: string;

  @ManyToOne(() => Equipamiento)
  @JoinColumn({ name: 'equipamientoId' })
  equipamiento!: Equipamiento;

  @ManyToOne(() => Instalacion, { nullable: true })
  @JoinColumn({ name: 'instalacionOrigenId' })
  instalacionOrigen!: Instalacion;

  @ManyToOne(() => Instalacion, { nullable: true })
  @JoinColumn({ name: 'instalacionDestinoId' })
  instalacionDestino!: Instalacion;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'responsableId' })
  responsable!: Usuario;
}
