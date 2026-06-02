import { Request, Response } from 'express';
import { AppDataSource } from '../config/configDev';
import { StockInstalacion } from '../entities/StockInstalacion';
import { Trabajador } from '../entities/Trabajador';
import { Cliente } from '../entities/Cliente';
import { Proyecto } from '../entities/Proyecto';

export async function resumenStock(req: Request, res: Response) {
  try {
    const repo = AppDataSource.getRepository(StockInstalacion);
    const todos = await repo.find({ relations: ['producto', 'instalacion'] });

    // los que estan bajo el minimo
    const alertas = todos.filter(s => s.stockActual <= s.umbralMinimo && s.umbralMinimo > 0);

    return res.json({ total: todos.length, alertas: alertas.length, items: todos });
  } catch (err: any) {
    console.error('Error al obtener resumen de stock:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function stockPorInstalacion(req: Request, res: Response) {
  const instalacionId = parseInt(req.params.id);

  try {
    const repo = AppDataSource.getRepository(StockInstalacion);
    const stock = await repo.find({
      where: { instalacionId },
      relations: ['producto'],
    });
    return res.json(stock);
  } catch (err: any) {
    console.error('Error al obtener stock por instalacion:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function crearStock(req: Request, res: Response) {
  const { productoId, instalacionId, stockActual, umbralMinimo, umbralMaximo } = req.body;

  if (!productoId || !instalacionId) {
    return res.status(400).json({ mensaje: 'Producto e instalacion son obligatorios' });
  }

  try {
    const repo = AppDataSource.getRepository(StockInstalacion);

    const existe = await repo.findOne({ where: { productoId, instalacionId } });
    if (existe) {
      return res.status(400).json({ mensaje: 'Ya existe stock para ese producto en esa instalacion' });
    }

    const stock = repo.create({ productoId, instalacionId, stockActual: stockActual || 0, umbralMinimo: umbralMinimo || 0, umbralMaximo: umbralMaximo || 0 });
    await repo.save(stock);
    return res.status(201).json(stock);
  } catch (err: any) {
    console.error('Error al crear stock:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function editarStock(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  const { stockActual, umbralMinimo, umbralMaximo } = req.body;

  try {
    const repo = AppDataSource.getRepository(StockInstalacion);
    const stock = await repo.findOne({ where: { id } });

    if (!stock) {
      return res.status(404).json({ mensaje: 'Registro de stock no encontrado' });
    }

    repo.merge(stock, { stockActual, umbralMinimo, umbralMaximo });
    await repo.save(stock);
    return res.json(stock);
  } catch (err: any) {
    console.error('Error al editar stock:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function dashboardStats(req: Request, res: Response) {
  try {
    const trabajadores = await AppDataSource.getRepository(Trabajador).count();
    const clientes = await AppDataSource.getRepository(Cliente).count();
    const proyectosActivos = await AppDataSource.getRepository(Proyecto).count({ where: { estado: 'activo' } });

    const stockRepo = AppDataSource.getRepository(StockInstalacion);
    const todoStock = await stockRepo.find();
    const alertasStock = todoStock.filter(s => s.stockActual <= s.umbralMinimo && s.umbralMinimo > 0).length;

    return res.json({ trabajadores, clientes, proyectosActivos, alertasStock });
  } catch (err: any) {
    console.error('Error al obtener stats del dashboard:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}
