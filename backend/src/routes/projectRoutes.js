import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import {
  healthCheck,
  handleAnalyzeProject,
  handleProjectChat
} from '../controllers/projectController.js';

const router = Router();

// Health check endpoint
router.get('/health', healthCheck);

// Analyze project ZIP archive
router.post('/projects/analyze', upload.single('project'), handleAnalyzeProject);

// Chat with AI Mentor about analyzed project
router.post('/projects/chat', handleProjectChat);

export default router;
