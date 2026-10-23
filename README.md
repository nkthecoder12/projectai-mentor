# AI Project Mentor (College Project MVP)

> **"Understand your codebase. Discover what to build next."**

AI Project Mentor is a full-stack developer assistant built specifically for college students and developers navigating unfamiliar or legacy codebases. By uploading a project archive as a `.zip` file, the system inspects directory structures, detects technologies and dependencies, maps architectural modules, identifies missing components, and leverages Google's Gemini API to synthesize architecture diagrams, actionable recommendations, and an interactive AI project chat mentor.

> **Project Classification**: College MVP (Minimum Viable Product). No databases, no authentication systems, and no cloud dependencies are required to run this project locally.

---

## Key Features

1. **Secure ZIP Ingestion**:
   - Ingests uploaded `.zip` archives up to 20 MB via `multer`.
   - Protection against Zip-Slip path traversal vulnerabilities.
   - Automatically skips `node_modules`, `.git`, build directories, and binary media files.
   - Guarantees immediate cleanup of temporary files and extracted folders after processing.

2. **Automated Codebase Inspection**:
   - Computes total source file and folder counts.
   - Generates an interactive expandable folder/file hierarchy with 📁 / 📄 indicators and an ASCII tree viewer.
   - Rule-based technology and framework detection (`Express.js`, `MongoDB/Mongoose`, `JWT`, `Bcrypt`, `Socket.IO`, `Python`, `Java`, `Go`, `Rust`, etc.).
   - Module detection across routes, controllers, and models (Authentication, Users, Products, Cart, Orders, Payments, Notifications, Admin).

3. **AI Project Mentorship (Google Gemini API)**:
   - Powered by Google's official `@google/genai` JavaScript SDK using `gemini-2.5-flash` (or `gemini-1.5-flash`).
   - High-level project summary explaining the core purpose of the project.
   - Architectural flow breakdown and Mermaid flowchart generation (`graph TD`).
   - "Potentially Missing Modules" suggestions highlighting common architectural gaps for college projects (e.g., missing payments, cart, or alerts).
   - Practical, college-tailored recommendations and 3-5 suggested next features.

4. **Interactive AI Project Chat**:
   - Ask project-specific questions: *"How does authentication work?"*, *"What technologies are used?"*, *"What should I implement next?"*.
   - Strictly grounded on the uploaded project context without hallucinating unprovided files.
   - Chat context is preserved directly in React state during the session.

5. **Local Heuristics Fallback**:
   - If `GEMINI_API_KEY` is not provided, the application continues to function smoothly using local heuristic analysis, displaying the full file tree, detected technologies, dependencies, and detected modules while displaying a friendly configuration reminder.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js (App Router), React 18, Tailwind CSS, Lucide React, Mermaid.js |
| **Backend** | Node.js, Express.js (ES Modules), Multer, Adm-Zip, Cors, Dotenv |
| **AI Integration** | Official Google Gen AI SDK (`@google/genai`), Google Gemini Flash (`gemini-2.5-flash`) |
| **Data Storage** | Zero Database (In-Memory React state during active session) |

---

## Architecture Overview

```
+-------------------------------------------------------------+
|                     Next.js Frontend                        |
|  - Drag & Drop Upload Zone                                  |
|  - Multi-Step Analysis Progress                             |
|  - Interactive File Hierarchy (📁 / 📄)                     |
|  - Technology & Dependency Badges                           |
|  - Detected vs Potential Missing Modules                    |
|  - Mermaid Diagram View with Code Fallback                  |
|  - Interactive Chat Mentor                                  |
+------------------------------+------------------------------+
                               |
                               | HTTP Multipart / JSON
                               v
+-------------------------------------------------------------+
|                     Express Backend                         |
|  POST /api/projects/analyze      POST /api/projects/chat    |
+------------------------------+------------------------------+
                               |
            +------------------+------------------+
            |                                     |
            v                                     v
+-----------------------+             +-----------------------+
|   ZIP Extraction      |             |  Project Analyzer     |
|   - Adm-Zip           |             |  - File/Folder Counts |
|   - Zip-Slip Guard    |             |  - Text/JSON Trees    |
|   - Auto-Cleanup      |             |  - Tech Detection     |
+-----------------------+             |  - Module Detection   |
                                      |  - Compact Snippets   |
                                      +-----------+-----------+
                                                  |
                                                  v
                                      +-----------------------+
                                      |    Gemini AI Service  |
                                      | - @google/genai       |
                                      | - Mermaid Synthesis   |
                                      | - Chat Mentor         |
                                      +-----------------------+
```

