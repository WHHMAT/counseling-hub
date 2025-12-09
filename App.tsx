import React, { useState, useEffect } from 'react';
import { PROFESSIONAL_TOOLS, PERSONAL_TOOLS, PNL_TOOLS, ROGERIAN_TOOLS } from './constants';
import ToolCard from './components/ToolCard';
import RolePlayingTool from './components/RolePlayingTool';
import RapportTool from './components/RapportTool';
import MaslowTool from './components/MaslowTool';
import VissiTool from './components/VissiTool';
import PhenomenologicalFeedbackTool from './components/PhenomenologicalFeedbackTool';
import SmartGoalTool from './components/SmartGoalTool';
import SelfAssessmentHub from './components/SelfAssessmentHub';
import EisenhowerMatrixTool from './components/EisenhowerMatrixTool';
import VisionTool from './components/VisionTool';
import WheelOfLifeTool from './components/WheelOfLifeTool';
import PersonalDiaryTool from './components/PersonalDiaryTool';
import GordonMethodTool from './components/GordonMethodTool';
import NlpMapTool from './components/NlpMapTool';
import FeedbackForm from './components/FeedbackForm';
import DonationPopup from './components/DonationPopup';
import Header from './components/Header';
import AuthPage from './components/AuthPage';
import ProfilePage from './components/ProfilePage';
import { useAuth } from './hooks/useAuth';
import { useUserData } from './hooks/useUserData';
import { db } from './firebase';
import firebase from './firebase';
import { BriefcaseIcon, SparklesIcon } from './components/icons';

const ArrowLeftIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

interface HubCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  colorClass: string;
}

const HubCard: React.FC<HubCardProps> = ({ title, description, icon, onClick, colorClass }) => (
    <div
        onClick={onClick}
        className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300 ease-in-out cursor-pointer"
    >
        <div className={`rounded-full p-5 mb-6 ${colorClass}`}>
            {React.cloneElement(icon as React.ReactElement, { className: "h-12 w-12 text-white" })}
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
        <p className="text-gray-600 flex-grow">{description}</p>
    </div>
);


