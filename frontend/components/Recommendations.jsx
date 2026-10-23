'use client';

import React from 'react';
import { Lightbulb, Rocket, CheckCircle } from 'lucide-react';

export default function Recommendations({ recommendations = [], nextFeatures = [] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Recommended Improvements */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-bold text-slate-800">Recommended Improvements</h3>
        </div>

        {recommendations.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No recommendations provided.</p>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 flex items-start space-x-2.5 text-xs text-slate-700"
              >
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{typeof rec === 'string' ? rec : (rec?.text || rec?.name || JSON.stringify(rec))}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suggested Next Features */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Rocket className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-800">Suggested Next Features</h3>
        </div>

        {nextFeatures.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No next features suggested.</p>
        ) : (
          <div className="space-y-3">
            {nextFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-start space-x-2.5 text-xs text-slate-700"
              >
                <CheckCircle className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium text-slate-800">{typeof feat === 'string' ? feat : (feat?.text || feat?.name || JSON.stringify(feat))}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
