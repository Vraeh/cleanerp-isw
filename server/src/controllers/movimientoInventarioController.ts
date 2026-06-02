import { Request, Response } from 'express';
import { AppDataSource } from '../config/configDev';
import { MovimientoInventario } from '../entities/MovimientoInventario';
import { StockInstalacion } from '../entities/StockInstalacion';

export async function listarMovimientos(req: Request, res: Response) {
  try {
    const repo = AppDataSource.getRepository(MovimientoInventario);
    const movimientos = await repo.find({
      relations: ['producto', 'instalacionOrigen', 'instalacionDestino', 'responsable'],
      order: { fecha: 'DESC' },
    });
    return res.json(movimientos);
  } catch (err: any) {
    console.error('Error al listar movimientos:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function movimientosPorInstalacion(req: Request, res: Response) {
  const instalacionId = parseInt(req.params.id);

  try {
    const repo = AppDataSource.getRepository(MovimientoInventario);
    const movimientos = await repo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.producto', 'producto')
      .leftJoinAndSelect('m.instalacionOrigen', 'origen')
      .leftJoinAndSelect('m.instalacionDestino', 'destino')
      .leftJoinAndSelect('m.responsable', 'responsable')
      .where('m.instalacionOrigenId = :id OR m.instalacionDestinoId = :id', { id: instalacionId })
      .orderBy('m.fecha', 'DESC')
      .getMany();

    return res.json(movimientos);
  } catch (err: any) {
    console.error('Error al obtener movimientos por instalacion:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function movimientosPorProducto(req: Request, res: Response) {
  const productoId = parseInt(req.params.id);

  try {
    const repo = AppDataSource.getRepository(MovimientoInventario);
    const movimientos = await repo.find({
      where: { productoId },
      relations: ['instalacionOrigen', 'instalacionDestino', 'responsable'],
      order: { fecha: 'DESC' },
    });
    return res.json(movimientos);
  } catch (err: any) {
    console.error('Error al obtener movimientos por producto:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function registrarMovimiento(req: Request, res: Response) {
  const { productoId, tipo, cantidad, instalacionOrigenId, instalacionDestinoId, notas } = req.body;
  const responsableId = (req as any).usuario?.id;

  if (!productoId || !tipo || !cantidad) {
    return res.status(400).json({ mensaje: 'productoId, tipo y cantidad son obligatorios' });
  }

  const tiposValidos = ['entrada', 'salida', 'transferencia'];
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({ mensaje: 'tipo debe ser: entrada, salida o transferencia' });
  }

  if (tipo === 'transferencia' && (!instalacionOrigenId || !instalacionDestinoId)) {
    return res.status(400).json({ mensaje: 'Las transferencias requieren instalacionOrigenId e instalacionDestinoId' });
  }
  if (tipo === 'entrada' && !instalacionDestinoId) {
    return res.status(400).json({ mensaje: 'Las entradas requieren instalacionDestinoId' });
  }
  if (tipo === 'salida' && !instalacionOrigenId) {
    return res.status(400).json({ mensaje: 'Las salidas requieren instalacionOrigenId' });
  }

  const repoMov = AppDataSource.getRepository(MovimientoInventario);
  const repoStock = AppDataSource.getRepository(StockInstalacion);

  try {
    // validar y ajustar stock en instalacion origen
    if (instalacionOrigenId) {
      const stockOrigen = await repoStock.findOne({ where: { productoId, instalacionId: instalacionOrigenId } });
      if (!stockOrigen) {
        return res.status(400).json({ mensaje: 'No hay registro de stock para ese producto en la instalacion origen' });
      }
      if (stockOrigen.stockActual < cantidad) {
        return res.status(400).json({ mensaje: `Stock insuficiente. Disponible: ${stockOrigen.stockActual}` });
      }
      stockOrigen.stockActual -= cantidad;
      await repoStock.save(stockOrigen);
    }

    // incrementar stock en instalacion destino
    if (instalacionDestinoId) {
      let stockDestino = await repoStock.findOne({ where: { productoId, instalacionId: instalacionDestinoId } });
      if (!stockDestino) {
        stockDestino = repoStock.create({ productoId, instalacionId: instalacionDestinoId, stockActual: 0, umbralMinimo: 0, umbralMaximo: 0 });
      }
      stockDestino.stockActual += cantidad;
      await repoStock.save(stockDestino);
    }

    const movimiento = repoMov.create({
      productoId, tipo, cantidad,
      instalacionOrigenId: instalacionOrigenId || null,
      instalacionDestinoId: instalacionDestinoId || null,
      responsableId,
      notas: notas || null,
    });
    await repoMov.save(movimiento);
    return res.status(201).json(movimiento);
  } catch (err: any) {
    console.error('Error al registrar movimiento:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}
