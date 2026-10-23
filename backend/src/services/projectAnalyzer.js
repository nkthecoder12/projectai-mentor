import fs from 'fs/promises';
import path from 'path';

// Directories to skip completely
const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'coverage',
  'uploads',
  'temp',
  '.vscode',
  '.idea',
  '.cache',
  '__pycache__',
  '.pytest_cache',
  'target',
  'bin',
  'obj'
]);

// Binary or media extensions to ignore
const IGNORED_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico',
  '.mp4', '.mp3', '.wav', '.mov', '.avi',
  '.pdf', '.zip', '.tar', '.gz', '.rar', '.7z',
  '.exe', '.dll', '.so', '.dylib', '.bin',
  '.woff', '.woff2', '.ttf', '.eot',
  '.lock', '.pyc', '.class'
]);

// Extension to language mapping
const EXTENSION_LANGUAGE_MAP = {
  '.js': 'JavaScript',
  '.jsx': 'React (JSX)',
  '.mjs': 'JavaScript (ESM)',
  '.cjs': 'JavaScript (CommonJS)',
  '.ts': 'TypeScript',
  '.tsx': 'React (TSX)',
  '.py': 'Python',
  '.java': 'Java',
  '.go': 'Go',
  '.rs': 'Rust',
  '.php': 'PHP',
  '.rb': 'Ruby',
  '.cs': 'C#',
  '.cpp': 'C++',
  '.c': 'C',
  '.html': 'HTML',
  '.css': 'CSS',
  '.scss': 'SCSS',
  '.sql': 'SQL',
  '.sh': 'Shell',
  '.json': 'JSON',
  '.yaml': 'YAML',
  '.yml': 'YAML'
};

// Known npm dependency mappings
const NPM_TECH_MAP = {
  'express': 'Express.js (Web Framework)',
  'mongoose': 'Mongoose (MongoDB ODM)',
  'mongodb': 'MongoDB Driver',
  'jsonwebtoken': 'JWT (Authentication)',
  'bcrypt': 'Bcrypt (Password Hashing)',
  'bcryptjs': 'Bcryptjs (Password Hashing)',
  'socket.io': 'Socket.IO (WebSockets)',
  'cors': 'CORS (Cross-Origin Resource Sharing)',
  'multer': 'Multer (File Upload)',
  'razorpay': 'Razorpay (Payment Gateway)',
  'stripe': 'Stripe (Payment Gateway)',
  'nodemailer': 'Nodemailer (Email Service)',
  'resend': 'Resend (Email Service)',
  'react': 'React (UI Library)',
  'react-dom': 'React DOM',
  'next': 'Next.js (React Framework)',
  'vue': 'Vue.js (UI Framework)',
  '@reduxjs/toolkit': 'Redux Toolkit (State Management)',
  'redux': 'Redux (State Management)',
  'zustand': 'Zustand (State Management)',
  'axios': 'Axios (HTTP Client)',
  'tailwindcss': 'Tailwind CSS (CSS Framework)',
  'prisma': 'Prisma (ORM)',
  '@prisma/client': 'Prisma Client',
  'sequelize': 'Sequelize (SQL ORM)',
  'typeorm': 'TypeORM (SQL ORM)',
  'pg': 'PostgreSQL Driver',
  'mysql2': 'MySQL Driver',
  'dotenv': 'Dotenv (Configuration)',
  'zod': 'Zod (Schema Validation)',
  'joi': 'Joi (Schema Validation)',
  'jest': 'Jest (Testing)',
  'mocha': 'Mocha (Testing)'
};

// Module detection patterns
const MODULE_PATTERNS = [
  {
    name: 'Authentication',
    keywords: ['auth', 'authentication', 'login', 'signup', 'register', 'jwt', 'token', 'passport', 'session'],
    description: 'User registration, login, token management, or access control'
  },
  {
    name: 'Users & Profiles',
    keywords: ['user', 'users', 'profile', 'account', 'member'],
    description: 'User identity, account management, and profile operations'
  },
  {
    name: 'Products & Catalog',
    keywords: ['product', 'products', 'item', 'items', 'catalog', 'inventory', 'good'],
    description: 'Product listing, inventory management, or merchandise'
  },
  {
    name: 'Shopping Cart',
    keywords: ['cart', 'carts', 'basket'],
    description: 'Cart management, item checkout preparation'
  },
  {
    name: 'Orders & Checkout',
    keywords: ['order', 'orders', 'checkout', 'purchase'],
    description: 'Order processing, status tracking, and order fulfillment'
  },
  {
    name: 'Payments & Billing',
    keywords: ['payment', 'payments', 'razorpay', 'stripe', 'billing', 'invoice', 'payout'],
    description: 'Payment gateway integration and financial transaction processing'
  },
  {
    name: 'Notifications & Messaging',
    keywords: ['notification', 'notifications', 'alert', 'email', 'sms', 'message', 'messaging'],
    description: 'Email, push, or in-app alerts and notifications'
  },
  {
    name: 'Administration & Moderation',
    keywords: ['admin', 'dashboard', 'moderation', 'analytics', 'manage'],
    description: 'Administrative controls and dashboard metrics'
  }
];

