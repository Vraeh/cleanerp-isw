import { Router } from 'express';
import { verificarToken } from '../middlewares/verificarToken';
import { autorizar } from '../middlewares/autorizar';
import { listarTrabajadores, crearTrabajador, editarTrabajador, eliminarTrabajador } from '../controllers/trabajadorController';

const router = Router();

router.get('/trabajadores', verificarToken, listarTrabajadores);
router.post('/trabajadores', verificarToken, autorizar('admin'), crearTrabajador);
router.put('/trabajadores/:id', verificarToken, autorizar('admin'), editarTrabajador);
router.delete('/trabajadores/:id', verificarToken, autorizar('admin'), eliminarTrabajador);

export default router;
