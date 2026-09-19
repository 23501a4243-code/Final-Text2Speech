import React, { useState } from 'react';
import { 
  Mic2, 
  Sparkles, 
  BookOpen, 
  PlayCircle, 
  Layers, 
  Settings, 
  FolderOpen, 
  PlusCircle,
  Flame,
  LogIn,
  LogOut,
  User,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentView: 'landing' | 'studio' | 'rehearsal' | 'cue_cards' | 'auth';
  onNavigate: (view: 'landing' | 'studio' | 'rehearsal' | 'cue_cards' | 'auth', authMode?: 'signin' | 'signup' | 'otp') => void;
  onOpenQuestionnaire: () => void;
  onOpenSavedProjects: () => void;
  onOpenSettings: () => void;
  onOpenCoach: () => void;
  onOpenDemoMenu: () => void;
  savedCount: number;
  apiEngine: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenQuestionnaire,
  onOpenSavedProjects,
  onOpenSettings,
  onOpenCoach,
  onOpenDemoMenu,
  savedCount,
  apiEngine,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const initialLetter = (user?.name?.[0] || user?.email?.[0] || 'U').toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-purple-100/90 bg-white/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-purple-500 to-indigo-500 p-[1px] shadow-md shadow-purple-500/15 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white rounded-[11px] flex items-center justify-center">
              <Mic2 className="w-5 h-5 text-purple-600 group-hover:rotate-6 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-lg text-slate-900 tracking-tight">SpeechFlow</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-purple-100 text-purple-700 border border-purple-200">AI</span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">Event Speechwriter & Stage Coach</p>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-purple-50/70 p-1 rounded-full border border-purple-100">
          <button
            onClick={() => onNavigate('landing')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              currentView === 'landing'
                ? 'bg-white text-purple-700 shadow-sm border border-purple-200/80 font-semibold'
                : 'text-slate-600 hover:text-purple-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onNavigate('studio')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
              currentView === 'studio'
                ? 'bg-white text-purple-700 shadow-sm border border-purple-200/80 font-semibold'
                : 'text-slate-600 hover:text-purple-700'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-600" />
            Speech Studio
          </button>
          <button
            onClick={() => onNavigate('rehearsal')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
              currentView === 'rehearsal'
                ? 'bg-white text-purple-700 shadow-sm border border-purple-200/80 font-semibold'
                : 'text-slate-600 hover:text-purple-700'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5 text-purple-600" />
            Rehearsal Studio
          </button>
          <button
            onClick={() => onNavigate('cue_cards')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
              currentView === 'cue_cards'
                ? 'bg-white text-purple-700 shadow-sm border border-purple-200/80 font-semibold'
                : 'text-slate-600 hover:text-purple-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            Cue Cards
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Demo Pre-fill for Judges */}
          <button
            onClick={onOpenDemoMenu}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-all shadow-sm"
            title="Instant Demo Scenarios for Judges"
          >
            <Flame className="w-3.5 h-3.5 text-purple-600 animate-bounce" />
            <span className="hidden sm:inline">Try</span> Demo
          </button>

          {/* Delivery Coach */}
          <button
            onClick={onOpenCoach}
            className="p-2 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-colors"
            title="Stage Delivery Coach & Tips"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
          </button>

          {/* Saved Projects */}
          <button
            onClick={onOpenSavedProjects}
            className="relative p-2 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-colors"
            title="Saved Speeches"
          >
            <FolderOpen className="w-4 h-4" />
            {savedCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-purple-600 text-[9px] font-bold text-white flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-colors"
            title="AI Engine & API Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Authentication State Button / User Avatar */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 pl-2.5 rounded-xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200 transition-all text-xs font-medium"
                title={`Logged in as ${user.email}`}
              >
                <span className="text-slate-700 font-semibold max-w-[100px] sm:max-w-[130px] truncate hidden md:inline">
                  {user.name || user.email.split('@')[0]}
                </span>
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  {initialLetter}
                </div>
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-purple-100 shadow-xl p-3 z-50 animate-fadeIn"
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-3 py-2.5 border-b border-slate-100 mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900">{user.name || 'Speaker'}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" /> Verified
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                      onNavigate('landing');
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onNavigate('auth')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                currentView === 'auth'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-white hover:bg-purple-50 text-purple-700 border-purple-200 shadow-sm'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Primary CTA */}
          <button
            onClick={onOpenQuestionnaire}
            className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-sans shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Write Speech</span>
          </button>
        </div>

      </div>
    </header>
  );
};