/**
 * Recursively scans the directory to gather files, folders, and build trees.
 */
async function scanDirectory(currentPath, relativePath = '') {
  const entries = await fs.readdir(currentPath, { withFileTypes: true });
  const children = [];
  let fileCount = 0;
  let folderCount = 0;
  const flatFiles = [];

  for (const entry of entries) {
    const entryRelPath = path.join(relativePath, entry.name).replace(/\\/g, '/');
    const entryFullPath = path.join(currentPath, entry.name);

    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name.toLowerCase())) {
        continue;
      }
      folderCount += 1;
      const subResult = await scanDirectory(entryFullPath, entryRelPath);
      fileCount += subResult.fileCount;
      folderCount += subResult.folderCount;
      flatFiles.push(...subResult.flatFiles);

      children.push({
        name: entry.name,
        type: 'folder',
        path: entryRelPath,
        children: subResult.children
      });
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (IGNORED_EXTENSIONS.has(ext)) {
        continue;
      }

      let size = 0;
      try {
        const stats = await fs.stat(entryFullPath);
        size = stats.size;
      } catch (e) {
        // ignore stat errors
      }

      fileCount += 1;
      const fileObj = {
        name: entry.name,
        type: 'file',
        path: entryRelPath,
        size,
        fullPath: entryFullPath
      };
      children.push(fileObj);
      flatFiles.push(fileObj);
    }
  }

  // Sort: folders first, then alphabetical
  children.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return { children, fileCount, folderCount, flatFiles };
}

/**
 * Builds a readable ASCII file tree string.
 */
function generateTextTree(nodeList, prefix = '') {
  let output = '';
  const total = nodeList.length;

  nodeList.forEach((node, index) => {
    const isLast = index === total - 1;
    const connector = isLast ? '└── ' : '├── ';
    const icon = node.type === 'folder' ? '📁 ' : '📄 ';
    output += `${prefix}${connector}${icon}${node.name}\n`;

    if (node.type === 'folder' && node.children && node.children.length > 0) {
      const childPrefix = prefix + (isLast ? '    ' : '│   ');
      output += generateTextTree(node.children, childPrefix);
    }
  });

  return output;
}

/**
 * Detects technologies, frameworks, and dependencies.
 */
async function detectTechnologies(flatFiles) {
  const technologies = new Set();
  const dependencies = [];
  const languages = new Set();

  for (const file of flatFiles) {
    const ext = path.extname(file.name).toLowerCase();
    if (EXTENSION_LANGUAGE_MAP[ext]) {
      languages.add(EXTENSION_LANGUAGE_MAP[ext]);
    }

    const lowerName = file.name.toLowerCase();

    // Check Node.js package.json
    if (lowerName === 'package.json') {
      technologies.add('Node.js / npm Ecosystem');
      try {
        const rawContent = await fs.readFile(file.fullPath, 'utf8');
        const pkg = JSON.parse(rawContent);

        const allDeps = {
          ...(pkg.dependencies || {}),
          ...(pkg.devDependencies || {})
        };

        for (const [dep, ver] of Object.entries(allDeps)) {
          const lowerDep = dep.toLowerCase();
          dependencies.push(`${dep}@${ver}`);

          if (NPM_TECH_MAP[lowerDep]) {
            technologies.add(NPM_TECH_MAP[lowerDep]);
          }
        }
      } catch (e) {
        // invalid package.json
      }
    }

    // Python indicators
    if (lowerName === 'requirements.txt' || lowerName === 'pipfile' || lowerName === 'pyproject.toml') {
      technologies.add('Python Ecosystem');
      try {
        const content = await fs.readFile(file.fullPath, 'utf8');
        if (/django/i.test(content)) technologies.add('Django (Python Web Framework)');
        if (/flask/i.test(content)) technologies.add('Flask (Python Web Framework)');
        if (/fastapi/i.test(content)) technologies.add('FastAPI (Python Web Framework)');
        if (/sqlalchemy/i.test(content)) technologies.add('SQLAlchemy (Python ORM)');
      } catch (e) {}
    }

    // Java indicators
    if (lowerName === 'pom.xml') technologies.add('Java (Maven)');
    if (lowerName === 'build.gradle' || lowerName === 'build.gradle.kts') technologies.add('Java / Kotlin (Gradle)');

    // Go indicator
    if (lowerName === 'go.mod') technologies.add('Go Modules');

    // Rust indicator
    if (lowerName === 'cargo.toml') technologies.add('Rust (Cargo)');

    // Docker indicator
    if (lowerName === 'dockerfile' || lowerName.startsWith('docker-compose')) {
      technologies.add('Docker / Containerization');
    }
  }

  languages.forEach((lang) => technologies.add(lang));

  return {
    technologies: Array.from(technologies),
    dependencies: dependencies.slice(0, 50) // limit top dependencies
  };
}

