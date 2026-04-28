import { Router } from 'express';
import { verificarToken } from '../middlewares/verificarToken';
import { autorizar } from '../middlewares/autorizar';
import { resumenStock, stockPorInstalacion, crearStock, editarStock, dashboardStats } from '../controllers/inventarioController';

const router = Router();

router.get('/dashboard', verificarToken, dashboardStats);
router.get('/stock', verificarToken, resumenStock);
router.get('/stock/instalacion/:id', verificarToken, stockPorInstalacion);
router.post('/stock', verificarToken, autorizar('admin', 'supervisor'), crearStock);
router.put('/stock/:id', verificarToken, autorizar('admin', 'supervisor'), editarStock);

export default router;
