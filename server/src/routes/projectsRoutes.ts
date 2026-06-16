import express from 'express';
import { generateCurriculum, validateModuleCode, generateModuleHint } from '../controllers/projectsController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/generate-curriculum', protect, generateCurriculum);
router.post('/validate-module', protect, validateModuleCode);
router.post('/hint', protect, generateModuleHint);

export default router;
