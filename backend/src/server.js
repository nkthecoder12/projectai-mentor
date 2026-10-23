import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import projectRoutes from './routes/projectRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Configure CORS
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (origin === CLIENT_URL || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive for local college review development
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api', projectRoutes);

app.get('/', (req, res) => {
  res.json({
    name: 'AI Project Mentor Backend API',
    status: 'online',
    endpoints: {
      health: 'GET /api/health',
      analyze: 'POST /api/projects/analyze (multipart/form-data, field: project)',
      chat: 'POST /api/projects/chat (JSON: { question, projectContext, previousMessages })'
    }
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Central error-handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File is too large. The maximum supported ZIP size is 20 MB.'
      });
    }
    return res.status(400).json({
      success: false,
      error: `Upload error: ${err.message}`
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` AI Project Mentor Backend Server Running`);
  console.log(` Port:        http://localhost:${PORT}`);
  console.log(` Health:      http://localhost:${PORT}/api/health`);
  console.log(` Client URL:  ${CLIENT_URL}`);
  console.log(` Gemini Key:  ${process.env.GEMINI_API_KEY ? 'Configured' : 'Missing (local heuristics only)'}`);
  console.log(` Gemini Model:${process.env.GEMINI_MODEL || 'gemini-2.5-flash'}`);
  console.log(`===============================================`);
});
