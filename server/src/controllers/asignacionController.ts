import { Request, Response } from 'express';
import { AppDataSource } from '../config/configDev';
import { Asignacion } from '../entities/Asignacion';

export async function listarAsignaciones(req: Request, res: Response) {
  try {
    const repo = AppDataSource.getRepository(Asignacion);
    const asignaciones = await repo.find({
      relations: ['trabajador', 'instalacion'],
      order: { fechaInicio: 'DESC' },
    });
    return res.json(asignaciones);
  } catch (err: any) {
    console.error('Error al listar asignaciones:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function asignacionesPorInstalacion(req: Request, res: Response) {
  const instalacionId = parseInt(req.params.id);

  try {
    const repo = AppDataSource.getRepository(Asignacion);
    const asignaciones = await repo.find({
      where: { instalacionId },
      relations: ['trabajador'],
      order: { esActual: 'DESC', fechaInicio: 'DESC' },
    });
    return res.json(asignaciones);
  } catch (err: any) {
    console.error('Error al listar asignaciones por instalacion:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function asignacionesPorTrabajador(req: Request, res: Response) {
  const trabajadorId = parseInt(req.params.id);

  try {
    const repo = AppDataSource.getRepository(Asignacion);
    const asignaciones = await repo.find({
      where: { trabajadorId },
      relations: ['instalacion'],
      order: { esActual: 'DESC', fechaInicio: 'DESC' },
    });
    return res.json(asignaciones);
  } catch (err: any) {
    console.error('Error al listar asignaciones por trabajador:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function crearAsignacion(req: Request, res: Response) {
  const { trabajadorId, instalacionId, fechaInicio, fechaFin } = req.body;

  if (!trabajadorId || !instalacionId || !fechaInicio) {
    return res.status(400).json({ mensaje: 'trabajadorId, instalacionId y fechaInicio son obligatorios' });
  }

  try {
    const repo = AppDataSource.getRepository(Asignacion);

    // desactivar asignaciones actuales del trabajador
    const actuales = await repo.find({ where: { trabajadorId, esActual: true } });
    for (const a of actuales) {
      a.esActual = false;
      a.fechaFin = fechaInicio;
      await repo.save(a);
    }

    const asignacion = repo.create({ trabajadorId, instalacionId, fechaInicio, fechaFin: fechaFin || null, esActual: true });
    await repo.save(asignacion);
    return res.status(201).json(asignacion);
  } catch (err: any) {
    console.error('Error al crear asignacion:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function desactivarAsignacion(req: Request, res: Response) {
  const id = parseInt(req.params.id);

  try {
    const repo = AppDataSource.getRepository(Asignacion);
    const asignacion = await repo.findOne({ where: { id } });

    if (!asignacion) return res.status(404).json({ mensaje: 'Asignacion no encontrada' });

    asignacion.esActual = false;
    asignacion.fechaFin = new Date().toISOString().split('T')[0];
    await repo.save(asignacion);
    return res.json(asignacion);
  } catch (err: any) {
    console.error('Error al desactivar asignacion:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function eliminarAsignacion(req: Request, res: Response) {
  const id = parseInt(req.params.id);

  try {
    const repo = AppDataSource.getRepository(Asignacion);
    const asignacion = await repo.findOne({ where: { id } });

    if (!asignacion) return res.status(404).json({ mensaje: 'Asignacion no encontrada' });

    await repo.remove(asignacion);
    return res.json({ mensaje: 'Asignacion eliminada' });
  } catch (err: any) {
    console.error('Error al eliminar asignacion:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}
