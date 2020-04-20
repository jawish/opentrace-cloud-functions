import { Router } from 'express';
import * as asyncHandler from "express-async-handler"

import { getUploadCode } from './getUploadCode';
import { authMiddleware } from '../authMiddleware';
import { getMinistryStats } from './getMinistryStats';

// Initialize the express router
const router = Router();

// Define routes
router.post('/uploadCode', authMiddleware, asyncHandler(getUploadCode));
router.get('/fetchStats', asyncHandler(getMinistryStats));

export default router;
