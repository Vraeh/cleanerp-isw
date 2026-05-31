import { Router } from 'express';
import { verificarToken } from '../middlewares/verificarToken';
import {
  listarMovimientos,
  movimientosPorInstalacion,
  movimientosPorProducto,
  registrarMovimiento,
} from '../controllers/movimientoInventarioController';

const router = Router();

router.get('/movimientos', verificarToken, listarMovimientos);
router.get('/movimientos/instalacion/:id', verificarToken, movimientosPorInstalacion);
router.get('/movimientos/producto/:id', verificarToken, movimientosPorProducto);
router.post('/movimientos', verificarToken, registrarMovimiento);

export default router;
