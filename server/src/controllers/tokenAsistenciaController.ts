import { Request, Response } from 'express';
import { AppDataSource } from '../config/configDev';
import { TokenAsistencia } from '../entities/TokenAsistencia';

function generarCodigo(): string {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const nums = '23456789';
  const pool = letras + nums;
  let codigo = '';
  for (let i = 0; i < 6; i++) {
    codigo += pool[Math.floor(Math.random() * pool.length)];
  }
  return codigo;
}

export async function generarToken(req: Request, res: Response) {
  const { instalacionId, minutosVigencia = 60 } = req.body;
  const supervisorId = (req as any).usuario?.id;

  if (!instalacionId) {
    return res.status(400).json({ mensaje: 'instalacionId es obligatorio' });
  }

  try {
    const repo = AppDataSource.getRepository(TokenAsistencia);

    // expirar tokens vigentes anteriores de esta instalacion
    const vigentes = await repo.find({ where: { instalacionId, estado: 'vigente' } });
    for (const t of vigentes) {
      t.estado = 'expirado';
      await repo.save(t);
    }

    const fechaExpiracion = new Date(Date.now() + minutosVigencia * 60 * 1000);
    const codigo = generarCodigo();

    const token = repo.create({ codigo, instalacionId, supervisorId, fechaExpiracion, estado: 'vigente' });
    await repo.save(token);

    return res.status(201).json(token);
  } catch (err: any) {
    console.error('Error al generar token:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function listarTokensPorInstalacion(req: Request, res: Response) {
  const instalacionId = parseInt(req.params.instalacionId);

  try {
    const repo = AppDataSource.getRepository(TokenAsistencia);

    // actualizar expirados automaticamente
    const vigentes = await repo.find({ where: { instalacionId, estado: 'vigente' } });
    const ahora = new Date();
    for (const t of vigentes) {
      if (new Date(t.fechaExpiracion) < ahora) {
        t.estado = 'expirado';
        await repo.save(t);
      }
    }

    const tokens = await repo.find({
      where: { instalacionId },
      relations: ['instalacion', 'supervisor'],
      order: { fechaGeneracion: 'DESC' },
    });
    return res.json(tokens);
  } catch (err: any) {
    console.error('Error al listar tokens:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function expirarToken(req: Request, res: Response) {
  const id = parseInt(req.params.id);

  try {
    const repo = AppDataSource.getRepository(TokenAsistencia);
    const token = await repo.findOne({ where: { id } });

    if (!token) return res.status(404).json({ mensaje: 'Token no encontrado' });

    token.estado = 'expirado';
    await repo.save(token);
    return res.json(token);
  } catch (err: any) {
    console.error('Error al expirar token:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}
