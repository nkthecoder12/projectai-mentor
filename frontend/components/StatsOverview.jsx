'use client';

import React from 'react';
import { Files, FolderGit2, Cpu, Box, Sparkles, AlertTriangle } from 'lucide-react';

export default function StatsOverview({ project, aiAnalysis }) {
  const stats = [
    {
      label: 'Source Files',
      value: project.fileCount || 0,
      icon: Files,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100'
    },
    {
      label: 'Folders',
      value: project.folderCount || 0,
      icon: FolderGit2,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100'
    },
    {
      label: 'Technologies',
      value: (project.technologies || []).length,
      icon: Cpu,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100'
    },
    {
      label: 'Detected Modules',
      value: (project.modules || []).length,
      icon: Box,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100'
    }
  ];

  return (
    <div className="space-y-6">
      {aiAnalysis && aiAnalysis.isAvailable === false && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 text-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <p className="font-semibold">
              {/GEMINI_API_KEY/i.test(aiAnalysis.message || '')
                ? 'Please configure GEMINI_API_KEY.'
                : 'AI analysis failed, but local project analysis is still available.'}
            </p>
            <p className="mt-0.5 text-amber-700">
              {aiAnalysis.message ||
                'The project structure, file tree, dependencies, and modules were analyzed with local rule-based heuristics.'}
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`bg-white rounded-xl p-5 border ${stat.borderColor} shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">{stat.label}</span>
                <div className={`w-8 h-8 rounded-lg ${stat.bgColor} ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800 mt-2">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Project Overview Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2 mb-3">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-800">Project Overview</h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {project.name}
          </span>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {aiAnalysis?.overview || 'No overview available for this project.'}
        </p>
      </div>
    </div>
  );
}
