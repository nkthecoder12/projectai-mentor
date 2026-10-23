'use client';

import React from 'react';
import { Sparkles, FolderPlus } from 'lucide-react';

export default function Header({ backendStatus, onReset, hasProject }) {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-md shadow-indigo-100 text-white font-bold">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                AI Project Mentor
              </h1>

            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Understand your codebase. Discover what to build next.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Health indicator */}
          <div
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
              backendStatus.online
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
            title={backendStatus.online ? 'Backend online' : backendStatus.message}
          >

          </div>

          {/* Reset / New Project button */}
          {hasProject && (
            <button
              onClick={onReset}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5 text-slate-600" />
              <span>New Analysis</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
