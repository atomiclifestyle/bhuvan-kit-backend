import express from 'express';
import {
  getRouting,
  getThematicData,
  villageGeocoding,
  getEllipsoid,
} from '../controllers/controller.js';
import { createUserDB, executeUserQuery } from '../controllers/db.controller.js';
import checkUserId from '../middlewares/check.user_id.js';
import { executeQuery } from '../controllers/central.db.controller.js';

const router = express.Router();

// Bhuvan API
router.get('/routing', checkUserId, getRouting);
router.get('/thematic', checkUserId, getThematicData);
router.get('/vg', checkUserId, villageGeocoding);
router.get('/ellipsoid', checkUserId, getEllipsoid);

// Individual DB
router.post('/create-user-db', checkUserId, createUserDB); 
router.post('/execute-query', checkUserId, executeUserQuery); 

// Central DB
router.post('/execute-central-query', checkUserId, executeQuery);

export default router;