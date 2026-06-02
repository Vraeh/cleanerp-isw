import { Router } from 'express';
import { verificarToken } from '../middlewares/verificarToken';
import { autorizar } from '../middlewares/autorizar';
import {
  listarEquipamiento,
  obtenerEquipo,
  equipamientoPorInstalacion,
  crearEquipo,
  actualizarEquipo,
  eliminarEquipo,
  listarTransferencias,
  crearTransferencia,
} from '../controllers/equipamientoController';

const router = Router();

router.get('/equipamiento', verificarToken, listarEquipamiento);
router.get('/equipamiento/instalacion/:id', verificarToken, equipamientoPorInstalacion);
router.get('/equipamiento/:id', verificarToken, obtenerEquipo);
router.post('/equipamiento', verificarToken, autorizar('admin', 'supervisor'), crearEquipo);
router.patch('/equipamiento/:id', verificarToken, autorizar('admin', 'supervisor'), actualizarEquipo);
router.delete('/equipamiento/:id', verificarToken, autorizar('admin'), eliminarEquipo);

router.get('/transferencias', verificarToken, listarTransferencias);
router.post('/transferencias', verificarToken, autorizar('admin', 'supervisor'), crearTransferencia);

export default router;
