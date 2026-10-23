'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { sendProjectChatMessage } from '../lib/api';

const QUICK_PROMPTS = [
  'How does authentication work?',
  'What technologies are used?',
  'What should I implement next?',
  'Explain the architecture.'
];

export default function ChatMentor({ projectContext }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I'm your AI Project Mentor. I've analyzed ${projectContext?.name || 'your project'}. Ask me anything about its structure, dependencies, authentication, or next features you should build!`
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const chatEndRef = useRef(null);
  const projectName = projectContext?.name || projectContext?.projectName || 'your project';

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: `Hello! I'm your AI Project Mentor. I've analyzed ${projectName}. Ask me anything about its structure, dependencies, authentication, or next features you should build!`
      }
    ]);
    setInputQuery('');
    setErrorMsg('');
  }, [projectName]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const question = textToSend || inputQuery;
    if (!question.trim() || isLoading) return;

    setErrorMsg('');
    setInputQuery('');

    const newMessages = [...messages, { role: 'user', content: question }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await sendProjectChatMessage(
        question,
        projectContext,
        newMessages.slice(1) // exclude initial greeting
      );

      if (response.success && response.answer) {
        setMessages((prev) => [...prev, { role: 'assistant', content: response.answer }]);
      } else {
        throw new Error(response.error || 'Failed to get answer from mentor.');
      }
    } catch (err) {
      console.error('Chat error:', err);
      setErrorMsg(err.message || 'Error communicating with AI Mentor.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ ${err.message || 'Unable to get answer. Please check if your GEMINI_API_KEY is configured in backend/.env.'}`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[560px]">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/40 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Ask AI About Your Project</h3>
            <p className="text-[11px] text-slate-500">Grounded strictly on your uploaded files</p>
          </div>
        </div>

        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
          AI Mentor Active
        </span>
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <span className="text-slate-400 flex items-center gap-1 flex-shrink-0">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <span>Quick ask:</span>
        </span>
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition flex-shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-indigo-700 border border-slate-200'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-indigo-700 border border-slate-200 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none px-4 py-2.5 flex items-center space-x-2 text-xs text-slate-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>Mentor is thinking...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Error alert if any */}
      {errorMsg && (
        <div className="mx-4 mb-2 p-2 rounded-lg bg-rose-50 border border-rose-200 flex items-center space-x-2 text-xs text-rose-700">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{errorMsg}</span>
        </div>
      )}

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-slate-100 bg-white flex items-center space-x-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask something about your project..."
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-400 bg-slate-50/50"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isLoading}
          className={`inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition ${
            !inputQuery.trim() || isLoading
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200'
          }`}
        >
          <span>Ask AI</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
