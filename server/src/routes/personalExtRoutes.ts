import { Router } from 'express';
import { verificarToken } from '../middlewares/verificarToken';
import { autorizar } from '../middlewares/autorizar';
import {
  listarLicencias,
  licenciasPorTrabajador,
  crearLicencia,
  actualizarEstadoLicencia,
  eliminarLicencia,
} from '../controllers/licenciaController';
import {
  listarEventos,
  eventosPorTrabajador,
  crearEvento,
  eliminarEvento,
} from '../controllers/eventoHojaVidaController';

const router = Router();

// Licencias
router.get('/licencias', verificarToken, listarLicencias);
router.get('/licencias/trabajador/:id', verificarToken, licenciasPorTrabajador);
router.post('/licencias', verificarToken, autorizar('admin'), crearLicencia);
router.patch('/licencias/:id/estado', verificarToken, autorizar('admin'), actualizarEstadoLicencia);
router.delete('/licencias/:id', verificarToken, autorizar('admin'), eliminarLicencia);

// Eventos hoja de vida
router.get('/hoja-vida', verificarToken, listarEventos);
router.get('/hoja-vida/trabajador/:id', verificarToken, eventosPorTrabajador);
router.post('/hoja-vida', verificarToken, autorizar('admin', 'supervisor'), crearEvento);
router.delete('/hoja-vida/:id', verificarToken, autorizar('admin'), eliminarEvento);

export default router;
