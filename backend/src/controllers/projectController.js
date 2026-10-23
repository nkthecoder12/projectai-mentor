import { extractZipSafely, cleanupTempFiles } from '../services/zipService.js';
import { analyzeProject } from '../services/projectAnalyzer.js';
import { analyzeProjectWithAI, chatWithMentor } from '../services/aiService.js';

function friendlyAnalysisError(err) {
  const raw = (err && err.message) ? String(err.message) : '';
  if (/empty/i.test(raw)) return 'The uploaded ZIP archive is empty or contains no recognized source files.';
  if (/zip-slip|traversal|security/i.test(raw)) return 'Invalid file paths detected in the archive. Path traversal is not permitted.';
  if (/no readable source/i.test(raw)) return 'No readable source files were found in the uploaded project.';
  if (/file is corrupt|not a valid archive/i.test(raw)) return 'Unable to analyze this ZIP file. The file is corrupt or not a valid ZIP archive.';
  if (/invalid file type|only zip/i.test(raw)) return 'Invalid file type. Please upload a valid ZIP archive (.zip).';
  return raw || 'Unable to analyze this ZIP file. Please verify the archive and try again.';
}

function normalizeProjectContext(projectContext) {
  if (!projectContext || typeof projectContext !== 'object') return null;
  return {
    projectName: projectContext.projectName || projectContext.name || 'uploaded-project',
    fileCount: projectContext.fileCount || 0,
    folderCount: projectContext.folderCount || 0,
    textTree: projectContext.textTree || '',
    technologies: projectContext.technologies || [],
    dependencies: projectContext.dependencies || [],
    detectedModules: projectContext.detectedModules || projectContext.modules || [],
    potentialMissingModules: projectContext.potentialMissingModules || [],
    importantSnippets: projectContext.importantSnippets || []
  };
}

/**
 * Health check endpoint
 * GET /api/health
 */
export function healthCheck(req, res) {
  res.json({
    success: true,
    message: 'AI Project Mentor backend is running'
  });
}

/**
 * Analyze an uploaded ZIP project
 * POST /api/projects/analyze
 */
export async function handleAnalyzeProject(req, res) {
  let zipPath = null;
  let extractedDir = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No project archive was uploaded. Please upload a valid .zip file.'
      });
    }

    zipPath = req.file.path;
    const extractId = `project-${Date.now()}-${Math.round(Math.random() * 1e6)}`;

    // 1. Safe extraction with zip-slip guard
    extractedDir = await extractZipSafely(zipPath, extractId);

    // 2. Local rule-based analyzer
    const localAnalysis = await analyzeProject(extractedDir, req.file.originalname);

    let aiResult;
    try {
      aiResult = await analyzeProjectWithAI(localAnalysis);
    } catch (aiErr) {
      console.warn('AI analysis failed, proceeding with heuristic fallback:', aiErr.message);
      const missingKey = /GEMINI_API_KEY|api key/i.test(aiErr.message || '');
      aiResult = {
        isAvailable: false,
        message: missingKey
          ? 'Please configure GEMINI_API_KEY.'
          : 'AI analysis failed, but local project analysis is still available.',
        overview: `Analyzed ${localAnalysis.projectName}. Core technologies include ${localAnalysis.technologies.slice(0, 5).join(', ') || 'unknown'}.`,
        architecture: 'Client requests are handled by application routes and controllers.',
        technologies: localAnalysis.technologies,
        existingModules: localAnalysis.detectedModules,
        potentialMissingModules: localAnalysis.potentialMissingModules,
        recommendations: ['Add automated integration tests.', 'Review modularity of controllers and routes.'],
        nextFeatures: ['Add API rate limiting', 'Implement automated unit testing'],
        mermaid: `graph TD\n    Client --> Server["${localAnalysis.projectName}"]`
      };
    }

    // 4. Return unified JSON matching Section 15
    return res.json({
      success: true,
      project: {
        name: localAnalysis.projectName,
        fileCount: localAnalysis.fileCount,
        folderCount: localAnalysis.folderCount,
        fileTree: localAnalysis.fileTree,
        textTree: localAnalysis.textTree,
        technologies: localAnalysis.technologies,
        dependencies: localAnalysis.dependencies,
        modules: localAnalysis.detectedModules,
        potentialMissingModules: localAnalysis.potentialMissingModules,
        importantSnippets: localAnalysis.importantSnippets
      },
      aiAnalysis: {
        isAvailable: aiResult.isAvailable !== false,
        message: aiResult.message || null,
        overview: aiResult.overview,
        architecture: aiResult.architecture,
        technologies: aiResult.technologies,
        existingModules: aiResult.existingModules,
        potentialMissingModules: aiResult.potentialMissingModules,
        recommendations: aiResult.recommendations,
        nextFeatures: aiResult.nextFeatures,
        mermaid: aiResult.mermaid
      }
    });
  } catch (err) {
    console.error('Project analysis error:', err.message);
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      error: friendlyAnalysisError(err)
    });
  } finally {
    // 5. Ensure cleanup of temp files
    if (zipPath || extractedDir) {
      await cleanupTempFiles(zipPath, extractedDir);
    }
  }
}

/**
 * Handle student questions about their project
 * POST /api/projects/chat
 */
export async function handleProjectChat(req, res) {
  try {
    const { question, projectContext, previousMessages } = req.body;

    if (!question || typeof question !== 'string' || question.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid question to ask the AI Project Mentor.'
      });
    }

    const normalizedContext = normalizeProjectContext(projectContext);
    if (!normalizedContext) {
      return res.status(400).json({
        success: false,
        error: 'Please analyze a project first so the mentor has project context.'
      });
    }

    const result = await chatWithMentor(question, normalizedContext, previousMessages);

    if (!result.success) {
      const chatError = /GEMINI_API_KEY|not configured/i.test(result.error || '')
        ? 'Please configure GEMINI_API_KEY.'
        : (result.error || 'AI chat is temporarily unavailable.');
      return res.status(400).json({
        success: false,
        error: chatError
      });
    }

    return res.json({
      success: true,
      answer: result.answer
    });
  } catch (err) {
    console.error('Chat error:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to process chat message.'
    });
  }
}
