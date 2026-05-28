import { Request, Response } from 'express';
import { AppDataSource } from '../config/configDev';
import { RegistroAsistencia } from '../entities/RegistroAsistencia';
import { TokenAsistencia } from '../entities/TokenAsistencia';

function hoyStr(): string {
  return new Date().toISOString().split('T')[0];
}

function horaStr(): string {
  return new Date().toTimeString().split(' ')[0]; // HH:MM:SS
}

export async function listarRegistros(req: Request, res: Response) {
  try {
    const repo = AppDataSource.getRepository(RegistroAsistencia);
    const registros = await repo.find({
      relations: ['trabajador', 'instalacion'],
      order: { fecha: 'DESC' },
    });
    return res.json(registros);
  } catch (err: any) {
    console.error('Error al listar registros:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function registrosPorInstalacion(req: Request, res: Response) {
  const instalacionId = parseInt(req.params.instalacionId);

  try {
    const repo = AppDataSource.getRepository(RegistroAsistencia);
    const registros = await repo.find({
      where: { instalacionId },
      relations: ['trabajador'],
      order: { fecha: 'DESC' },
    });
    return res.json(registros);
  } catch (err: any) {
    console.error('Error al obtener registros por instalacion:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function registrarEntrada(req: Request, res: Response) {
  const { trabajadorId, instalacionId, codigo } = req.body;

  if (!trabajadorId || !instalacionId || !codigo) {
    return res.status(400).json({ mensaje: 'trabajadorId, instalacionId y codigo son obligatorios' });
  }

  try {
    const repoReg = AppDataSource.getRepository(RegistroAsistencia);
    const repoToken = AppDataSource.getRepository(TokenAsistencia);

    const hoy = hoyStr();

    // no puede registrar entrada si ya tiene una sin salida hoy
    const yaEntro = await repoReg.findOne({
      where: { trabajadorId, instalacionId, fecha: hoy },
    });
    if (yaEntro && yaEntro.horaEntrada && !yaEntro.horaSalida) {
      return res.status(400).json({ mensaje: 'El trabajador ya tiene entrada registrada hoy sin salida' });
    }

    // validar token
    const token = await repoToken.findOne({
      where: { codigo, instalacionId, estado: 'vigente' },
    });

    let estadoValidacion = 'aprobado';
    let tokenId: number | null = null;

    if (!token) {
      // buscar si el codigo existe pero es de otra instalacion o expirado
      const tokenAny = await repoToken.findOne({ where: { codigo } });
      estadoValidacion = tokenAny ? 'token_invalido' : 'token_expirado';
    } else {
      const ahora = new Date();
      if (new Date(token.fechaExpiracion) < ahora) {
        token.estado = 'expirado';
        await repoToken.save(token);
        estadoValidacion = 'token_expirado';
      } else {
        token.estado = 'utilizado';
        await repoToken.save(token);
        tokenId = token.id;
      }
    }

    const registro = repoReg.create({
      trabajadorId,
      instalacionId,
      tokenId,
      fecha: hoy,
      horaEntrada: horaStr(),
      estadoValidacion,
    });
    await repoReg.save(registro);
    return res.status(201).json(registro);
  } catch (err: any) {
    console.error('Error al registrar entrada:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function registrarSalida(req: Request, res: Response) {
  const id = parseInt(req.params.id);

  try {
    const repo = AppDataSource.getRepository(RegistroAsistencia);
    const registro = await repo.findOne({ where: { id } });

    if (!registro) return res.status(404).json({ mensaje: 'Registro no encontrado' });
    if (registro.horaSalida) return res.status(400).json({ mensaje: 'La salida ya fue registrada' });

    registro.horaSalida = horaStr();
    await repo.save(registro);
    return res.json(registro);
  } catch (err: any) {
    console.error('Error al registrar salida:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}

export async function reporteAsistencia(req: Request, res: Response) {
  const { instalacionId, desde, hasta } = req.query;

  try {
    const repo = AppDataSource.getRepository(RegistroAsistencia);
    const qb = repo.createQueryBuilder('r')
      .leftJoinAndSelect('r.trabajador', 'trabajador')
      .leftJoinAndSelect('r.instalacion', 'instalacion')
      .orderBy('r.fecha', 'DESC');

    if (instalacionId) qb.andWhere('r.instalacionId = :instalacionId', { instalacionId: parseInt(instalacionId as string) });
    if (desde) qb.andWhere('r.fecha >= :desde', { desde });
    if (hasta) qb.andWhere('r.fecha <= :hasta', { hasta });

    const registros = await qb.getMany();

    const aprobados = registros.filter(r => r.estadoValidacion === 'aprobado').length;
    const rechazados = registros.filter(r => r.estadoValidacion !== 'aprobado').length;

    return res.json({ total: registros.length, aprobados, rechazados, registros });
  } catch (err: any) {
    console.error('Error al generar reporte:', err);
    return res.status(500).json({ mensaje: 'Error interno' });
  }
}
