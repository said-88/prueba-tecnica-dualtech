import { Router } from 'express';
import {
  getAll,
  getById,
  create,
  update,
} from '../controllers/productoController';

const router: Router = Router();

router.get('/productos/getAll', getAll);
router.get('/productos/getById/:id', getById);
router.post('/productos/create', create);
router.put('/productos/update/:id', update);

export default router;
