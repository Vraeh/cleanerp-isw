import { Router } from 'express';
import { login, obtenerPerfil } from '../controllers/authController';
import { verificarToken } from '../middlewares/verificarToken';

const router = Router();

router.post('/login', login);
router.get('/perfil', verificarToken, obtenerPerfil);

export default router;
