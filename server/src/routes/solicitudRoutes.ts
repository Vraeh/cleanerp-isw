import { Router } from 'express';
import { verificarToken } from '../middlewares/verificarToken';
import { autorizar } from '../middlewares/autorizar';
import {
  listarSolicitudes,
  obtenerSolicitud,
  solicitudesPorInstalacion,
  crearSolicitud,
  cambiarEstadoSolicitud,
  eliminarSolicitud,
} from '../controllers/solicitudReabastecimientoController';

const router = Router();

router.get('/solicitudes', verificarToken, listarSolicitudes);
router.get('/solicitudes/:id', verificarToken, obtenerSolicitud);
router.get('/solicitudes/instalacion/:id', verificarToken, solicitudesPorInstalacion);
router.post('/solicitudes', verificarToken, crearSolicitud);
router.patch('/solicitudes/:id/estado', verificarToken, autorizar('admin', 'supervisor'), cambiarEstadoSolicitud);
router.delete('/solicitudes/:id', verificarToken, eliminarSolicitud);

export default router;
