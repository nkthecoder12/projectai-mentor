'use client';

import React, { useState } from 'react';
import { Cpu, Package, ChevronDown, ChevronUp } from 'lucide-react';

export default function TechStack({ technologies = [], dependencies = [] }) {
  const [showAllDeps, setShowAllDeps] = useState(false);

  const displayedDeps = showAllDeps ? dependencies : dependencies.slice(0, 16);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Detected Technologies */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Cpu className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-800">Detected Technologies</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
            {technologies.length} Detected
          </span>
        </div>

        {technologies.length === 0 ? (
          <p className="text-xs text-slate-400">No specific technologies identified.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {technologies.map((tech, idx) => {
              const label = typeof tech === 'string' ? tech : (tech?.name || tech?.label || JSON.stringify(tech));
              return (
              <span
                key={`${label}-${idx}`}
                className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-800 border border-indigo-200 shadow-xs hover:border-indigo-300 transition-colors"
              >
                {label}
              </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Package Dependencies */}
      {dependencies.length > 0 && (
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-slate-500" />
              <h4 className="text-sm font-semibold text-slate-700">Dependencies & Libraries</h4>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {dependencies.length}
              </span>
            </div>

            {dependencies.length > 16 && (
              <button
                onClick={() => setShowAllDeps(!showAllDeps)}
                className="inline-flex items-center space-x-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
              >
                <span>{showAllDeps ? 'Show Less' : `Show All (${dependencies.length})`}</span>
                {showAllDeps ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {displayedDeps.map((dep, idx) => (
              <span
                key={`${dep}-${idx}`}
                className="px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-200"
              >
                {dep}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
