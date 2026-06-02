import { Request, Response } from 'express';
import { AppDataSource } from '../config/configDev';
import { Licencia } from '../entities/Licencia';

export async function listarLicencias(req: Request, res: Response) {
  try {
    const repo = AppDataSource.getRepository(Licencia);
    const licencias = await repo.find({
      relations: ['trabajador'],
      order: { fechaInicio: 'DESC' },
    });
    return res.json(licencias);
  } catch (err: any) {
    console.error('error al listar licencias:', err);
    return res.status(500).json({ mensaje: 'error interno' });
  }
}

export async function licenciasPorTrabajador(req: Request, res: Response) {
  const trabajadorId = parseInt(req.params.id);

  try {
    const repo = AppDataSource.getRepository(Licencia);
    const licencias = await repo.find({
      where: { trabajadorId },
      order: { fechaInicio: 'DESC' },
    });
    return res.json(licencias);
  } catch (err: any) {
    console.error('error al listar licencias por trabajador:', err);
    return res.status(500).json({ mensaje: 'error interno' });
  }
}

export async function crearLicencia(req: Request, res: Response) {
  const { trabajadorId, tipo, fechaInicio, fechaFin, dias, habilitaReemplazo, notas } = req.body;

  if (!trabajadorId || !tipo || !fechaInicio || !fechaFin || dias === undefined) {
    return res.status(400).json({ mensaje: 'trabajadorId, tipo, fechaInicio, fechaFin y dias son obligatorios' });
  }

  try {
    const repo = AppDataSource.getRepository(Licencia);
    const licencia = repo.create({
      trabajadorId, tipo, fechaInicio, fechaFin,
      dias: parseInt(dias),
      habilitaReemplazo: habilitaReemplazo || false,
      notas: notas || null,
      estado: 'pendiente',
    });
    await repo.save(licencia);
    return res.status(201).json(licencia);
  } catch (err: any) {
    console.error('error al crear licencia:', err);
    return res.status(500).json({ mensaje: 'error interno' });
  }
}

export async function actualizarEstadoLicencia(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  const { estado } = req.body;

  const estadosValidos = ['pendiente', 'aprobada', 'devuelta', 'rechazada'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ mensaje: 'Estado invalido. Valores: pendiente, aprobada, devuelta, rechazada' });
  }

  try {
    const repo = AppDataSource.getRepository(Licencia);
    const licencia = await repo.findOne({ where: { id } });

    if (!licencia) return res.status(404).json({ mensaje: 'Licencia no encontrada' });

    licencia.estado = estado;
    await repo.save(licencia);
    return res.json(licencia);
  } catch (err: any) {
    console.error('error al actualizar estado licencia:', err);
    return res.status(500).json({ mensaje: 'error interno' });
  }
}

export async function eliminarLicencia(req: Request, res: Response) {
  const id = parseInt(req.params.id);

  try {
    const repo = AppDataSource.getRepository(Licencia);
    const licencia = await repo.findOne({ where: { id } });

    if (!licencia) return res.status(404).json({ mensaje: 'Licencia no encontrada' });

    await repo.remove(licencia);
    return res.json({ mensaje: 'licencia eliminada' });
  } catch (err: any) {
    console.error('error al eliminar licencia:', err);
    return res.status(500).json({ mensaje: 'error interno' });
  }
}
