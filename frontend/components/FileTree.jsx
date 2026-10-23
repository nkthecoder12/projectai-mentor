'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Copy, Check } from 'lucide-react';

function TreeNode({ node, level = 0 }) {
  const [isOpen, setIsOpen] = useState(true);

  if (node.type === 'folder') {
    return (
      <div className="select-none">
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{ paddingLeft: `${level * 16}px` }}
          className="flex items-center space-x-1.5 py-1 px-2 rounded hover:bg-slate-100 cursor-pointer text-xs text-slate-800 transition-colors"
        >
          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          )}
          <span className="text-base leading-none">📁</span>
          <span className="font-semibold text-slate-700">{node.name}</span>
          <span className="text-[10px] text-slate-400">({(node.children || []).length})</span>
        </div>

        {isOpen && node.children && node.children.length > 0 && (
          <div>
            {node.children.map((child, idx) => (
              <TreeNode key={`${child.path}-${idx}`} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{ paddingLeft: `${level * 16 + 20}px` }}
      className="flex items-center justify-between py-0.5 px-2 rounded hover:bg-slate-50 text-xs text-slate-700 transition-colors"
    >
      <div className="flex items-center space-x-1.5 truncate">
        <span className="text-base leading-none">📄</span>
        <span className="truncate">{node.name}</span>
      </div>
      {node.size ? (
        <span className="text-[10px] text-slate-400 ml-2 flex-shrink-0 font-mono">
          {(node.size / 1024).toFixed(1)} KB
        </span>
      ) : null}
    </div>
  );
}

export default function FileTree({ fileTree, textTree, projectName }) {
  const [activeTab, setActiveTab] = useState('tree'); // 'tree' | 'ascii'
  const [copied, setCopied] = useState(false);

  const handleCopyAscii = () => {
    if (textTree) {
      navigator.clipboard.writeText(textTree);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header with tab switch */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center space-x-2">
          <span className="text-base font-bold text-slate-800">Project Structure</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono">
            {projectName}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="inline-flex p-0.5 rounded-lg bg-slate-200/70 text-xs font-medium">
            <button
              onClick={() => setActiveTab('tree')}
              className={`px-3 py-1 rounded-md transition ${
                activeTab === 'tree'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Interactive Tree
            </button>
            <button
              onClick={() => setActiveTab('ascii')}
              className={`px-3 py-1 rounded-md transition ${
                activeTab === 'ascii'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ASCII Tree
            </button>
          </div>

          {activeTab === 'ascii' && (
            <button
              onClick={handleCopyAscii}
              className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition"
              title="Copy ASCII tree"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tree Content */}
      <div className="p-4 max-h-96 overflow-y-auto font-mono text-xs">
        {activeTab === 'tree' ? (
          <div className="space-y-0.5">
            {fileTree && fileTree.length > 0 ? (
              fileTree.map((item, idx) => (
                <TreeNode key={`${item.name}-${idx}`} node={item} level={0} />
              ))
            ) : (
              <p className="text-slate-400 text-center py-4 font-sans">No file tree available.</p>
            )}
          </div>
        ) : (
          <pre className="text-slate-700 bg-slate-50 p-4 rounded-lg leading-relaxed whitespace-pre font-mono text-[11px] overflow-x-auto">
            {textTree || 'No text tree available.'}
          </pre>
        )}
      </div>
    </div>
  );
}
