import { Router } from 'express';
import { verificarToken } from '../middlewares/verificarToken';
import { autorizar } from '../middlewares/autorizar';
import {
  listarAsignaciones,
  asignacionesPorInstalacion,
  asignacionesPorTrabajador,
  crearAsignacion,
  desactivarAsignacion,
  eliminarAsignacion,
} from '../controllers/asignacionController';

const router = Router();

router.get('/asignaciones', verificarToken, listarAsignaciones);
router.get('/asignaciones/instalacion/:id', verificarToken, asignacionesPorInstalacion);
router.get('/asignaciones/trabajador/:id', verificarToken, asignacionesPorTrabajador);
router.post('/asignaciones', verificarToken, autorizar('admin'), crearAsignacion);
router.patch('/asignaciones/:id/desactivar', verificarToken, autorizar('admin'), desactivarAsignacion);
router.delete('/asignaciones/:id', verificarToken, autorizar('admin'), eliminarAsignacion);

export default router;
