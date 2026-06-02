import { Request, Response } from 'express';
import { AppDataSource } from '../config/configDev';
import { Proyecto } from '../entities/Proyecto';
import { ContratoLaboral } from '../entities/ContratoLaboral';

// --- proyectos ---

export async function listarProyectos(req: Request, res: Response) {
  try {
    const repo = AppDataSource.getRepository(Proyecto);
    const proyectos = await repo.find({
      relations: ['cliente'],
      order: { nombre: 'ASC' },
    });
    return res.json(proyectos);
  } catch (err: any) {
    console.error('Error al listar proyectos:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function crearProyecto(req: Request, res: Response) {
  const { nombre, descripcion, fechaInicio, fechaFin, presupuesto, estandarLimpieza, clienteId } = req.body;

  if (!nombre || !fechaInicio || !clienteId) {
    return res.status(400).json({ mensaje: 'Nombre, fecha de inicio y cliente son obligatorios' });
  }

  try {
    const repo = AppDataSource.getRepository(Proyecto);
    const proyecto = repo.create({ nombre, descripcion, fechaInicio, fechaFin, presupuesto, estandarLimpieza, clienteId, estado: 'activo' });
    await repo.save(proyecto);
    return res.status(201).json(proyecto);
  } catch (err: any) {
    console.error('Error al crear proyecto:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function editarProyecto(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  const { nombre, descripcion, fechaInicio, fechaFin, presupuesto, estandarLimpieza, estado } = req.body;

  try {
    const repo = AppDataSource.getRepository(Proyecto);
    const proyecto = await repo.findOne({ where: { id } });

    if (!proyecto) {
      return res.status(404).json({ mensaje: 'Proyecto no encontrado' });
    }

    repo.merge(proyecto, { nombre, descripcion, fechaInicio, fechaFin, presupuesto, estandarLimpieza, estado });
    await repo.save(proyecto);
    return res.json(proyecto);
  } catch (err: any) {
    console.error('Error al editar proyecto:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function eliminarProyecto(req: Request, res: Response) {
  const id = parseInt(req.params.id);

  try {
    const repo = AppDataSource.getRepository(Proyecto);
    const proyecto = await repo.findOne({ where: { id } });

    if (!proyecto) {
      return res.status(404).json({ mensaje: 'Proyecto no encontrado' });
    }

    await repo.remove(proyecto);
    return res.json({ mensaje: 'Proyecto eliminado' });
  } catch (err: any) {
    console.error('Error al eliminar proyecto:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

// --- contratos ---

export async function listarContratos(req: Request, res: Response) {
  try {
    const repo = AppDataSource.getRepository(ContratoLaboral);
    const contratos = await repo.find({
      relations: ['trabajador', 'proyecto'],
      order: { id: 'DESC' },
    });
    return res.json(contratos);
  } catch (err: any) {
    console.error('Error al listar contratos:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function crearContrato(req: Request, res: Response) {
  const { trabajadorId, proyectoId, tipo, fechaInicio, fechaFin, cargo, salario } = req.body;

  if (!trabajadorId || !proyectoId || !tipo || !fechaInicio) {
    return res.status(400).json({ mensaje: 'Trabajador, proyecto, tipo y fecha inicio son obligatorios' });
  }

  try {
    const repo = AppDataSource.getRepository(ContratoLaboral);
    const contrato = repo.create({ trabajadorId, proyectoId, tipo, fechaInicio, fechaFin, cargo, salario, estado: 'activo' });
    await repo.save(contrato);
    return res.status(201).json(contrato);
  } catch (err: any) {
    console.error('Error al crear contrato:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}