const App: React.FC = () => {
  const [activeView, setActiveView] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [showDonationPopup, setShowDonationPopup] = useState(false);
  const { user } = useAuth();
  const { userData } = useUserData();

  const handleExerciseComplete = async (points: number, toolId?: string, exerciseId?: string | number) => {
    if (!user) {
        const anonCount = parseInt(sessionStorage.getItem('anonExerciseCount') || '0', 10) + 1;
        sessionStorage.setItem('anonExerciseCount', anonCount.toString());
        if (anonCount > 0 && anonCount % 5 === 0) {
            setShowDonationPopup(true);
        }
        return;
    }

    const userRef = db.collection('users').doc(user.uid);
    try {
        await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(userRef);
            if (!doc.exists) {
                console.error("User document does not exist!");
                return;
            }
            
            const data = doc.data();
            const currentCount = data?.exerciseCount || 0;
            const newCount = currentCount + 1;

            const updates: any = {
                exerciseCount: firebase.firestore.FieldValue.increment(1),
                points: firebase.firestore.FieldValue.increment(points)
            };

            if (toolId && (exerciseId || exerciseId === 0)) {
                 updates[`completedExercises.${toolId}`] = firebase.firestore.FieldValue.arrayUnion(exerciseId);
            }
            
            transaction.update(userRef, updates);
            
            if (newCount > 0 && newCount % 5 === 0) {
                setShowDonationPopup(true);
            }
        });
    } catch (error) {
        console.error("Error updating user progress:", error);
    }
  };

  const handleShowAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleStartView = (viewId: string) => {
    setActiveView(viewId);
  };

  const handleGoHome = () => {
    setActiveView(null);
  };
  
  const handleShowProfile = () => {
    setActiveView('profile');
  };

  const renderContent = () => {
    const isProfessionalTool = PROFESSIONAL_TOOLS.some(tool => tool.id === activeView && tool.id !== 'nlp-hub' && tool.id !== 'rogerian-hub');
    const isPersonalTool = PERSONAL_TOOLS.some(tool => tool.id === activeView);
    const isNlpTool = PNL_TOOLS.some(tool => tool.id === activeView);
    const isRogerianTool = ROGERIAN_TOOLS.some(tool => tool.id === activeView);

    if (isNlpTool) {
        const onGoBack = () => setActiveView('nlp-hub');
        if (activeView === 'rapport-pacing') {
          return <RapportTool onGoHome={onGoBack} onExerciseComplete={handleExerciseComplete} userData={userData} />;
        }
        if (activeView === 'nlp-client-map') {
            return <NlpMapTool onGoHome={onGoBack} onExerciseComplete={(scenarioId) => handleExerciseComplete(15, 'nlp-client-map', scenarioId)} userData={userData} />;
        }
    }
    
    if (isRogerianTool) {
        const onGoBack = () => setActiveView('rogerian-hub');
        if (activeView === 'rogerian-reformulation') {
          return <RolePlayingTool onGoHome={onGoBack} onExerciseComplete={handleExerciseComplete} userData={userData} />;
        } else if (activeView === 'vissi-explorer') {
          return <VissiTool onGoHome={onGoBack} onExerciseComplete={handleExerciseComplete} userData={userData} />;
        } else if (activeView === 'phenomenological-feedback') {
          return <PhenomenologicalFeedbackTool onGoHome={onGoBack} onExerciseComplete={handleExerciseComplete} userData={userData} />;
        }
    }
    
    if (isProfessionalTool || isPersonalTool) {
        const onGoBack = () => setActiveView(isProfessionalTool ? 'professional-hub' : 'personal-hub');
        
        if (activeView === 'maslow-pyramid') {
          return <MaslowTool onGoHome={onGoBack} onExerciseComplete={handleExerciseComplete} userData={userData} />;
        } else if (activeView === 'smart-goal') {
          return <SmartGoalTool onGoHome={onGoBack} onExerciseComplete={handleExerciseComplete} userData={userData} />;
        } else if (activeView === 'eisenhower-matrix') {
            return <EisenhowerMatrixTool onGoHome={onGoBack} onExerciseComplete={() => handleExerciseComplete(10, 'eisenhower-matrix', 1)} />;
        } else if (activeView === 'vision-crafting') {
            return <VisionTool onGoHome={onGoBack} onExerciseComplete={() => handleExerciseComplete(20, 'vision-crafting', 1)} />;
        } else if (activeView === 'wheel-of-life') {
            return <WheelOfLifeTool onGoHome={onGoBack} onExerciseComplete={() => handleExerciseComplete(15, 'wheel-of-life', 1)} />;
        } else if (activeView === 'personal-diary') {
            return <PersonalDiaryTool onGoHome={onGoBack} onExerciseComplete={(entryId) => handleExerciseComplete(15, 'personal-diary', entryId)} />;
        } else if (activeView === 'gordon-method') {
            return <GordonMethodTool onGoHome={onGoBack} onExerciseComplete={(scenarioId) => handleExerciseComplete(10, 'gordon-method', scenarioId)} />;
        } else if (activeView === 'self-assessment-hub') {
          return <SelfAssessmentHub onGoHome={onGoBack} onExerciseComplete={() => handleExerciseComplete(0)} />;
        }
    }

    if (activeView === 'profile') {
      return <ProfilePage onGoHome={handleGoHome} />;
    }
    
    if (activeView === 'rogerian-hub') {
        return (
            <main className="container mx-auto px-4 py-12 sm:py-20">
                <button onClick={() => setActiveView('professional-hub')} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold mb-8 transition-colors">
                    <ArrowLeftIcon />
                    Torna agli Strumenti Professionali
                </button>
                <header className="text-center mb-16">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                        Rogers - Approccio Centrato sulla Persona
                    </h1>
                    <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                        Esercitati sui pilastri dell'approccio Rogersiano: ascolto attivo, empatia e feedback non giudicante.
                    </p>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {ROGERIAN_TOOLS.map((tool) => (
                        <ToolCard key={tool.id} tool={tool} onStart={handleStartView} />
                    ))}
                </div>
            </main>
        );
    }

    if (activeView === 'nlp-hub') {
        return (
            <main className="container mx-auto px-4 py-12 sm:py-20">
                <button onClick={() => setActiveView('professional-hub')} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold mb-8 transition-colors">
                    <ArrowLeftIcon />
                    Torna agli Strumenti Professionali
                </button>
                <header className="text-center mb-16">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                        Strumenti di PNL
                    </h1>
                    <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                        Tecniche di Programmazione Neuro-Linguistica per l'analisi e la comunicazione efficace.
                    </p>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {PNL_TOOLS.map((tool) => (
                        <ToolCard key={tool.id} tool={tool} onStart={handleStartView} />
                    ))}
                </div>
            </main>
        );
    }

    if (activeView === 'professional-hub' || activeView === 'personal-hub') {
        const isProfessional = activeView === 'professional-hub';
        const hubTitle = isProfessional ? "Strumenti di Crescita Professionale" : "Strumenti di Crescita Personale";
        const hubDescription = isProfessional 
            ? "Esercizi mirati per affinare le tue competenze tecniche come counselor." 
            : "Percorsi per esplorare te stesso e migliorare il tuo benessere personale.";
        const toolsToShow = isProfessional ? PROFESSIONAL_TOOLS : PERSONAL_TOOLS;

        return (
            <main className="container mx-auto px-4 py-12 sm:py-20">
                <button onClick={() => setActiveView(null)} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold mb-8 transition-colors">
                    <ArrowLeftIcon />
                    Torna alla scelta
                </button>
                <header className="text-center mb-16">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                        {hubTitle}
                    </h1>
                    <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                        {hubDescription}
                    </p>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {toolsToShow.map((tool) => (
                        <ToolCard key={tool.id} tool={tool} onStart={handleStartView} />
                    ))}
                </div>
            </main>
        );
    }

    // Main Home Screen
    return (
        <main className="container mx-auto px-4 py-12 sm:py-20">
            <header className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
                <span className="block">Hub Competenze</span>
                <span className="block text-sky-600">per Counselor</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                Scegli il tuo percorso di crescita. Sviluppa le tue abilità professionali o esplora il tuo mondo interiore.
            </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                 <HubCard
                    title="Crescita Professionale"
                    description="Affina le tecniche di counseling, impara a gestire scenari complessi e migliora le tue abilità di ascolto e riformulazione."
                    icon={<BriefcaseIcon />}
                    onClick={() => setActiveView('professional-hub')}
                    colorClass="bg-sky-600"
                />
                <HubCard
                    title="Crescita Personale"
                    description="Esplora te stesso attraverso strumenti di autovalutazione, definisci i tuoi obiettivi e trova un maggiore equilibrio nella tua vita."
                    icon={<SparklesIcon />}
                    onClick={() => setActiveView('personal-hub')}
                    colorClass="bg-amber-500"
                />
            </div>
            
            <section className="mt-24 max-w-2xl mx-auto">
                <FeedbackForm />
            </section>
        </main>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header onGoHome={handleGoHome} onShowAuth={handleShowAuth} onShowProfile={handleShowProfile} />
      <AuthPage 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
      <DonationPopup isOpen={showDonationPopup} onClose={() => setShowDonationPopup(false)} />
      
      {renderContent()}

      <footer className="text-center py-8">
        <p className="text-gray-500">&copy; {new Date().getFullYear()} Hub Competenze Counseling. Tutti i diritti riservati.</p>
      </footer>
    </div>
  );
};

export default App;