---

## Project Structure

```
ai-project-mentor/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── projectController.js      # Orchestrates analysis, chat, and cleanup
│   │   ├── middleware/
│   │   │   └── upload.js                 # Multer configuration (20MB limit, .zip filter)
│   │   ├── routes/
│   │   │   └── projectRoutes.js          # /health, /projects/analyze, /projects/chat
│   │   ├── services/
│   │   │   ├── zipService.js             # Safe extraction & temp file deletion
│   │   │   ├── projectAnalyzer.js        # Rule engine for trees, techs, modules, snippets
│   │   │   └── aiService.js              # Google Gemini AI Service & Chat Mentor
│   │   └── server.js                     # Express app setup and error handling
│   ├── uploads/                          # Temporary uploaded archives (auto-cleaned)
│   ├── temp/                             # Temporary extraction destination (auto-cleaned)
│   ├── .env.example
│   ├── .env
│   ├── .gitignore
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── globals.css                   # Tailwind styles and custom scrollbars
│   │   ├── layout.js                     # Root HTML wrapper and metadata
│   │   └── page.js                       # Main dashboard state coordinator
│   ├── components/
│   │   ├── Header.jsx                    # Navigation and live backend status indicator
│   │   ├── UploadZone.jsx                # Drag-and-drop ZIP upload with validation
│   │   ├── LoadingState.jsx              # Animated multi-stage analysis progress
│   │   ├── StatsOverview.jsx             # Key metrics cards (Files, Folders, Tech, Modules)
│   │   ├── FileTree.jsx                  # Expandable folder tree & ASCII viewer
│   │   ├── TechStack.jsx                 # Detected technologies and dependencies badges
│   │   ├── ModulesView.jsx               # Detected modules vs potential missing modules
│   │   ├── ArchitectureView.jsx          # Mermaid architecture diagram with code fallback
│   │   ├── Recommendations.jsx           # AI suggestions and next features
│   │   └── ChatMentor.jsx                # Interactive AI chat drawer
│   ├── lib/
│   │   └── api.js                        # Fetch client using NEXT_PUBLIC_API_URL
│   ├── public/
│   ├── .env.local.example
│   ├── .env.local
│   ├── .gitignore
│   └── package.json
│
├── sample-project/                       # Small sample Node/Express/Mongo e-commerce API
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   ├── package.json
│   └── README.md
├── sample-project.zip                    # Ready-to-upload archive for instant testing
└── README.md                             # Project documentation
```

---

## Environment Variables

### Backend Configuration (`backend/.env`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port for the Express server |
| `GEMINI_API_KEY` | *(empty)* | Your Google Gemini API secret key |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Gemini model identifier |
| `CLIENT_URL` | `http://localhost:3000` | Origin URL permitted by CORS |

### Frontend Configuration (`frontend/.env.local`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000` | Backend API base URL |

---

## Installation & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher (Tested on Node v24)
- **npm**: v9.0.0 or higher

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Backend Environment

Copy `backend/.env.example` to `backend/.env` (already created by default) and optionally set your Gemini API key:

```ini
PORT=5000
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
CLIENT_URL=http://localhost:3000
```

> **Note**: If you do not have a Gemini API key yet, leave it blank! The application will run smoothly in local heuristics mode and allow you to inspect the file tree, detected technologies, and modules.

### Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## Running the Application

### 1. Start the Backend

In your backend terminal:

```bash
cd backend
npm run dev
```

