import { Request, Response } from 'express';
import { AppDataSource } from '../config/configDev';
import { SolicitudReabastecimiento } from '../entities/SolicitudReabastecimiento';
import { ItemSolicitud } from '../entities/ItemSolicitud';

export async function listarSolicitudes(req: Request, res: Response) {
  try {
    const repo = AppDataSource.getRepository(SolicitudReabastecimiento);
    const solicitudes = await repo.find({
      relations: ['instalacion', 'solicitadoPor', 'revisadoPor', 'items', 'items.producto'],
      order: { creadoEn: 'DESC' },
    });
    return res.json(solicitudes);
  } catch (err: any) {
    console.error('error al listar solicitudes:', err);
    return res.status(500).json({ mensaje: 'error interno' });
  }
}

export async function obtenerSolicitud(req: Request, res: Response) {
  const id = parseInt(req.params.id);

  try {
    const repo = AppDataSource.getRepository(SolicitudReabastecimiento);
    const solicitud = await repo.findOne({
      where: { id },
      relations: ['instalacion', 'solicitadoPor', 'revisadoPor', 'items', 'items.producto'],
    });
    if (!solicitud) return res.status(404).json({ mensaje: 'solicitud no encontrada' });
    return res.json(solicitud);
  } catch (err: any) {
    console.error('error al obtener solicitud:', err);
    return res.status(500).json({ mensaje: 'error interno' });
  }
}

export async function solicitudesPorInstalacion(req: Request, res: Response) {
  const instalacionId = parseInt(req.params.id);

  try {
    const repo = AppDataSource.getRepository(SolicitudReabastecimiento);
    const solicitudes = await repo.find({
      where: { instalacionId },
      relations: ['solicitadoPor', 'items', 'items.producto'],
      order: { creadoEn: 'DESC' },
    });
    return res.json(solicitudes);
  } catch (err: any) {
    console.error('error al listar solicitudes por instalacion:', err);
    return res.status(500).json({ mensaje: 'error interno' });
  }
}

export async function crearSolicitud(req: Request, res: Response) {
  const { instalacionId, notas, items } = req.body;
  const solicitadoPorId = (req as any).usuario?.id;

  if (!instalacionId || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ mensaje: 'instalacionId e items son obligatorios' });
  }

  try {
    const repoSol = AppDataSource.getRepository(SolicitudReabastecimiento);
    const repoItem = AppDataSource.getRepository(ItemSolicitud);

    const solicitud = repoSol.create({ instalacionId, solicitadoPorId, notas: notas || null, estado: 'pendiente' });
    await repoSol.save(solicitud);

    for (const item of items) {
      if (!item.productoId || !item.cantidad) continue;
      const it = repoItem.create({ solicitudId: solicitud.id, productoId: item.productoId, cantidad: item.cantidad });
      await repoItem.save(it);
    }

    const completa = await repoSol.findOne({
      where: { id: solicitud.id },
      relations: ['items', 'items.producto'],
    });
    return res.status(201).json(completa);
  } catch (err: any) {
    console.error('error al crear solicitud:', err);
    return res.status(500).json({ mensaje: 'error interno' });
  }
}

export async function cambiarEstadoSolicitud(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  const { estado, notas } = req.body;
  const usuarioId = (req as any).usuario?.id;

  const estadosValidos = ['aprobada', 'en_proceso', 'entregada', 'rechazada'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ mensaje: 'Estado invalido' });
  }

  try {
    const repo = AppDataSource.getRepository(SolicitudReabastecimiento);
    const solicitud = await repo.findOne({ where: { id } });

    if (!solicitud) return res.status(404).json({ mensaje: 'solicitud no encontrada' });

    // quien crea no puede aprobar
    if ((estado === 'aprobada' || estado === 'rechazada') && solicitud.solicitadoPorId === usuarioId) {
      return res.status(403).json({ mensaje: 'No puedes aprobar o rechazar una solicitud que tu mismo creaste' });
    }

    solicitud.estado = estado;
    if (notas) solicitud.notas = notas;
    if (estado === 'aprobada' || estado === 'rechazada') {
      solicitud.revisadoPorId = usuarioId;
    }
    await repo.save(solicitud);
    return res.json(solicitud);
  } catch (err: any) {
    console.error('error al cambiar estado solicitud:', err);
    return res.status(500).json({ mensaje: 'error interno' });
  }
}

export async function eliminarSolicitud(req: Request, res: Response) {
  const id = parseInt(req.params.id);

  try {
    const repo = AppDataSource.getRepository(SolicitudReabastecimiento);
    const solicitud = await repo.findOne({ where: { id } });

    if (!solicitud) return res.status(404).json({ mensaje: 'solicitud no encontrada' });
    if (solicitud.estado !== 'pendiente') {
      return res.status(400).json({ mensaje: 'solo se pueden eliminar solicitudes pendientes' });
    }

    await repo.remove(solicitud);
    return res.json({ mensaje: 'solicitud eliminada' });
  } catch (err: any) {
    console.error('error al eliminar solicitud:', err);
    return res.status(500).json({ mensaje: 'error interno' });
  }
}
