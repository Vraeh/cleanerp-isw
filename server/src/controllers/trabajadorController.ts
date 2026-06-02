import { Request, Response } from 'express';
import { AppDataSource } from '../config/configDev';
import { Trabajador } from '../entities/Trabajador';

export async function listarTrabajadores(req: Request, res: Response) {
  try {
    const repo = AppDataSource.getRepository(Trabajador);
    const trabajadores = await repo.find({ order: { apellidos: 'ASC' } });
    return res.json(trabajadores);
  } catch (err: any) {
    console.error('Error al listar trabajadores:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function crearTrabajador(req: Request, res: Response) {
  const { rut, nombres, apellidos, email, telefono, direccion, fechaNacimiento, afp, salud, tipoJornada, horarioColacion, cargo, cuentaRut } = req.body;

  if (!rut || !nombres || !apellidos) {
    return res.status(400).json({ mensaje: 'RUT, nombres y apellidos son obligatorios' });
  }

  try {
    const repo = AppDataSource.getRepository(Trabajador);

    const existe = await repo.findOne({ where: { rut } });
    if (existe) {
      return res.status(400).json({ mensaje: 'Ya existe un trabajador con ese RUT' });
    }

    const trabajador = repo.create({
      rut, nombres, apellidos, email, telefono, direccion,
      fechaNacimiento: fechaNacimiento || null,
      afp, salud, tipoJornada, horarioColacion, cargo, cuentaRut,
    });
    await repo.save(trabajador);
    return res.status(201).json(trabajador);
  } catch (err: any) {
    console.error('Error al crear trabajador:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function editarTrabajador(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  const { nombres, apellidos, email, telefono, direccion, fechaNacimiento, afp, salud, tipoJornada, horarioColacion, cargo, cuentaRut } = req.body;

  try {
    const repo = AppDataSource.getRepository(Trabajador);
    const trabajador = await repo.findOne({ where: { id } });

    if (!trabajador) {
      return res.status(404).json({ mensaje: 'Trabajador no encontrado' });
    }

    repo.merge(trabajador, {
      nombres, apellidos, email, telefono, direccion,
      fechaNacimiento: fechaNacimiento || null,
      afp, salud, tipoJornada, horarioColacion, cargo, cuentaRut,
    });
    await repo.save(trabajador);
    return res.json(trabajador);
  } catch (err: any) {
    console.error('Error al editar trabajador:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function eliminarTrabajador(req: Request, res: Response) {
  const id = parseInt(req.params.id);

  try {
    const repo = AppDataSource.getRepository(Trabajador);
    const trabajador = await repo.findOne({ where: { id } });

    if (!trabajador) {
      return res.status(404).json({ mensaje: 'Trabajador no encontrado' });
    }

    await repo.remove(trabajador);
    return res.json({ mensaje: 'Trabajador eliminado' });
  } catch (err: any) {
    console.error('Error al eliminar trabajador:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}
