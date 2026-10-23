'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, Layers } from 'lucide-react';

export default function ModulesView({ detectedModules = [], potentialMissingModules = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Layers className="w-5 h-5 text-indigo-600" />
        <h3 className="text-base font-bold text-slate-800">Project Modules Analysis</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Detected Modules */}
        <div className="bg-slate-50/70 rounded-xl p-5 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-emerald-800 flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Detected Modules</span>
            </h4>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {detectedModules.length} Active
            </span>
          </div>

          {detectedModules.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No standard modules detected from file patterns.</p>
          ) : (
            <div className="space-y-3">
              {detectedModules.map((mod, idx) => {
                const name = (typeof mod === 'string' ? mod : mod?.name) || 'Module';
                const desc = typeof mod === 'object' ? mod?.description : null;
                const evidence = typeof mod === 'object' && mod?.evidenceCount ? mod.evidenceCount : null;

                return (
                  <div
                    key={`${name}-${idx}`}
                    className="bg-white rounded-lg p-3 border border-emerald-100 shadow-xs flex items-start space-x-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-800">{name}</span>
                        {evidence && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                            {evidence} file{evidence > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      {desc && <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{desc}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Potential Missing Modules */}
        <div className="bg-amber-50/40 rounded-xl p-5 border border-amber-200/70">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-amber-900 flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Potentially Missing Modules</span>
            </h4>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
              {potentialMissingModules.length} Suggested
            </span>
          </div>

          <div className="mb-3 px-3 py-2 rounded-lg bg-amber-100/60 border border-amber-200/80 flex items-start space-x-2 text-[11px] text-amber-900">
            <Info className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Note for review:</strong> Potential modules are architectural suggestions based on typical application patterns, not defects in your code.
            </span>
          </div>

          {potentialMissingModules.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No missing modules suggested.</p>
          ) : (
            <div className="space-y-3">
              {potentialMissingModules.map((mod, idx) => {
                const name = (typeof mod === 'string' ? mod : mod?.name) || 'Suggested Module';
                const reason = typeof mod === 'object' ? mod?.reason || mod?.suggestionReason || mod?.description : null;

                return (
                  <div
                    key={`${name}-${idx}`}
                    className="bg-white rounded-lg p-3 border border-amber-200/80 shadow-xs flex items-start space-x-2.5"
                  >
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-slate-800">{name}</span>
                      {reason && <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{reason}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
