import { Request, Response } from 'express';
import { AppDataSource } from '../config/configDev';
import { Cliente } from '../entities/Cliente';
import { Instalacion } from '../entities/Instalacion';
import { TipoEstablecimiento } from '../entities/TipoEstablecimiento';

// --- tipos de establecimiento ---

export async function listarTipos(req: Request, res: Response) {
  try {
    const repo = AppDataSource.getRepository(TipoEstablecimiento);
    const tipos = await repo.find({ order: { nombre: 'ASC' } });
    return res.json(tipos);
  } catch (err: any) {
    console.error('Error al listar tipos:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

// --- clientes ---

export async function listarClientes(req: Request, res: Response) {
  try {
    const repo = AppDataSource.getRepository(Cliente);
    const clientes = await repo.find({
      relations: ['tipoEstablecimiento', 'instalaciones'],
      order: { nombre: 'ASC' },
    });
    return res.json(clientes);
  } catch (err: any) {
    console.error('Error al listar clientes:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function crearCliente(req: Request, res: Response) {
  const { rut, nombre, direccion, ciudad, nombreContacto, emailContacto, telefonoContacto, tipoEstablecimientoId } = req.body;

  if (!rut || !nombre || !tipoEstablecimientoId) {
    return res.status(400).json({ mensaje: 'RUT, nombre y tipo de establecimiento son obligatorios' });
  }

  try {
    const repo = AppDataSource.getRepository(Cliente);

    const existe = await repo.findOne({ where: { rut } });
    if (existe) {
      return res.status(400).json({ mensaje: 'Ya existe un cliente con ese RUT' });
    }

    const cliente = repo.create({
      rut, nombre, direccion, ciudad, nombreContacto, emailContacto, telefonoContacto,
      tipoEstablecimientoId: parseInt(tipoEstablecimientoId),
    });
    await repo.save(cliente);
    return res.status(201).json(cliente);
  } catch (err: any) {
    console.error('Error al crear cliente:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function editarCliente(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  const { nombre, direccion, ciudad, nombreContacto, emailContacto, telefonoContacto, tipoEstablecimientoId } = req.body;

  try {
    const repo = AppDataSource.getRepository(Cliente);
    const cliente = await repo.findOne({ where: { id } });

    if (!cliente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    repo.merge(cliente, {
      nombre, direccion, ciudad, nombreContacto, emailContacto, telefonoContacto,
      tipoEstablecimientoId: parseInt(tipoEstablecimientoId),
    });
    await repo.save(cliente);
    return res.json(cliente);
  } catch (err: any) {
    console.error('Error al editar cliente:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function eliminarCliente(req: Request, res: Response) {
  const id = parseInt(req.params.id);

  try {
    const repo = AppDataSource.getRepository(Cliente);
    const cliente = await repo.findOne({ where: { id } });

    if (!cliente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    await repo.remove(cliente);
    return res.json({ mensaje: 'Cliente eliminado' });
  } catch (err: any) {
    console.error('Error al eliminar cliente:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

// --- instalaciones ---

export async function listarInstalaciones(req: Request, res: Response) {
  const clienteId = parseInt(req.params.id);

  try {
    const repo = AppDataSource.getRepository(Instalacion);
    const instalaciones = await repo.find({
      where: { clienteId },
      order: { nombre: 'ASC' },
    });
    return res.json(instalaciones);
  } catch (err: any) {
    console.error('Error al listar instalaciones:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function listarTodasInstalaciones(req: Request, res: Response) {
  try {
    const repo = AppDataSource.getRepository(Instalacion);
    const instalaciones = await repo.find({
      relations: ['cliente'],
      order: { nombre: 'ASC' },
    });
    return res.json(instalaciones);
  } catch (err: any) {
    console.error('Error al listar todas las instalaciones:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function crearInstalacion(req: Request, res: Response) {
  const { nombre, direccion, clienteId } = req.body;

  if (!nombre || !clienteId) {
    return res.status(400).json({ mensaje: 'Nombre y cliente son obligatorios' });
  }

  try {
    const repo = AppDataSource.getRepository(Instalacion);
    const instalacion = repo.create({ nombre, direccion, clienteId: parseInt(clienteId) });
    await repo.save(instalacion);
    return res.status(201).json(instalacion);
  } catch (err: any) {
    console.error('Error al crear instalacion:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function editarInstalacion(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  const { nombre, direccion } = req.body;

  try {
    const repo = AppDataSource.getRepository(Instalacion);
    const instalacion = await repo.findOne({ where: { id } });

    if (!instalacion) {
      return res.status(404).json({ mensaje: 'Instalacion no encontrada' });
    }

    repo.merge(instalacion, { nombre, direccion: direccion || null });
    await repo.save(instalacion);
    return res.json(instalacion);
  } catch (err: any) {
    console.error('Error al editar instalacion:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function eliminarInstalacion(req: Request, res: Response) {
  const id = parseInt(req.params.id);

  try {
    const repo = AppDataSource.getRepository(Instalacion);
    const instalacion = await repo.findOne({ where: { id } });

    if (!instalacion) {
      return res.status(404).json({ mensaje: 'Instalacion no encontrada' });
    }

    await repo.remove(instalacion);
    return res.json({ mensaje: 'Instalacion eliminada' });
  } catch (err: any) {
    console.error('Error al eliminar instalacion:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}
