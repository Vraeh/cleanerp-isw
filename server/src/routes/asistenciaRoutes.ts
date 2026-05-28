import { Router } from 'express';
import { verificarToken } from '../middlewares/verificarToken';
import { autorizar } from '../middlewares/autorizar';
import {
  generarToken,
  listarTokensPorInstalacion,
  expirarToken,
} from '../controllers/tokenAsistenciaController';
import {
  listarRegistros,
  registrosPorInstalacion,
  registrarEntrada,
  registrarSalida,
  reporteAsistencia,
} from '../controllers/registroAsistenciaController';

const router = Router();

// Tokens
router.post('/asistencia/tokens', verificarToken, autorizar('admin', 'supervisor'), generarToken);
router.get('/asistencia/tokens/:instalacionId', verificarToken, listarTokensPorInstalacion);
router.patch('/asistencia/tokens/:id/expirar', verificarToken, autorizar('admin', 'supervisor'), expirarToken);

// Registros
router.get('/asistencia/registros', verificarToken, listarRegistros);
router.get('/asistencia/registros/:instalacionId', verificarToken, registrosPorInstalacion);
router.post('/asistencia/registros/entrada', verificarToken, registrarEntrada);
router.patch('/asistencia/registros/:id/salida', verificarToken, registrarSalida);
router.get('/asistencia/reportes', verificarToken, reporteAsistencia);

export default router;
