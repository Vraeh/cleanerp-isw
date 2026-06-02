import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import { Instalacion } from './Instalacion';
import { Usuario } from './Usuario';
import { ItemSolicitud } from './ItemSolicitud';

@Entity('solicitudes_reabastecimiento')
export class SolicitudReabastecimiento {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  instalacionId!: number;

  @Column()
  solicitadoPorId!: number;

  @Column({ type: 'int', nullable: true })
  revisadoPorId?: number | null;

  // pendiente, aprobada, en_proceso, entregada, rechazada
  @Column({ type: 'varchar', default: 'pendiente' })
  estado!: string;

  @Column({ type: 'varchar', nullable: true })
  notas?: string | null;

  @CreateDateColumn()
  creadoEn!: Date;

  @UpdateDateColumn()
  actualizadoEn!: Date;

  @ManyToOne(() => Instalacion)
  @JoinColumn({ name: 'instalacionId' })
  instalacion!: Instalacion;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'solicitadoPorId' })
  solicitadoPor!: Usuario;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'revisadoPorId' })
  revisadoPor?: Usuario | null;

  @OneToMany(() => ItemSolicitud, item => item.solicitud)
  items!: ItemSolicitud[];
}
