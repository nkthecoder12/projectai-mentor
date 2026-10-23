import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempBaseDir = path.resolve(__dirname, '../../temp');

const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'coverage',
  '__pycache__',
  '.cache',
  '__macosx'
]);

const IGNORED_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico',
  '.mp4', '.mp3', '.wav', '.mov', '.avi',
  '.pdf', '.zip', '.tar', '.gz', '.rar', '.7z',
  '.exe', '.dll', '.so', '.dylib', '.bin',
  '.woff', '.woff2', '.ttf', '.eot',
  '.pyc', '.class'
]);

const IGNORED_FILENAMES = new Set([
  '.ds_store',
  'thumbs.db',
  'desktop.ini'
]);

function shouldSkipEntry(entryName) {
  const normalized = entryName.replace(/\\/g, '/');
  const parts = normalized.split('/').filter(Boolean);
  if (parts.some((part) => IGNORED_DIRS.has(part.toLowerCase()))) {
    return true;
  }
  const fileName = parts[parts.length - 1] || '';
  if (fileName.toLowerCase().startsWith('._') || IGNORED_FILENAMES.has(fileName.toLowerCase())) {
    return true;
  }
  const ext = path.extname(fileName).toLowerCase();
  return IGNORED_EXTENSIONS.has(ext);
}

function isInsideDestination(destinationDir, targetPath) {
  const relative = path.relative(destinationDir, targetPath);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

export async function extractZipSafely(zipFilePath, extractId) {
  if (!fsSync.existsSync(tempBaseDir)) {
    await fs.mkdir(tempBaseDir, { recursive: true });
  }

  const destinationDir = path.resolve(tempBaseDir, extractId);
  await fs.mkdir(destinationDir, { recursive: true });

  let zip;
  try {
    zip = new AdmZip(zipFilePath);
  } catch (err) {
    const error = new Error('Unable to analyze this ZIP file. The file is corrupt or not a valid archive.');
    error.statusCode = 400;
    throw error;
  }

  const zipEntries = zip.getEntries();
  if (!zipEntries || zipEntries.length === 0) {
    const error = new Error('The uploaded ZIP archive is empty.');
    error.statusCode = 400;
    throw error;
  }

  const resolvedDestDir = path.resolve(destinationDir);
  let extractedFileCount = 0;

  for (const entry of zipEntries) {
    const rawEntryPath = String(entry.entryName || '').replace(/\\/g, '/');
    if (!rawEntryPath || rawEntryPath.includes('\0')) {
      continue;
    }

    // Strip leading slashes, dots, and backslashes so Windows path.resolve doesn't jump to drive root
    const cleanEntryPath = rawEntryPath.replace(/^(\.\/|\/|\\)+/, '');
    if (!cleanEntryPath) {
      continue;
    }

    if (shouldSkipEntry(cleanEntryPath)) {
      continue;
    }

    const targetPath = path.resolve(resolvedDestDir, cleanEntryPath);
    if (!isInsideDestination(resolvedDestDir, targetPath)) {
      const error = new Error(`Security violation: zip-slip path traversal detected in entry "${cleanEntryPath}".`);
      error.statusCode = 400;
      throw error;
    }

    if (entry.isDirectory) {
      if (!fsSync.existsSync(targetPath)) {
        await fs.mkdir(targetPath, { recursive: true });
      }
    } else {
      const parentDir = path.dirname(targetPath);
      if (!fsSync.existsSync(parentDir)) {
        await fs.mkdir(parentDir, { recursive: true });
      }
      const fileData = entry.getData();
      await fs.writeFile(targetPath, fileData);
      extractedFileCount += 1;
    }
  }

  if (extractedFileCount === 0) {
    const error = new Error('The uploaded ZIP archive contains no readable source code files.');
    error.statusCode = 400;
    throw error;
  }

  return destinationDir;
}

async function removePath(targetPath) {
  if (!targetPath || !fsSync.existsSync(targetPath)) return;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await fs.rm(targetPath, { recursive: true, force: true });
      return;
    } catch (err) {
      if (attempt === 2) {
        console.error(`Failed to delete temp path: ${targetPath}`, err.message);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
    }
  }
}

export async function cleanupTempFiles(zipFilePath, extractedDir) {
  await removePath(zipFilePath);
  await removePath(extractedDir);
}