/**
 * Detects existing project modules based on directory paths, routes, controllers, and files.
 */
function detectModules(flatFiles) {
  const detectedModules = [];
  const detectedNames = new Set();

  for (const moduleDef of MODULE_PATTERNS) {
    const matchingFiles = [];

    for (const file of flatFiles) {
      const lowerPath = file.path.toLowerCase();
      for (const kw of moduleDef.keywords) {
        // match word boundary or path segment
        const regex = new RegExp(`(^|[/_.-])${kw}([/_.-]|$)`, 'i');
        if (regex.test(lowerPath)) {
          matchingFiles.push(file.path);
          break;
        }
      }
    }

    if (matchingFiles.length > 0) {
      detectedNames.add(moduleDef.name);
      detectedModules.push({
        name: moduleDef.name,
        description: moduleDef.description,
        evidenceCount: matchingFiles.length,
        sampleFiles: matchingFiles.slice(0, 3)
      });
    }
  }

  // Suggest potential missing modules from typical software architectures
  const potentialMissingModules = [];
  for (const moduleDef of MODULE_PATTERNS) {
    if (!detectedNames.has(moduleDef.name)) {
      potentialMissingModules.push({
        name: moduleDef.name,
        description: moduleDef.description,
        suggestionReason: `Commonly expected in complete applications; no direct "${moduleDef.keywords[0]}" controller, model, or route was detected.`
      });
    }
  }

  return { detectedModules, potentialMissingModules };
}

/**
 * Collects a compact snippet of the most important files without blowing up token usage.
 */
async function extractImportantSnippets(flatFiles) {
  // Priority ordering for inspection
  const priorityPatterns = [
    /package\.json$/i,
    /readme\.md$/i,
    /server\.(js|ts)$/i,
    /app\.(js|ts)$/i,
    /index\.(js|ts)$/i,
    /main\.(py|go|rs|java)$/i,
    /routes?\/.*?\.(js|ts)$/i,
    /controllers?\/.*?\.(js|ts)$/i,
    /models?\/.*?\.(js|ts)$/i,
    /services?\/.*?\.(js|ts)$/i
  ];

  const candidateFiles = [];
  for (const pattern of priorityPatterns) {
    for (const file of flatFiles) {
      if (pattern.test(file.path) && !candidateFiles.some(c => c.path === file.path)) {
        candidateFiles.push(file);
        if (candidateFiles.length >= 10) break;
      }
    }
    if (candidateFiles.length >= 10) break;
  }

  const snippets = [];
  for (const file of candidateFiles) {
    try {
      const content = await fs.readFile(file.fullPath, 'utf8');
      // Limit to 1200 characters per file
      const truncated = content.length > 1200 ? content.slice(0, 1200) + '\n... [truncated]' : content;
      snippets.push({
        filePath: file.path,
        content: truncated
      });
    } catch (e) {
      // ignore read error
    }
  }

  return snippets;
}

/**
 * Main project analyzer function
 */
export async function analyzeProject(extractedPath, originalZipName = 'uploaded-project') {
  // Check if extracted root contains a single top-level directory (common when unzipping a folder)
  let scanRoot = extractedPath;
  const topEntries = await fs.readdir(extractedPath, { withFileTypes: true });
  const nonIgnoredTopEntries = topEntries.filter(e => !IGNORED_DIRS.has(e.name.toLowerCase()));

  let inferredProjectName = path.basename(originalZipName, path.extname(originalZipName));

  if (nonIgnoredTopEntries.length === 1 && nonIgnoredTopEntries[0].isDirectory()) {
    scanRoot = path.join(extractedPath, nonIgnoredTopEntries[0].name);
    inferredProjectName = nonIgnoredTopEntries[0].name;
  }

  const { children, fileCount, folderCount, flatFiles } = await scanDirectory(scanRoot);

  if (fileCount === 0) {
    throw new Error('No readable source files were found in the uploaded project.');
  }

  // Format ASCII tree
  const textTree = `${inferredProjectName}/\n` + generateTextTree(children);

  // Tech detection
  const { technologies, dependencies } = await detectTechnologies(flatFiles);

  // Module detection
  const { detectedModules, potentialMissingModules } = detectModules(flatFiles);

  // Compact code snippets for AI
  const importantSnippets = await extractImportantSnippets(flatFiles);

  return {
    projectName: inferredProjectName,
    fileCount,
    folderCount,
    fileTree: children,
    textTree,
    technologies,
    dependencies,
    detectedModules,
    potentialMissingModules,
    importantSnippets
  };
}
