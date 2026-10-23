'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Clock } from 'lucide-react';

const STEPS = [
  'Extracting project...',
  'Analyzing structure...',
  'Detecting technologies...',
  'Generating AI insights...'
];

export default function LoadingState() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1200);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto my-12 bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-5 shadow-inner">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>

      <h3 className="text-xl font-bold text-slate-800">
        Analyzing your project...
      </h3>
      <p className="text-sm text-slate-500 mt-1 mb-8">
        Please wait while our engine inspects your codebase and synthesizes architectural guidance.
      </p>

      {/* Progress steps */}
      <div className="space-y-3 max-w-sm mx-auto text-left">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div
              key={step}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl border text-sm transition-all duration-300 ${
                isDone
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                  : isCurrent
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold scale-[1.02]'
                  : 'bg-slate-50/60 border-slate-200 text-slate-400'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin flex-shrink-0" />
              ) : (
                <Clock className="w-4 h-4 text-slate-300 flex-shrink-0" />
              )}
              <span>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
