import { Request, Response } from 'express';
import { AppDataSource } from '../config/configDev';
import { Equipamiento } from '../entities/Equipamiento';
import { TransferenciaEquipamiento } from '../entities/TransferenciaEquipamiento';

export async function listarEquipamiento(req: Request, res: Response) {
  try {
    const repo = AppDataSource.getRepository(Equipamiento);
    const equipos = await repo.find({
      relations: ['producto', 'instalacion'],
      order: { id: 'DESC' },
    });
    return res.json(equipos);
  } catch (err: any) {
    console.error('error al listar equipamiento:', err);
    return res.status(500).json({ mensaje: 'error interno' });
  }
}

export async function obtenerEquipo(req: Request, res: Response) {
  const id = parseInt(req.params.id);

  try {
    const repo = AppDataSource.getRepository(Equipamiento);
    const equipo = await repo.findOne({ where: { id }, relations: ['producto', 'instalacion'] });
    if (!equipo) return res.status(404).json({ mensaje: 'equipo no encontrado' });
    return res.json(equipo);
  } catch (err: any) {
    console.error('error al obtener equipo:', err);
    return res.status(500).json({ mensaje: 'error interno' });
  }
}

export async function equipamientoPorInstalacion(req: Request, res: Response) {
  const instalacionId = parseInt(req.params.id);

  try {
    const repo = AppDataSource.getRepository(Equipamiento);
    const equipos = await repo.find({
      where: { instalacionId },
      relations: ['producto'],
    });
    return res.json(equipos);
  } catch (err: any) {
    console.error('error al listar equipamiento por instalacion:', err);
    return res.status(500).json({ mensaje: 'error interno' });
  }
}

export async function crearEquipo(req: Request, res: Response) {
  const { productoId, numeroSerie, instalacionId, estado, fechaCompra, fechaUltimoMantenimiento } = req.body;

  if (!productoId || !numeroSerie) {
    return res.status(400).json({ mensaje: 'productoId y numeroSerie son obligatorios' });
  }

  try {
    const repo = AppDataSource.getRepository(Equipamiento);

    const existe = await repo.findOne({ where: { numeroSerie } });
    if (existe) return res.status(400).json({ mensaje: 'Ya existe un equipo con ese numero de serie' });

    const equipo = repo.create({
      productoId,
      numeroSerie,
      instalacionId: instalacionId || null,
      estado: estado || 'operativo',
      fechaCompra: fechaCompra || null,
      fechaUltimoMantenimiento: fechaUltimoMantenimiento || null,
    });
    await repo.save(equipo);
    return res.status(201).json(equipo);
  } catch (err: any) {
    console.error('error al crear equipo:', err);
    return res.status(500).json({ mensaje: 'error interno' });
  }
}

export async function actualizarEquipo(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  const { estado, fechaUltimoMantenimiento } = req.body;

  try {
    const repo = AppDataSource.getRepository(Equipamiento);
    const equipo = await repo.findOne({ where: { id } });

    if (!equipo) return res.status(404).json({ mensaje: 'equipo no encontrado' });

    repo.merge(equipo, { estado, fechaUltimoMantenimiento: fechaUltimoMantenimiento || equipo.fechaUltimoMantenimiento });
    await repo.save(equipo);
    return res.json(equipo);
  } catch (err: any) {
    console.error('error al actualizar equipo:', err);
    return res.status(500).json({ mensaje: 'error interno' });
  }
}

export async function eliminarEquipo(req: Request, res: Response) {
  const id = parseInt(req.params.id);

  try {
    const repo = AppDataSource.getRepository(Equipamiento);
    const equipo = await repo.findOne({ where: { id } });

    if (!equipo) return res.status(404).json({ mensaje: 'equipo no encontrado' });

    await repo.remove(equipo);
    return res.json({ mensaje: 'equipo eliminado' });
  } catch (err: any) {
    console.error('error al eliminar equipo:', err);
    return res.status(500).json({ mensaje: 'error interno' });
  }
}

export async function listarTransferencias(req: Request, res: Response) {
  try {
    const repo = AppDataSource.getRepository(TransferenciaEquipamiento);
    const transferencias = await repo.find({
      relations: ['equipamiento', 'equipamiento.producto', 'instalacionOrigen', 'instalacionDestino', 'responsable'],
      order: { fecha: 'DESC' },
    });
    return res.json(transferencias);
  } catch (err: any) {
    console.error('error al listar transferencias:', err);
    return res.status(500).json({ mensaje: 'error interno' });
  }
}

export async function crearTransferencia(req: Request, res: Response) {
  const { equipamientoId, instalacionDestinoId, motivo } = req.body;
  const responsableId = (req as any).usuario?.id;

  if (!equipamientoId || !instalacionDestinoId) {
    return res.status(400).json({ mensaje: 'equipamientoId e instalacionDestinoId son obligatorios' });
  }

  try {
    const repoEquipo = AppDataSource.getRepository(Equipamiento);
    const repoTrans = AppDataSource.getRepository(TransferenciaEquipamiento);

    const equipo = await repoEquipo.findOne({ where: { id: equipamientoId } });
    if (!equipo) return res.status(404).json({ mensaje: 'equipo no encontrado' });

    const instalacionOrigenId = equipo.instalacionId || null;

    const transferencia = repoTrans.create({
      equipamientoId,
      instalacionOrigenId,
      instalacionDestinoId,
      responsableId,
      motivo: motivo || null,
    });
    await repoTrans.save(transferencia);

    equipo.instalacionId = instalacionDestinoId;
    await repoEquipo.save(equipo);

    return res.status(201).json(transferencia);
  } catch (err: any) {
    console.error('error al crear transferencia:', err);
    return res.status(500).json({ mensaje: 'error interno' });
  }
}
