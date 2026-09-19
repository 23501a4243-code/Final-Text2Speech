import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Key, 
  ShieldCheck, 
  Check, 
  Cpu, 
  Sparkles, 
  ExternalLink,
  Info
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  apiEngine: string;
  hasCustomKeysConfigured: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  apiEngine,
  hasCustomKeysConfigured,
}) => {
  const [inputKey, setInputKey] = useState(apiKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(inputKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-purple-200/90 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-6 border-b border-purple-100 flex items-center justify-between bg-purple-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-200">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-slate-900">
                AI Engine & Settings
              </h2>
              <p className="text-xs text-slate-500">Configure LLM providers & API credentials</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-purple-100/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Active Engine Status */}
          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <Cpu className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-xs font-bold text-slate-900">Active AI Model</div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {inputKey || hasCustomKeysConfigured ? 'Live Cloud LLM (Gemini / OpenAI)' : 'Smart Offline Fallback Engine'}
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Ready
            </span>
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Google Gemini or OpenAI API Key</span>
              <span className="text-slate-400 font-normal">Optional</span>
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="AIza... or sk-..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-purple-50/30 border border-purple-200/90 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 text-slate-900 text-xs font-mono placeholder-slate-400 outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              If left blank, SpeechFlow automatically uses its built-in context-aware speech generation engine with rich storytelling structures, ensuring 100% demo uptime.
            </p>
          </div>

          {/* Safe Key Storage Notice */}
          <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-start gap-2.5 text-xs text-indigo-800 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <span>
              Your API key is stored locally in your browser's private storage and is never shared or logged.
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-purple-100 bg-purple-50/40 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition-all"
          >
            {savedSuccess ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            <span>{savedSuccess ? 'Saved!' : 'Save Settings'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
