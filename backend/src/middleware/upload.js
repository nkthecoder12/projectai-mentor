import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage configuration with unique timestamped filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${uniqueSuffix}-${sanitizedName}`);
  }
});

// File filter: accept only ZIP files
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const allowedExts = ['.zip'];
  const allowedMimeTypes = [
    'application/zip',
    'application/x-zip-compressed',
    'application/x-zip',
    'application/octet-stream',
    'multipart/x-zip',
    'application/zip-compressed',
    'application/x-compressed',
    'application/x-zip-compressed-archive',
    'application/x-compress',
    'multipart/zip'
  ];

  const hasZipExt = allowedExts.includes(ext);
  const hasZipMime = allowedMimeTypes.includes(file.mimetype) || !file.mimetype || file.mimetype === 'application/octet-stream';

  if (hasZipExt || (hasZipMime && file.originalname.toLowerCase().endsWith('.zip'))) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only ZIP archives (.zip) are supported.');
    error.statusCode = 400;
    cb(error, false);
  }
};

// 20 MB limit
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20 MB
  }
});
