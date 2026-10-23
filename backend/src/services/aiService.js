import { GoogleGenAI } from '@google/genai';

/**
 * Initializes and returns a Google Gen AI client instance if API key is present.
 */
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({ apiKey: apiKey.trim() });
}

/**
 * Safely parses JSON from an LLM response string that might contain Markdown fences.
 */
function normalizeStringList(value, fallback = []) {
  if (!Array.isArray(value)) return fallback;
  return value.map((item) => {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object') {
      return item.name || item.label || item.description || JSON.stringify(item);
    }
    return String(item);
  }).filter(Boolean);
}

function sanitizeMermaid(raw, projectName) {
  const fallback = `graph TD\n    Client["Client"] --> Server["${projectName || 'Project'}"]`;
  if (!raw || typeof raw !== 'string') return fallback;
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:mermaid)?\s*/i, '').replace(/```\s*$/, '').trim();
  }
  if (!/^graph\s+/i.test(cleaned) && !/^flowchart\s+/i.test(cleaned)) {
    return fallback;
  }
  return cleaned;
}

function safeParseJson(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return null;
  }

  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Attempt regex extraction of first outer JSON object
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (innerErr) {
        // failed parse
      }
    }
    return null;
  }
}

/**
 * Generates AI Project Mentor analysis for an uploaded codebase using Google Gemini.
 */
export async function analyzeProjectWithAI(projectContext) {
  const client = getGeminiClient();
  if (!client) {
    return {
      isAvailable: false,
      message: 'GEMINI_API_KEY is not configured. Please add your Google Gemini API key to backend/.env to unlock AI mentor analysis and architecture diagram generation.',
      overview: 'Project analyzed successfully using local heuristics. Configure GEMINI_API_KEY in backend/.env for AI deep insights.',
      architecture: 'Architecture explanation requires an active Google Gemini API key.',
      technologies: projectContext.technologies || [],
      existingModules: projectContext.detectedModules || [],
      potentialMissingModules: projectContext.potentialMissingModules || [],
      recommendations: [
        'Add GEMINI_API_KEY to backend/.env to generate automated code quality recommendations.',
        'Review detected modules and confirm API routes follow RESTful conventions.'
      ],
      nextFeatures: [
        'Connect AI Mentor via Google Gemini API key',
        'Add comprehensive unit tests',
        'Improve error handling on API routes'
      ],
      mermaid: `graph TD\n    Client["Client / User"] --> App["${projectContext.projectName}"]\n    App --> Modules["Detected Modules"]`
    };
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const systemInstruction = `You are an AI Project Mentor.
Analyze the provided software project context.
Your job is to help a college student understand their codebase.
Do not invent files, technologies, modules, or functionality that are not supported by the supplied project context.

Clearly distinguish:
- detected facts
- reasonable inferences
- potential missing functionality
- recommendations

You MUST respond strictly with a valid JSON object matching this exact schema:
{
  "overview": "Comprehensive explanation of what the project does based on files and dependencies",
  "architecture": "Clear explanation of data flow and component interactions",
  "technologies": ["Array of detected technologies with concise explanation of their roles"],
  "existingModules": [
    { "name": "Module name", "description": "What this module handles in the project" }
  ],
  "potentialMissingModules": [
    { "name": "Module name", "reason": "Why this module is typically expected for this type of project" }
  ],
  "recommendations": ["Array of practical, actionable improvements for a college-level project"],
  "nextFeatures": ["3 to 5 realistic next features the student can build"],
  "mermaid": "A clean, valid Mermaid architecture diagram starting with 'graph TD' showing major layers (Client, Server/API, Controllers/Routes, Database/Services)"
}

Mermaid rules:
- Start with graph TD
- Use simple alphanumeric node IDs
- Put labels in double quotes
- Do not use parentheses, brackets, or special characters inside node IDs
- Keep the diagram small (8-14 nodes)

Do NOT wrap the JSON in conversational text. Respond with pure JSON.`;

  const promptContent = `Project Context:
Project Name: ${projectContext.projectName}
Total Files: ${projectContext.fileCount}
Total Folders: ${projectContext.folderCount}

File Tree:
${projectContext.textTree.slice(0, 3000)}

Detected Technologies:
${(projectContext.technologies || []).join(', ')}

Key Dependencies:
${(projectContext.dependencies || []).slice(0, 30).join(', ')}

Detected Modules (Rule-Based):
${JSON.stringify(projectContext.detectedModules || [], null, 2)}

Code & Config Samples:
${(projectContext.importantSnippets || []).map(s => `--- ${s.filePath} ---\n${s.content}`).join('\n\n')}
`;

  try {
    const response = await client.models.generateContent({
      model,
      contents: promptContent,
      config: {
        systemInstruction,
        responseMimeType: 'application/json'
      }
    });

    const rawOutput = response.text;
    const parsed = safeParseJson(rawOutput);

    if (parsed) {
      return {
        isAvailable: true,
        overview: parsed.overview || 'Overview generated by AI Mentor.',
        architecture: parsed.architecture || 'Architecture generated by AI Mentor.',
        technologies: normalizeStringList(parsed.technologies, projectContext.technologies),
        existingModules: Array.isArray(parsed.existingModules) ? parsed.existingModules : projectContext.detectedModules,
        potentialMissingModules: Array.isArray(parsed.potentialMissingModules) ? parsed.potentialMissingModules : projectContext.potentialMissingModules,
        recommendations: normalizeStringList(parsed.recommendations, []),
        nextFeatures: normalizeStringList(parsed.nextFeatures, []),
        mermaid: sanitizeMermaid(parsed.mermaid, projectContext.projectName)
      };
    }

    // Fallback if parsing failed
    return {
      isAvailable: true,
      overview: rawOutput || 'Overview generated by AI Mentor.',
      architecture: 'See overview above for detailed component explanation.',
      technologies: projectContext.technologies,
      existingModules: projectContext.detectedModules,
      potentialMissingModules: projectContext.potentialMissingModules,
      recommendations: ['Review project modularity and error handling.'],
      nextFeatures: ['Add automated integration tests', 'Implement centralized logging'],
      mermaid: sanitizeMermaid('', projectContext.projectName)
    };
  } catch (err) {
    console.error('Error during Google Gemini analysis:', err.message);
    throw err;
  }
}

/**
 * Handles conversational queries between the student and the AI Project Mentor using Google Gemini.
 */
export async function chatWithMentor(question, projectContext, previousMessages = []) {
  const client = getGeminiClient();
  if (!client) {
    return {
      success: false,
      error: 'GEMINI_API_KEY is not configured in backend/.env. Please configure your Google Gemini API key to enable the AI Chat Mentor.'
    };
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const systemInstruction = `You are an AI Project Mentor helping a college student understand their uploaded project: "${projectContext?.projectName || 'Project'}".
Guidelines:
1. Base your answers strictly on the provided project context, file structure, technologies, and code snippets.
2. If the user asks about a specific file or feature not visible in the context, explicitly state that it was not found in the uploaded archive.
3. Keep explanations clear, educational, and tailored to a college computer science student.
4. When relevant, suggest best practices and clean coding patterns.`;

  let conversationHistory = '';
  if (Array.isArray(previousMessages) && previousMessages.length > 0) {
    conversationHistory = '\nPrevious Conversation:\n' +
      previousMessages.slice(-6).map(m => `${m.role === 'user' ? 'Student' : 'Mentor'}: ${m.content}`).join('\n');
  }

  const contents = `Project Context:
Name: ${projectContext?.projectName || 'Unknown'}
Files: ${projectContext?.fileCount || 0}, Folders: ${projectContext?.folderCount || 0}
Technologies: ${(projectContext?.technologies || []).join(', ')}
Modules: ${(projectContext?.detectedModules || []).map(m => m.name || m).join(', ')}

Key Snippets:
${(projectContext?.importantSnippets || []).map(s => `--- ${s.filePath} ---\n${s.content}`).join('\n\n').slice(0, 4000)}
${conversationHistory}

Student's Question:
${question}
`;

  try {
    const response = await client.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction
      }
    });

    const answer = (response && response.text) ? String(response.text).trim() : '';
    if (!answer) {
      return {
        success: false,
        error: 'The AI mentor did not return an answer. Please try again.'
      };
    }

    return {
      success: true,
      answer
    };
  } catch (err) {
    console.error('Error in Gemini chatWithMentor:', err.message);
    return {
      success: false,
      error: 'AI chat is temporarily unavailable. Please try again.'
    };
  }
}
