import React, { useState } from 'react';
import { TOOLS } from './constants';
import ToolCard from './components/ToolCard';
import RolePlayingTool from './components/RolePlayingTool';
import RapportTool from './components/RapportTool';
import MaslowTool from './components/MaslowTool';
import VissiTool from './components/VissiTool';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const handleStartTool = (toolId: string) => {
    setActiveTool(toolId);
  };

  const handleGoHome = () => {
    setActiveTool(null);
  };

  if (activeTool === 'rogerian-reformulation') {
    return <RolePlayingTool onGoHome={handleGoHome} />;
  } else if (activeTool === 'rapport-pacing') {
    return <RapportTool onGoHome={handleGoHome} />;
  } else if (activeTool === 'maslow-pyramid') {
    return <MaslowTool onGoHome={handleGoHome} />;
  } else if (activeTool === 'vissi-explorer') {
    return <VissiTool onGoHome={handleGoHome} />;
  }


  // Qui potranno essere aggiunti altri strumenti con 'else if'

  return (
    <div className="bg-gray-50 min-h-screen">
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
      </main>
      <footer className="text-center py-8 mt-12">
        <p className="text-gray-500">&copy; {new Date().getFullYear()} Hub Competenze Counseling. Tutti i diritti riservati.</p>
      </footer>
    </div>
  );
};

export default App;