import { Request, Response } from 'express';
import { AppDataSource } from '../config/configDev';
import { EventoHojaVida } from '../entities/EventoHojaVida';

export async function listarEventos(req: Request, res: Response) {
  try {
    const repo = AppDataSource.getRepository(EventoHojaVida);
    const eventos = await repo.find({
      relations: ['trabajador', 'registradoPor', 'instalacion'],
      order: { fecha: 'DESC' },
    });
    return res.json(eventos);
  } catch (err: any) {
    console.error('error al listar eventos:', err);
    return res.status(500).json({ mensaje: 'error interno' });
  }
}

export async function eventosPorTrabajador(req: Request, res: Response) {
  const trabajadorId = parseInt(req.params.id);

  try {
    const repo = AppDataSource.getRepository(EventoHojaVida);
    const eventos = await repo.find({
      where: { trabajadorId },
      relations: ['registradoPor', 'instalacion'],
      order: { fecha: 'DESC' },
    });
    return res.json(eventos);
  } catch (err: any) {
    console.error('error al listar eventos por trabajador:', err);
    return res.status(500).json({ mensaje: 'error interno' });
  }
}

export async function crearEvento(req: Request, res: Response) {
  const { trabajadorId, tipo, fecha, descripcion, instalacionId } = req.body;
  const registradoPorId = (req as any).usuario?.id;

  if (!trabajadorId || !tipo || !fecha || !descripcion) {
    return res.status(400).json({ mensaje: 'trabajadorId, tipo, fecha y descripcion son obligatorios' });
  }

  try {
    const repo = AppDataSource.getRepository(EventoHojaVida);
    const evento = repo.create({
      trabajadorId, tipo, fecha, descripcion,
      registradoPorId,
      instalacionId: instalacionId || null,
    });
    await repo.save(evento);
    return res.status(201).json(evento);
  } catch (err: any) {
    console.error('error al crear evento:', err);
    return res.status(500).json({ mensaje: 'error interno' });
  }
}

export async function eliminarEvento(req: Request, res: Response) {
  const id = parseInt(req.params.id);

  try {
    const repo = AppDataSource.getRepository(EventoHojaVida);
    const evento = await repo.findOne({ where: { id } });

    if (!evento) return res.status(404).json({ mensaje: 'Evento no encontrado' });

    await repo.remove(evento);
    return res.json({ mensaje: 'evento eliminado' });
  } catch (err: any) {
    console.error('error al eliminar evento:', err);
    return res.status(500).json({ mensaje: 'error interno' });
  }
}
