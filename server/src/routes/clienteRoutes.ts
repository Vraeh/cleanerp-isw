import { Router } from 'express';
import { verificarToken } from '../middlewares/verificarToken';
import { autorizar } from '../middlewares/autorizar';
import {
  listarTipos,
  listarClientes,
  crearCliente,
  editarCliente,
  eliminarCliente,
  listarInstalaciones,
  listarTodasInstalaciones,
  crearInstalacion,
  editarInstalacion,
  eliminarInstalacion,
} from '../controllers/clienteController';

const router = Router();

router.get('/tipos-establecimiento', verificarToken, listarTipos);

router.get('/clientes', verificarToken, listarClientes);
router.post('/clientes', verificarToken, autorizar('admin'), crearCliente);
router.put('/clientes/:id', verificarToken, autorizar('admin'), editarCliente);
router.delete('/clientes/:id', verificarToken, autorizar('admin'), eliminarCliente);

router.get('/clientes/:id/instalaciones', verificarToken, listarInstalaciones);
router.get('/instalaciones-todas', verificarToken, listarTodasInstalaciones);
router.post('/instalaciones', verificarToken, autorizar('admin'), crearInstalacion);
router.put('/instalaciones/:id', verificarToken, autorizar('admin'), editarInstalacion);
router.delete('/instalaciones/:id', verificarToken, autorizar('admin'), eliminarInstalacion);

export default router;
