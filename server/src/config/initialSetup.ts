import bcrypt from 'bcryptjs';
import { AppDataSource } from './configDev';
import { Usuario } from '../entities/Usuario';

export async function inicializarDatos() {
  const repo = AppDataSource.getRepository(Usuario);

  const cantidad = await repo.count();
  if (cantidad > 0) return;

  // usuarios de prueba para desarrollo
  const usuariosDemo = [
    { email: 'admin@cleanerp.cl', nombre: 'Carlos Muñoz', rol: 'admin' },
    { email: 'supervisor@cleanerp.cl', nombre: 'Andrea Sepúlveda', rol: 'supervisor' },
    { email: 'prevencion@cleanerp.cl', nombre: 'Roberto Fuentes', rol: 'prevencion' },
  ];

  for (const datos of usuariosDemo) {
    const passwordHash = await bcrypt.hash('demo1234', 10);
    const usuario = repo.create({ ...datos, passwordHash } as any);
    await repo.save(usuario);
  }

  console.log('Usuarios demo creados.');
}
