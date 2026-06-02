import { Router } from 'express';
import { verificarToken } from '../middlewares/verificarToken';
import { autorizar } from '../middlewares/autorizar';
import { listarProductos, crearProducto, editarProducto, eliminarProducto } from '../controllers/productoController';

const router = Router();

router.get('/productos', verificarToken, listarProductos);
router.post('/productos', verificarToken, autorizar('admin'), crearProducto);
router.put('/productos/:id', verificarToken, autorizar('admin'), editarProducto);
router.delete('/productos/:id', verificarToken, autorizar('admin'), eliminarProducto);

export default router;
