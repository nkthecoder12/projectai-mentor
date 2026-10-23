'use client';

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import UploadZone from '../components/UploadZone';
import LoadingState from '../components/LoadingState';
import StatsOverview from '../components/StatsOverview';
import FileTree from '../components/FileTree';
import TechStack from '../components/TechStack';
import ModulesView from '../components/ModulesView';
import ArchitectureView from '../components/ArchitectureView';
import Recommendations from '../components/Recommendations';
import ChatMentor from '../components/ChatMentor';
import { checkBackendHealth, analyzeProjectZip } from '../lib/api';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function Home() {
  const [backendStatus, setBackendStatus] = useState({ online: false, message: 'Connecting...' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Initial health check
  useEffect(() => {
    async function verifyHealth() {
      const status = await checkBackendHealth();
      setBackendStatus(status);
    }
    verifyHealth();

    const interval = setInterval(verifyHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handle ZIP analysis
  const handleAnalyze = async (file) => {
    setIsAnalyzing(true);
    setErrorMsg('');
    setAnalysisResult(null);

    try {
      const result = await analyzeProjectZip(file);
      setAnalysisResult(result);
    } catch (err) {
      console.error('Analysis error:', err);
      setErrorMsg(err.message || 'Unable to analyze this ZIP file.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/80">
      <Header
        backendStatus={backendStatus}
        hasProject={!!analysisResult}
        onReset={handleReset}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-semibold">Analysis Error</p>
              <p className="mt-0.5 text-xs text-rose-600">{errorMsg}</p>
            </div>
            <button
              onClick={() => setErrorMsg('')}
              className="text-xs text-rose-500 hover:text-rose-700 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* View 1: Uploading & Initial state */}
        {!analysisResult && !isAnalyzing && (
          <div>
            <div className="text-center max-w-2xl mx-auto mt-6 mb-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                AI Project Mentor
              </h2>
              <p className="mt-3 text-base text-slate-600">
                Upload your code archive as a ZIP file. Get a complete architectural breakdown,
                detect technologies and modules, discover missing components, and interact with your AI Mentor.
              </p>
            </div>

            <UploadZone onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
          </div>
        )}

        {/* View 2: Loading State */}
        {isAnalyzing && <LoadingState />}

        {/* View 3: Dashboard Results */}
        {analysisResult && !isAnalyzing && (
          <div className="space-y-8 animate-fadeIn">
            {/* 1. Overview & Stats */}
            <StatsOverview
              project={analysisResult.project}
              aiAnalysis={analysisResult.aiAnalysis}
            />

            {/* 2. File Tree & Tech Stack */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <FileTree
                fileTree={analysisResult.project.fileTree}
                textTree={analysisResult.project.textTree}
                projectName={analysisResult.project.name}
              />
              <TechStack
                technologies={analysisResult.aiAnalysis?.technologies || analysisResult.project.technologies}
                dependencies={analysisResult.project.dependencies}
              />
            </div>

            {/* 3. Detected Modules & Potential Missing Modules */}
            <ModulesView
              detectedModules={analysisResult.aiAnalysis?.existingModules || analysisResult.project.modules}
              potentialMissingModules={analysisResult.aiAnalysis?.potentialMissingModules || analysisResult.project.potentialMissingModules}
            />

            {/* 4. Architecture Explanation & Diagram */}
            <ArchitectureView
              architectureText={analysisResult.aiAnalysis?.architecture}
              mermaidCode={analysisResult.aiAnalysis?.mermaid}
            />

            {/* 5. Recommended Improvements & Next Features */}
            <Recommendations
              recommendations={analysisResult.aiAnalysis?.recommendations}
              nextFeatures={analysisResult.aiAnalysis?.nextFeatures}
            />

            {/* 6. AI Chat Mentor */}
            <ChatMentor projectContext={analysisResult.project} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <p>
          AI Project Mentor • Built for College Project Review • Next.js, Express, and Gemini
        </p>
      </footer>
    </div>
  );
}
