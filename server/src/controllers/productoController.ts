import { Request, Response } from 'express';
import { AppDataSource } from '../config/configDev';
import { Producto } from '../entities/Producto';

export async function listarProductos(req: Request, res: Response) {
  try {
    const repo = AppDataSource.getRepository(Producto);

    // filtros opcionales por query param
    const where: any = {};
    if (req.query.categoria) where.categoria = req.query.categoria;
    if (req.query.compatibilidad) where.compatibilidad = req.query.compatibilidad;

    const productos = await repo.find({ where, order: { nombre: 'ASC' } });
    return res.json(productos);
  } catch (err: any) {
    console.error('Error al listar productos:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function crearProducto(req: Request, res: Response) {
  const { nombre, categoria, compatibilidad, unidad, descripcion } = req.body;

  if (!nombre || !categoria || !compatibilidad) {
    return res.status(400).json({ mensaje: 'Nombre, categoria y compatibilidad son obligatorios' });
  }

  try {
    const repo = AppDataSource.getRepository(Producto);
    const producto = repo.create({ nombre, categoria, compatibilidad, unidad, descripcion });
    await repo.save(producto);
    return res.status(201).json(producto);
  } catch (err: any) {
    console.error('Error al crear producto:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function editarProducto(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  const { nombre, categoria, compatibilidad, unidad, descripcion } = req.body;

  try {
    const repo = AppDataSource.getRepository(Producto);
    const producto = await repo.findOne({ where: { id } });

    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    repo.merge(producto, { nombre, categoria, compatibilidad, unidad, descripcion });
    await repo.save(producto);
    return res.json(producto);
  } catch (err: any) {
    console.error('Error al editar producto:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function eliminarProducto(req: Request, res: Response) {
  const id = parseInt(req.params.id);

  try {
    const repo = AppDataSource.getRepository(Producto);
    const producto = await repo.findOne({ where: { id } });

    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    await repo.remove(producto);
    return res.json({ mensaje: 'Producto eliminado' });
  } catch (err: any) {
    console.error('Error al eliminar producto:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}
