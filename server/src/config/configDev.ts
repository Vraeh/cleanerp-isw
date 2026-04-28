import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from './configEnv';

// entidades de usuarios
import { Usuario } from '../entities/Usuario';

// entidades de clientes, instalaciones y proyectos
import { TipoEstablecimiento } from '../entities/TipoEstablecimiento';
import { Cliente } from '../entities/Cliente';
import { Instalacion } from '../entities/Instalacion';
import { Proyecto } from '../entities/Proyecto';
import { Adendum } from '../entities/Adendum';

// entidades de personal
import { Trabajador } from '../entities/Trabajador';
import { ContratoLaboral } from '../entities/ContratoLaboral';
import { Asignacion } from '../entities/Asignacion';

// entidades de asistencia
import { TokenAsistencia } from '../entities/TokenAsistencia';
import { RegistroAsistencia } from '../entities/RegistroAsistencia';
import { Licencia } from '../entities/Licencia';
import { EventoHojaVida } from '../entities/EventoHojaVida';

// entidades de inventario
import { Producto } from '../entities/Producto';
import { StockInstalacion } from '../entities/StockInstalacion';
import { MovimientoInventario } from '../entities/MovimientoInventario';
import { SolicitudReabastecimiento } from '../entities/SolicitudReabastecimiento';
import { ItemSolicitud } from '../entities/ItemSolicitud';
import { Equipamiento } from '../entities/Equipamiento';
import { TransferenciaEquipamiento } from '../entities/TransferenciaEquipamiento';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DATABASE,
  synchronize: true,
  logging: false, // TODO: activar en true para ver las queries mientras desarrollamos
  entities: [
    Usuario,
    TipoEstablecimiento,
    Cliente,
    Instalacion,
    Proyecto,
    Adendum,
    Trabajador,
    ContratoLaboral,
    Asignacion,
    TokenAsistencia,
    RegistroAsistencia,
    Licencia,
    EventoHojaVida,
    Producto,
    StockInstalacion,
    MovimientoInventario,
    SolicitudReabastecimiento,
    ItemSolicitud,
    Equipamiento,
    TransferenciaEquipamiento,
  ],
});
