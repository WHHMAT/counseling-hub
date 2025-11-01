import React, { useState } from 'react';
import type { Tool } from '../types';
import ToolCard from './ToolCard';
import SelfEsteemTest from './SelfEsteemTest';
import InnerCriticTest from './InnerCriticTest';
import BoundariesTest from './BoundariesTest';
import { ClipboardCheckIcon, ScaleIcon, ShieldCheckIcon } from './icons';

const ArrowLeftIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const ASSESSMENT_TESTS: Tool[] = [
  {
    id: 'self-esteem',
    title: 'Test sull\'Autostima',
    description: 'Valuta il tuo livello di autostima attraverso un questionario di auto-esplorazione e ricevi un resoconto personalizzato per la tua crescita.',
    icon: <ClipboardCheckIcon />,
    actionText: 'Inizia il Test',
    comingSoon: false,
  },
  {
    id: 'inner-critic',
    title: 'Test sul Giudice Interiore',
    description: 'Identifica la forza e le caratteristiche della tua voce critica interiore per imparare a gestirla con maggiore consapevolezza e gentilezza.',
    icon: <ScaleIcon />,
    actionText: 'Inizia il Test',
    comingSoon: false,
  },
  {
    id: 'healthy-boundaries',
    title: 'Test sui Confini Personali',
    description: 'Esplora la tua capacità di stabilire e mantenere sani confini personali nelle relazioni, al lavoro e con te stesso/a.',
    icon: <ShieldCheckIcon />,
    actionText: 'Inizia il Test',
    comingSoon: false,
  },
];

interface SelfAssessmentHubProps {
  onGoHome: () => void;
  onExerciseComplete: () => void;
}

const SelfAssessmentHub: React.FC<SelfAssessmentHubProps> = ({ onGoHome, onExerciseComplete }) => {
    const [activeTest, setActiveTest] = useState<string | null>(null);

    const handleStartTest = (testId: string) => {
        setActiveTest(testId);
    };
    
    const handleGoBackToHub = () => {
        setActiveTest(null);
    };

    if (activeTest === 'self-esteem') {
        return <SelfEsteemTest onGoHome={handleGoBackToHub} onExerciseComplete={onExerciseComplete} backButtonText="Torna alla lista dei test" />;
    }

    if (activeTest === 'inner-critic') {
        return <InnerCriticTest onGoHome={handleGoBackToHub} onExerciseComplete={onExerciseComplete} backButtonText="Torna alla lista dei test" />;
    }
    
    if (activeTest === 'healthy-boundaries') {
        return <BoundariesTest onGoHome={handleGoBackToHub} onExerciseComplete={onExerciseComplete} backButtonText="Torna alla lista dei test" />;
    }

    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <button onClick={onGoHome} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold mb-8 transition-colors">
                    <ArrowLeftIcon />
                    Torna al menu principale
                </button>
                
                <header className="text-center mb-12">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                    Test di Autovalutazione
                  </h1>
                  <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                    Questi strumenti sono pensati per la riflessione personale e non hanno valore diagnostico. Scegli un'area che desideri esplorare.
                  </p>
                </header>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {ASSESSMENT_TESTS.map((test) => (
                    <ToolCard key={test.id} tool={test} onStart={handleStartTest} />
                  ))}
                </div>

                <footer className="text-center py-8 mt-12">
                    <p className="text-gray-500">&copy; {new Date().getFullYear()} Hub Competenze Counseling. Tutti i diritti riservati.</p>
                </footer>
            </div>
        </div>
    );
};

export default SelfAssessmentHub;