import { Request, Response, NextFunction } from 'express';

// devuelve un middleware que verifica si el rol del usuario está permitido
export function autorizar(...rolesPermitidos: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const usuario = req.usuario;

    if (!usuario) {
      return res.status(401).json({ mensaje: 'No autenticado' });
    }

    if (!rolesPermitidos.includes(usuario.rol)) {
      return res.status(403).json({ mensaje: 'No tienes permiso para realizar esta acción' });
    }

    next();
  };
}
