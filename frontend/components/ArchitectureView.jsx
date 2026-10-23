'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GitFork, AlertTriangle, Code, RefreshCw } from 'lucide-react';

let mermaidInitialized = false;

export default function ArchitectureView({ architectureText, mermaidCode }) {
  const containerRef = useRef(null);
  const [svgContent, setSvgContent] = useState('');
  const [renderError, setRenderError] = useState(false);
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setRenderError(false);
    setSvgContent('');

    if (!mermaidCode || typeof mermaidCode !== 'string' || !mermaidCode.trim()) {
      return;
    }

    // Clean any markdown fences if present in mermaidCode
    let cleanedCode = mermaidCode.trim();
    if (cleanedCode.startsWith('```')) {
      cleanedCode = cleanedCode.replace(/^```(?:mermaid)?\s*/i, '').replace(/```\s*$/, '').trim();
    }

    async function renderMermaid() {
      try {
        const mermaid = (await import('mermaid')).default;
        if (!mermaidInitialized) {
          mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
            flowchart: {
              curve: 'basis',
              htmlLabels: true
            }
          });
          mermaidInitialized = true;
        }

        const uniqueId = `mermaid-diagram-${Date.now()}`;
        const { svg } = await mermaid.render(uniqueId, cleanedCode);

        if (isMounted) {
          setSvgContent(svg);
          setRenderError(false);
        }
      } catch (err) {
        console.warn('Mermaid render error:', err);
        if (isMounted) {
          setRenderError(true);
        }
      }
    }

    renderMermaid();

    return () => {
      isMounted = false;
    };
  }, [mermaidCode]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <GitFork className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-800">System Architecture</h3>
        </div>

        {mermaidCode && (
          <button
            onClick={() => setShowCode(!showCode)}
            className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showCode ? 'View Diagram' : 'View Mermaid Code'}</span>
          </button>
        )}
      </div>

      {/* Textual Architecture Explanation */}
      {architectureText && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {architectureText}
        </div>
      )}

      {/* Diagram Area */}
      <div className="rounded-xl border border-slate-200 p-6 bg-slate-50/50 flex flex-col items-center justify-center min-h-[220px]">
        {showCode || renderError ? (
          <div className="w-full">
            {renderError && (
              <div className="mb-3 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center space-x-2 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                <span>Could not render graphical diagram; displaying Mermaid source code below:</span>
              </div>
            )}
            <pre className="p-4 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
              <code>{mermaidCode || 'No Mermaid code generated.'}</code>
            </pre>
          </div>
        ) : svgContent ? (
          <div
            ref={containerRef}
            className="w-full flex justify-center overflow-x-auto [&_svg]:max-w-full [&_svg]:h-auto py-2"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
            <span>Generating architecture diagram...</span>
          </div>
        )}
      </div>
    </div>
  );
}
