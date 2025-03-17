import { Router } from 'express';
import {
  getAll,
  getById,
  create,
  update,
} from '../controllers/clienteController';

const router: Router = Router();

router.get('/clientes/getAll', getAll);
router.get('/clientes/getById/:id', getById);
router.post('/clientes/create', create);
router.put('/clientes/update/:id', update);

export default router;
