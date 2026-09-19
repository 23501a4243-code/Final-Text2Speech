import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { SpeechEditor } from './components/Editor/SpeechEditor';
import { RehearsalStudio } from './components/Rehearsal/RehearsalStudio';
import { CueCardViewer } from './components/CueCards/CueCardViewer';
import { QuestionnaireModal } from './components/Questionnaire/QuestionnaireModal';
import { SavedProjectsModal } from './components/SavedProjects/SavedProjectsModal';
import { SettingsModal } from './components/SettingsModal';
import { ConfidenceCoachModal } from './components/Coach/ConfidenceCoachModal';
import { DemoMenuModal } from './components/DemoMenuModal';
import { AuthPage } from './components/Auth/AuthPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DEMO_SCENARIOS } from './data/demoScenarios';
import { SpeechProject } from './types/speech';
import { checkServerHealth } from './services/api';

const STORAGE_KEY_PROJECTS = 'toastcraft_projects_v1';
const STORAGE_KEY_ACTIVE_ID = 'toastcraft_active_id_v1';
const STORAGE_KEY_API_KEY = 'toastcraft_api_key_v1';

function AppContent() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | 'studio' | 'rehearsal' | 'cue_cards' | 'auth'>('landing');
  const [savedProjects, setSavedProjects] = useState<SpeechProject[]>([]);
  const [activeProject, setActiveProject] = useState<SpeechProject>(DEMO_SCENARIOS[0].project);
  
  // Modals
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  const [isSavedProjectsOpen, setIsSavedProjectsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);

  // API Config
  const [apiKey, setApiKey] = useState<string>('');
  const [apiEngine, setApiEngine] = useState<string>('smart-local-engine');
  const [hasCustomKeysConfigured, setHasCustomKeysConfigured] = useState(false);

  // Initialize storage & health
  useEffect(() => {
    // Load API key
    const storedKey = localStorage.getItem(STORAGE_KEY_API_KEY) || '';
    setApiKey(storedKey);

    // Load projects
    const storedProjects = localStorage.getItem(STORAGE_KEY_PROJECTS);
    if (storedProjects) {
      try {
        const parsed = JSON.parse(storedProjects);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedProjects(parsed);
          const activeId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
          const found = parsed.find(p => p.id === activeId);
          setActiveProject(found || parsed[0]);
        } else {
          initDefaultProjects();
        }
      } catch {
        initDefaultProjects();
      }
    } else {
      initDefaultProjects();
    }

    // Health check
    checkServerHealth().then((health) => {
      setApiEngine(health.aiEngine);
      setHasCustomKeysConfigured(health.hasCustomKeysConfigured);
    });
  }, []);

  const initDefaultProjects = () => {
    const demos = DEMO_SCENARIOS.map(d => d.project);
    setSavedProjects(demos);
    setActiveProject(demos[0]);
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(demos));
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, demos[0].id);
  };

  // Sync projects to localStorage
  const saveProjectsToStorage = (projects: SpeechProject[], activeId?: string) => {
    setSavedProjects(projects);
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
    if (activeId) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeId);
    }
  };

  const handleSpeechGenerated = (newProject: SpeechProject) => {
    const updated = [newProject, ...savedProjects.filter(p => p.id !== newProject.id)];
    setActiveProject(newProject);
    saveProjectsToStorage(updated, newProject.id);
    setCurrentView('studio');
  };

  const handleUpdateProject = (updated: SpeechProject) => {
    setActiveProject(updated);
    const list = savedProjects.map(p => p.id === updated.id ? updated : p);
    saveProjectsToStorage(list, updated.id);
  };

  const handleSelectProject = (project: SpeechProject) => {
    setActiveProject(project);
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, project.id);
    setCurrentView('studio');
  };

  const handleDeleteProject = (id: string) => {
    const filtered = savedProjects.filter(p => p.id !== id);
    if (filtered.length === 0) {
      initDefaultProjects();
      return;
    }
    setSavedProjects(filtered);
    if (activeProject.id === id) {
      setActiveProject(filtered[0]);
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, filtered[0].id);
    }
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(filtered));
  };

  const handleLoadDemo = (demoId: string) => {
    const scenario = DEMO_SCENARIOS.find(s => s.id === demoId) || DEMO_SCENARIOS[0];
    setActiveProject(scenario.project);
    const existing = savedProjects.find(p => p.id === scenario.project.id);
    if (!existing) {
      saveProjectsToStorage([scenario.project, ...savedProjects], scenario.project.id);
    } else {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, scenario.project.id);
    }
    setCurrentView('studio');
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem(STORAGE_KEY_API_KEY, key);
  };

  // Protected route navigation guard
  const handleNavigate = (view: 'landing' | 'studio' | 'rehearsal' | 'cue_cards' | 'auth') => {
    if (['studio', 'rehearsal', 'cue_cards'].includes(view) && !isAuthenticated) {
      setCurrentView('auth');
      return;
    }
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] text-slate-900 flex flex-col selection:bg-purple-200 selection:text-purple-900">
      
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenQuestionnaire={() => {
          if (!isAuthenticated) {
            setCurrentView('auth');
          } else {
            setIsQuestionnaireOpen(true);
          }
        }}
        onOpenSavedProjects={() => setIsSavedProjectsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCoach={() => setIsCoachOpen(true)}
        onOpenDemoMenu={() => setIsDemoMenuOpen(true)}
        savedCount={savedProjects.length}
        apiEngine={apiEngine}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onStartSpeech={() => {
              if (!isAuthenticated) {
                setCurrentView('auth');
              } else {
                setIsQuestionnaireOpen(true);
              }
            }}
            onLoadDemo={handleLoadDemo}
          />
        )}

        {currentView === 'auth' && (
          <AuthPage
            onSuccess={() => setCurrentView('studio')}
            onCancel={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'studio' && (
          <SpeechEditor
            project={activeProject}
            onUpdateProject={handleUpdateProject}
            onNavigateToRehearsal={() => setCurrentView('rehearsal')}
            onNavigateToCueCards={() => setCurrentView('cue_cards')}
            apiKey={apiKey}
          />
        )}

        {currentView === 'rehearsal' && (
          <RehearsalStudio
            project={activeProject}
            onBackToEditor={() => setCurrentView('studio')}
            onNavigateToCueCards={() => setCurrentView('cue_cards')}
          />
        )}

        {currentView === 'cue_cards' && (
          <CueCardViewer
            project={activeProject}
            onBackToStudio={() => setCurrentView('studio')}
          />
        )}
      </main>

      {/* Modals */}
      <QuestionnaireModal
        isOpen={isQuestionnaireOpen}
        onClose={() => setIsQuestionnaireOpen(false)}
        onSpeechGenerated={handleSpeechGenerated}
        apiKey={apiKey}
      />

      <SavedProjectsModal
        isOpen={isSavedProjectsOpen}
        onClose={() => setIsSavedProjectsOpen(false)}
        projects={savedProjects}
        currentProjectId={activeProject.id}
        onSelectProject={handleSelectProject}
        onDeleteProject={handleDeleteProject}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        apiEngine={apiEngine}
        hasCustomKeysConfigured={hasCustomKeysConfigured}
      />

      <ConfidenceCoachModal
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        project={activeProject}
      />

      <DemoMenuModal
        isOpen={isDemoMenuOpen}
        onClose={() => setIsDemoMenuOpen(false)}
        onSelectDemo={(proj) => {
          setActiveProject(proj);
          setCurrentView('studio');
        }}
      />

    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
