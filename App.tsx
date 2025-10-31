import React, { useState, useEffect } from 'react';
import { TOOLS } from './constants';
import ToolCard from './components/ToolCard';
import RolePlayingTool from './components/RolePlayingTool';
import RapportTool from './components/RapportTool';
import MaslowTool from './components/MaslowTool';
import VissiTool from './components/VissiTool';
import PhenomenologicalFeedbackTool from './components/PhenomenologicalFeedbackTool';
import SmartGoalTool from './components/SmartGoalTool';
import FeedbackForm from './components/FeedbackForm';
import DonationPopup from './components/DonationPopup';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [exerciseCount, setExerciseCount] = useState<number>(() => {
    const savedCount = localStorage.getItem('exerciseCount');
    return savedCount ? parseInt(savedCount, 10) : 0;
  });
  const [showDonationPopup, setShowDonationPopup] = useState(false);

  useEffect(() => {
    localStorage.setItem('exerciseCount', exerciseCount.toString());
  }, [exerciseCount]);

  const handleExerciseComplete = () => {
    const newCount = exerciseCount + 1;
    setExerciseCount(newCount);
    if (newCount > 0 && newCount % 5 === 0) {
      setShowDonationPopup(true);
    }
  };

  const handleStartTool = (toolId: string) => {
    setActiveTool(toolId);
  };

  const handleGoHome = () => {
    setActiveTool(null);
  };

  if (activeTool === 'rogerian-reformulation') {
    return <RolePlayingTool onGoHome={handleGoHome} onExerciseComplete={handleExerciseComplete} />;
  } else if (activeTool === 'rapport-pacing') {
    return <RapportTool onGoHome={handleGoHome} onExerciseComplete={handleExerciseComplete} />;
  } else if (activeTool === 'maslow-pyramid') {
    return <MaslowTool onGoHome={handleGoHome} onExerciseComplete={handleExerciseComplete} />;
  } else if (activeTool === 'vissi-explorer') {
    return <VissiTool onGoHome={handleGoHome} onExerciseComplete={handleExerciseComplete} />;
  } else if (activeTool === 'phenomenological-feedback') {
    return <PhenomenologicalFeedbackTool onGoHome={handleGoHome} onExerciseComplete={handleExerciseComplete} />;
  } else if (activeTool === 'smart-goal') {
    return <SmartGoalTool onGoHome={handleGoHome} onExerciseComplete={handleExerciseComplete} />;
  }


  // Qui potranno essere aggiunti altri strumenti con 'else if'

  return (
    <div className="bg-gray-50 min-h-screen">
      <DonationPopup isOpen={showDonationPopup} onClose={() => setShowDonationPopup(false)} />
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
            <ToolCard key={tool.id} tool={tool} onStart={handleStartTool} />
          ))}
        </div>
        
        <section className="mt-24 max-w-2xl mx-auto">
            <FeedbackForm />
        </section>

      </main>
      <footer className="text-center py-8">
        <p className="text-gray-500">&copy; {new Date().getFullYear()} Hub Competenze Counseling. Tutti i diritti riservati.</p>
      </footer>
    </div>
  );
};

export default App;