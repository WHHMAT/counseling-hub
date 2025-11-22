import React, { useState, useEffect } from 'react';
import { TOOLS } from './constants';
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
import FeedbackForm from './components/FeedbackForm';
import DonationPopup from './components/DonationPopup';
import Header from './components/Header';
import AuthPage from './components/AuthPage';
import ProfilePage from './components/ProfilePage';
import { useAuth } from './hooks/useAuth';
import { useUserData } from './hooks/useUserData';
import { db } from './firebase';
import firebase from './firebase';

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
    if (activeView === 'profile') {
      return <ProfilePage onGoHome={handleGoHome} />;
    }
    if (activeView === 'rogerian-reformulation') {
      return <RolePlayingTool onGoHome={handleGoHome} onExerciseComplete={handleExerciseComplete} userData={userData} />;
    } else if (activeView === 'rapport-pacing') {
      return <RapportTool onGoHome={handleGoHome} onExerciseComplete={handleExerciseComplete} userData={userData} />;
    } else if (activeView === 'maslow-pyramid') {
      return <MaslowTool onGoHome={handleGoHome} onExerciseComplete={handleExerciseComplete} userData={userData} />;
    } else if (activeView === 'vissi-explorer') {
      return <VissiTool onGoHome={handleGoHome} onExerciseComplete={handleExerciseComplete} userData={userData} />;
    } else if (activeView === 'phenomenological-feedback') {
      return <PhenomenologicalFeedbackTool onGoHome={handleGoHome} onExerciseComplete={handleExerciseComplete} userData={userData} />;
    } else if (activeView === 'smart-goal') {
      return <SmartGoalTool onGoHome={handleGoHome} onExerciseComplete={handleExerciseComplete} userData={userData} />;
    } else if (activeView === 'eisenhower-matrix') {
        return <EisenhowerMatrixTool onGoHome={handleGoHome} onExerciseComplete={() => handleExerciseComplete(10, 'eisenhower-matrix', 1)} />;
    } else if (activeView === 'vision-crafting') {
        return <VisionTool onGoHome={handleGoHome} onExerciseComplete={() => handleExerciseComplete(20, 'vision-crafting', 1)} />;
    } else if (activeView === 'self-assessment-hub') {
      return <SelfAssessmentHub onGoHome={handleGoHome} onExerciseComplete={() => handleExerciseComplete(0)} />;
    }
    
    // Schermata principale con gli strumenti
    return (
        <main className="container mx-auto px-4 py-12 sm:py-20">
            <header className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
                <span className="block">Hub Competenze</span>
                <span className="block text-sky-600">per Counselor</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                Seleziona uno strumento per iniziare a esercitarti e a sviluppare le tue abilità di counseling.
            </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {TOOLS.map((tool) => (
                <ToolCard key={tool.id} tool={tool} onStart={handleStartView} />
            ))}
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