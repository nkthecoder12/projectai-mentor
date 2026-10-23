'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileArchive, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function UploadZone({ onAnalyze, isAnalyzing }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const validateAndSetFile = (file) => {
    setErrorMsg('');
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.zip')) {
      setErrorMsg('Invalid file format. Please upload a ZIP archive (.zip).');
      setSelectedFile(null);
      return;
    }

    // 20 MB size limit
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMsg('File too large. Maximum supported archive size is 20 MB.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleTriggerAnalyze = () => {
    if (!selectedFile) {
      setErrorMsg('Please choose a ZIP project file before analyzing.');
      return;
    }
    onAnalyze(selectedFile);
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-8">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/30">
          <h2 className="text-xl font-bold text-slate-800">Upload Your Project</h2>
          <p className="text-sm text-slate-600 mt-1">
            Upload your software project as a ZIP archive to analyze architecture, detect technologies, and receive AI mentoring.
          </p>
        </div>

        {/* Dropzone */}
        <div className="p-8">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-indigo-500 bg-indigo-50/60 scale-[1.01]'
                : selectedFile
                ? 'border-emerald-400 bg-emerald-50/30'
                : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/70'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,application/zip,application/x-zip-compressed"
              className="hidden"
              onChange={handleFileInputChange}
            />

            <div className="flex flex-col items-center justify-center space-y-4">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  selectedFile
                    ? 'bg-emerald-100 text-emerald-600'
                    : isDragOver
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-indigo-50 text-indigo-600'
                }`}
              >
                {selectedFile ? (
                  <FileArchive className="w-8 h-8" />
                ) : (
                  <UploadCloud className="w-8 h-8" />
                )}
              </div>

              {selectedFile ? (
                <div>
                  <p className="text-base font-semibold text-slate-800 flex items-center justify-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 inline" />
                    <span>{selectedFile.name}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Click or drag to change file
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-base font-medium text-slate-700">
                    Drag and drop your ZIP file here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">or</p>
                  <button
                    type="button"
                    className="mt-2 inline-flex items-center px-4 py-1.5 text-xs font-semibold rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition"
                  >
                    Choose ZIP
                  </button>
                </div>
              )}

              <div className="pt-2 text-xs text-slate-600 flex items-center space-x-4">
                <span>Supported format: <strong>ZIP</strong></span>
                <span>•</span>
                <span>Maximum size: <strong>20 MB</strong></span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center space-x-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-600">
              <span>💡 Tip: You can test with <code>sample-project.zip</code> included in this workspace!</span>
            </div>

            <button
              onClick={handleTriggerAnalyze}
              disabled={!selectedFile || isAnalyzing}
              className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-medium text-sm transition-all shadow-md ${
                !selectedFile || isAnalyzing
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:shadow-indigo-300'
              }`}
            >
              <span>Analyze Project</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
