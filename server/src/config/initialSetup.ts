import bcrypt from 'bcryptjs';
import { AppDataSource } from './configDev';
import { Usuario } from '../entities/Usuario';
import { TipoEstablecimiento } from '../entities/TipoEstablecimiento';

export async function inicializarDatos() {
  const repoUsuario = AppDataSource.getRepository(Usuario);
  const repoTipo = AppDataSource.getRepository(TipoEstablecimiento);

  // tipos de establecimiento que maneja la empresa
  const cantidadTipos = await repoTipo.count();
  if (cantidadTipos === 0) {
    const tipos = [
      'Hospital',
      'Clínica',
      'Colegio',
      'Universidad',
      'Oficina corporativa',
      'Centro comercial',
      'Planta industrial',
      'Hotel',
    ];

    for (const nombre of tipos) {
      const tipo = repoTipo.create({ nombre });
      await repoTipo.save(tipo);
    }

    console.log('Tipos de establecimiento creados.');
  }

  // usuarios de prueba para desarrollo
  const cantidadUsuarios = await repoUsuario.count();
  if (cantidadUsuarios === 0) {
    const usuariosDemo = [
      { email: 'admin@cleanerp.cl', nombre: 'Carlos Muñoz', rol: 'admin' },
      { email: 'supervisor@cleanerp.cl', nombre: 'Andrea Sepúlveda', rol: 'supervisor' },
      { email: 'prevencion@cleanerp.cl', nombre: 'Roberto Fuentes', rol: 'prevencion' },
    ];

    for (const datos of usuariosDemo) {
      const passwordHash = await bcrypt.hash('demo1234', 10);
      const usuario = repoUsuario.create({ ...datos, passwordHash } as any);
      await repoUsuario.save(usuario);
    }

    console.log('Usuarios demo creados.');
  }
}
