import express from 'express';
import {
  getRouting,
  getThematicData,
  villageGeocoding,
  getEllipsoid,
  getFloodRunoff,
} from '../controllers/controller.js';
import { createUserDB, executeUserQuery } from '../controllers/db.controller.js';

const router = express.Router();

router.get('/routing', getRouting);
router.get('/thematic', getThematicData);
router.get('/vg', villageGeocoding);
router.get('/ellipsoid', getEllipsoid);
router.get('/floodrunoff', getFloodRunoff);

router.post('/create-user-db', createUserDB); 
router.post('/execute-query/:user_id', executeUserQuery); 

export default router;