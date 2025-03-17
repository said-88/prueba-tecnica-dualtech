import express from 'express';
import * as ordenController from '../controllers/ordenController';

const router = express.Router();

router.post('/ordenes/create', ordenController.create);

export default router;
