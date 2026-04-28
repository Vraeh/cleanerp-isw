import { Router } from 'express';
import { verificarToken } from '../middlewares/verificarToken';
import { autorizar } from '../middlewares/autorizar';
import { listarProyectos, crearProyecto, editarProyecto, eliminarProyecto, listarContratos, crearContrato } from '../controllers/proyectoController';

const router = Router();

router.get('/proyectos', verificarToken, listarProyectos);
router.post('/proyectos', verificarToken, autorizar('admin'), crearProyecto);
router.put('/proyectos/:id', verificarToken, autorizar('admin'), editarProyecto);
router.delete('/proyectos/:id', verificarToken, autorizar('admin'), eliminarProyecto);

router.get('/contratos', verificarToken, listarContratos);
router.post('/contratos', verificarToken, autorizar('admin'), crearContrato);

export default router;