The server will start on `http://localhost:5000`. You can verify health at `http://localhost:5000/api/health`.

### 2. Start the Frontend

In a separate frontend terminal:

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`. Open your browser and navigate to `http://localhost:3000`.

---

## Testing the Application

A pre-packaged sample project archive is included right in the project root: `sample-project.zip`.

1. Open `http://localhost:3000`.
2. Notice the **Backend Connected** indicator in the header.
3. Drag and drop `sample-project.zip` into the upload zone (or click "Choose ZIP" and select `sample-project.zip`).
4. Click **Analyze Project**.
5. Watch the step-by-step progress indicator:
   - Extracting project...
   - Analyzing structure...
   - Detecting technologies...
   - Generating AI insights...
6. Explore the generated dashboard:
   - **Overview & Stats**: 9 Files, 4 Folders, 9 Technologies, 3 Modules.
   - **File Tree**: Toggle folders (📁 `src`, `controllers`, `models`, `routes`) or switch to the **ASCII Tree** view.
   - **Detected Technologies**: Express.js, Mongoose, JWT, Bcryptjs, CORS, Dotenv.
   - **Modules**: Authentication, Users, Products detected. Missing: Shopping Cart, Orders, Payments.
   - **Architecture Diagram**: Mermaid diagram rendering client, API routes, controllers, and MongoDB layers.
   - **AI Chat**: Ask questions like *"How does authentication work?"* or *"What should I implement next?"*.

---

## API Endpoints

### 1. Health Check
- **`GET /api/health`**
- **Response**:
  ```json
  {
    "success": true,
    "message": "AI Project Mentor backend is running"
  }
  ```

### 2. Analyze Project
- **`POST /api/projects/analyze`**
- **Content-Type**: `multipart/form-data`
- **Field**: `project` (`.zip` file)
- **Response**:
  ```json
  {
    "success": true,
    "project": {
      "name": "sample-project",
      "fileCount": 9,
      "folderCount": 4,
      "fileTree": [...],
      "textTree": "...",
      "technologies": [...],
      "dependencies": [...],
      "modules": [...]
    },
    "aiAnalysis": {
      "overview": "...",
      "architecture": "...",
      "technologies": [...],
      "existingModules": [...],
      "potentialMissingModules": [...],
      "recommendations": [...],
      "nextFeatures": [...],
      "mermaid": "graph TD..."
    }
  }
  ```

### 3. AI Project Chat
- **`POST /api/projects/chat`**
- **Content-Type**: `application/json`
- **Body**:
  ```json
  {
    "question": "How does authentication work?",
    "projectContext": { ... },
    "previousMessages": [ ... ]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "answer": "The project uses JWT and bcryptjs for authentication in authController.js..."
  }
  ```

---

## Security & Safety Controls

1. **Anti Zip-Slip Protection**: Resolves destination canonical paths before extracting every entry and rejects any entry attempting path traversal.
2. **File Filter**: Rejects non-ZIP files and archives larger than 20 MB.
3. **No Execution Guarantee**: Uploaded files are strictly inspected as text strings; no external scripts or commands are ever executed.
4. **Token Cost Optimization**: Binary files, media files, and `node_modules` are excluded. Source file previews sent to Gemini are truncated to ~1,200 characters per file, prioritizing manifest files, routes, and controllers.
5. **Secret Protection**: `GEMINI_API_KEY` is kept exclusively on the Express backend and is never sent to the browser.

---

## Known Limitations

- **ZIP Only**: Git repository links and tarballs (`.tar.gz`) are not supported in this MVP.
- **Session-Based State**: Analysis data is held in React state. Refreshing the browser page resets the dashboard.
- **File Size**: Large enterprise monoliths (> 20 MB) are rejected to keep performance optimal on local development machines.

---

## Future Enhancements

- Direct GitHub repository link ingestion via GitHub REST API.
- Support for static analysis of Python (`requirements.txt`), Java (`pom.xml`), Go, and Rust projects.
- Export analysis report as PDF or Markdown summary.
- Interactive code snippet viewer directly in the File Tree.
