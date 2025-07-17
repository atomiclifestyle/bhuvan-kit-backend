import express from 'express';
import {
  getRouting,
  getThematicData,
  villageGeocoding,
  getEllipsoid,
} from '../controllers/controller.js';
import { createUserDB, executeUserQuery } from '../controllers/db.controller.js';
import checkUserId from '../middlewares/check.user_id.js';

const router = express.Router();

router.get('/routing', checkUserId, getRouting);
router.get('/thematic', checkUserId, getThematicData);
router.get('/vg', checkUserId, villageGeocoding);
router.get('/ellipsoid', checkUserId, getEllipsoid);

router.post('/create-user-db', checkUserId, createUserDB); 
router.post('/execute-query', checkUserId, executeUserQuery); 

export default router;