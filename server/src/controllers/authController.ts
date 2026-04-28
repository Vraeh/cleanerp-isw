import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/configDev';
import { Usuario } from '../entities/Usuario';
import { env } from '../config/configEnv';

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ mensaje: 'Email y contraseña son requeridos' });
  }

  try {
    const repo = AppDataSource.getRepository(Usuario);
    const usuario = await repo.findOne({ where: { email } });

    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    const contrasenaValida = await bcrypt.compare(password, usuario.passwordHash);

    if (!contrasenaValida) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
    });
  } catch (error: any) {
    console.error('Error en login:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

export async function obtenerPerfil(req: Request, res: Response) {
  try {
    const repo = AppDataSource.getRepository(Usuario);
    const usuario = await repo.findOne({ where: { id: req.usuario!.id } });

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    return res.json({
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol,
    });
  } catch (error: any) {
    console.error('Error al obtener perfil:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}
