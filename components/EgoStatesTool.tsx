
import React, { useState, useEffect } from 'react';
import { useUserData } from '../hooks/useUserData';
import { db } from '../firebase';
import firebase from '../firebase';

const TOOL_ID = 'ego-states';

const ArrowLeftIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const RefreshIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5m11 2a9 9 0 11-2-7.857" />
    </svg>
);

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
    </div>
);

const SCENARIOS = [
    { id: 1, text: "Non dovresti vestirti così per un colloquio, sembri poco professionale. Quante volte te lo devo dire?" },
    { id: 2, text: "Wow! Guarda che tramonto incredibile! Corriamo a fare una foto!" },
    { id: 3, text: "Analizzando i dati di vendita dell'ultimo trimestre, notiamo un calo del 5%. Dobbiamo capire le cause." },
    { id: 4, text: "Non so se sono capace... e se poi sbaglio e si arrabbiano tutti con me?" },
    { id: 5, text: "Vieni qui, poverino, ti sei fatto male? Lascia che ti metta un cerotto e ti prepari una tazza di tè caldo." },
    { id: 6, text: "È colpa tua se siamo in ritardo! Sei sempre il solito disorganizzato." },
    { id: 7, text: "Ho deciso che voglio imparare a suonare la chitarra, non mi importa se dicono che sono stonato, mi diverte!" },
    { id: 8, text: "Per risolvere questo conflitto, propongo di ascoltare le ragioni di entrambi per 5 minuti ciascuno senza interruzioni." },
    { id: 9, text: "Sì, va bene, farò come dici tu... basta che non alzi la voce." },
    { id: 10, text: "Devi finire tutto quello che hai nel piatto, ci sono bambini che muoiono di fame!" },
    { id: 11, text: "Non mi importa niente delle regole! Faccio quello che voglio io, punto e basta!" },
    { id: 12, text: "Se continui a comportarti così, nessuno vorrà più essere tuo amico." }
];

type Level = 'basic' | 'advanced';

// Definizione opzioni Livello Base
const BASIC_OPTIONS = [
    { id: 'G', label: 'Genitore', color: 'bg-red-100 border-red-300 text-red-800' },
    { id: 'A', label: 'Adulto', color: 'bg-blue-100 border-blue-300 text-blue-800' },
    { id: 'B', label: 'Bambino', color: 'bg-green-100 border-green-300 text-green-800' }
];

// Definizione opzioni Livello Avanzato
const ADVANCED_OPTIONS = [
    { id: 'GN', label: 'Genitore Normativo (Critico)', color: 'bg-red-100 border-red-400 text-red-900' },
    { id: 'GA', label: 'Genitore Affettivo (Nutritivo)', color: 'bg-pink-100 border-pink-400 text-pink-900' },
    { id: 'A',  label: 'Adulto', color: 'bg-blue-100 border-blue-400 text-blue-900' },
    { id: 'BL', label: 'Bambino Libero', color: 'bg-green-100 border-green-400 text-green-900' },
    { id: 'BA', label: 'Bambino Adattato', color: 'bg-yellow-100 border-yellow-400 text-yellow-900' },
    { id: 'BR', label: 'Bambino Ribelle', color: 'bg-orange-100 border-orange-400 text-orange-900' },
];

interface EgoStatesToolProps {
  onGoHome: () => void;
  onExerciseComplete: (points: number, toolId: string, exerciseId: number) => void;
  userData: ReturnType<typeof useUserData>['userData'];
}

const EgoStatesTool: React.FC<EgoStatesToolProps> = ({ onGoHome, onExerciseComplete, userData }) => {
    const [level, setLevel] = useState<Level | null>(null);
    const [scenario, setScenario] = useState(SCENARIOS[0]);
    
    const [selectedOption, setSelectedOption] = useState<{id: string, label: string} | null>(null);
    const [justification, setJustification] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showResetMessage, setShowResetMessage] = useState(false);

    const resetUserProgressForTool = async () => {
        if (userData && firebase.auth().currentUser) {
            const userRef = db.collection('users').doc(firebase.auth().currentUser.uid);
            await userRef.update({
                [`completedExercises.${TOOL_ID}`]: []
            });
        }
    };

    const setNewScenario = async () => {
        setSelectedOption(null);
        setJustification('');
        setFeedback('');
        setError('');

        const completedScenarios = userData?.completedExercises?.[TOOL_ID] || [];
        let availableScenarios = SCENARIOS.filter(s => !completedScenarios.includes(s.id));

        if (availableScenarios.length === 0 && SCENARIOS.length > 0) {
            setShowResetMessage(true);
            setTimeout(() => setShowResetMessage(false), 4000);
            await resetUserProgressForTool();
            availableScenarios = SCENARIOS;
        }

        if (availableScenarios.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableScenarios.length);
            setScenario(availableScenarios[randomIndex]);
        } else {
            setScenario({ id: 0, text: "Nessuno scenario disponibile." });
        }
    };

    // Resetta lo scenario quando l'utente cambia livello o carica i dati
    useEffect(() => {
        if (level) {
            setNewScenario();
        }
    }, [level, userData]);

    const handleLevelSelect = (lvl: Level) => {
        setLevel(lvl);
    };

    const handleBackToLevelSelect = () => {
        setLevel(null);
        setSelectedOption(null);
        setJustification('');
        setFeedback('');
    };

    const handleOptionSelection = (option: {id: string, label: string}) => {
        setSelectedOption(option);
    };

    const handleGenerateFeedback = async () => {
        if (!selectedOption) {
            setError("Per favore, seleziona uno Stato dell'Io.");
            return;
        }
        if (!justification.trim()) {
            setError("Per favore, spiega brevemente perché hai fatto questa scelta.");
            return;
        }
        setIsLoading(true);
        setError('');
        setFeedback('');

        const prompt = `Sei un supervisore esperto di Analisi Transazionale (AT). Il tuo compito è valutare l'analisi di uno studente.
        
**Livello dell'esercizio:** ${level === 'basic' ? 'BASE (Macro-categorie)' : 'AVANZATO (Funzionale dettagliato)'}

**Scenario/Frase:**
"${scenario.text}"

**Analisi dello Studente:**
- **Stato Identificato:** ${selectedOption.label}
- **Giustificazione:** "${justification}"

**Istruzioni per il Feedback:**
Fornisci un'analisi costruttiva in formato Markdown, strutturata come segue (usa ** per i titoli):

**Correttezza dell'Identificazione:**
Conferma se lo Stato dell'Io identificato è corretto rispetto al livello richiesto (${level === 'basic' ? 'Genitore, Adulto o Bambino' : 'Specificare la funzione esatta come Genitore Normativo, Affettivo, Bambino Adattato, Ribelle, ecc.'}). 
${level === 'advanced' ? "Se lo studente ha identificato la macro-categoria giusta (es. Bambino) ma sbagliato la funzione (es. Adattato invece di Ribelle), riconoscilo ma correggi la precisione." : ""}

**Analisi Funzionale:**
Spiega le caratteristiche tipiche dello stato attivo in questa frase (es. tono di voce ipotetico, scelta delle parole, atteggiamento).

**Spunti di Riflessione:**
Chiedi allo studente come risponderebbe a questa frase partendo dal suo stato dell'Io Adulto, per favorire una transazione complementare o incrociata costruttiva.

**Punteggio:**
Assegna un punteggio numerico: 
- 10 per un'identificazione corretta e ben motivata.
- 5 se l'identificazione è parzialmente corretta (es. azzeccata la macro-categoria ma sbagliata la funzione nel livello avanzato).
- 0 se completamente errata.
---`;

        try {
            const res = await fetch('/.netlify/functions/generateFeedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `Errore del server.`);

            setFeedback(data.feedback);
            
            const scoreMatch = data.feedback.match(/\*\*Punteggio:\*\*\s*(\d+)/);
            const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;

            // Diamo un bonus di punti se si gioca in modalità avanzata
            const finalScore = level === 'advanced' ? Math.round(score * 1.5) : score;

            onExerciseComplete(finalScore, TOOL_ID, scenario.id);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Si è verificato un errore sconosciuto.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderMarkdown = (text: string) => {
        return text.split('\n').map((line, index) => {
            if (line.startsWith('**') && line.endsWith('**')) {
                return <h3 key={index} className="text-lg font-bold text-gray-800 mt-4 mb-2">{line.replace(/\*\*/g, '')}</h3>;
            }
             if (line.startsWith('- ')) {
                return <li key={index} className="ml-5 list-disc">{line.substring(2)}</li>;
            }
            return <p key={index} className="mb-2">{line}</p>;
        });
    };

    // Render della selezione Livello
    if (!level) {
        return (
            <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <button onClick={onGoHome} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold mb-8 transition-colors">
                        <ArrowLeftIcon />
                        Torna al menu principale
                    </button>
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Riconoscere gli Stati dell'Io</h1>
                        <p className="text-gray-600 mb-8 max-w-xl mx-auto">
                            Scegli il livello di difficoltà per esercitarti nell'identificazione degli Stati dell'Io secondo l'Analisi Transazionale.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <button 
                                onClick={() => handleLevelSelect('basic')}
                                className="flex flex-col items-center p-6 border-2 border-sky-200 rounded-xl hover:border-sky-500 hover:bg-sky-50 transition-all group"
                            >
                                <div className="bg-sky-100 p-4 rounded-full mb-4 group-hover:bg-sky-200 transition-colors">
                                    <span className="text-2xl font-bold text-sky-700">1</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Livello Base</h3>
                                <p className="text-gray-600 text-sm">
                                    Identifica le 3 macro-categorie: <br/>
                                    <strong>Genitore, Adulto, Bambino.</strong>
                                </p>
                            </button>

                            <button 
                                onClick={() => handleLevelSelect('advanced')}
                                className="flex flex-col items-center p-6 border-2 border-purple-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
                            >
                                <div className="bg-purple-100 p-4 rounded-full mb-4 group-hover:bg-purple-200 transition-colors">
                                    <span className="text-2xl font-bold text-purple-700">2</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Livello Avanzato</h3>
                                <p className="text-gray-600 text-sm">
                                    Identifica le funzioni specifiche:<br/>
                                    <strong>Normativo, Affettivo, Adattato, Ribelle, Libero...</strong>
                                </p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Render dello Strumento Attivo
    return (
      <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
              <button onClick={onGoHome} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold transition-colors">
                <ArrowLeftIcon />
                Menu Principale
              </button>
              <button onClick={handleBackToLevelSelect} className="text-sm font-medium text-gray-500 hover:text-sky-600 underline">
                  Cambia Livello
              </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Stati dell'Io</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${level === 'basic' ? 'bg-sky-100 text-sky-800' : 'bg-purple-100 text-purple-800'}`}>
                    Livello {level === 'basic' ? 'Base' : 'Avanzato'}
                </span>
            </div>
            
            <p className="text-gray-600 mb-6">Analizza la frase e identifica lo Stato dell'Io attivo.</p>

            {showResetMessage && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-r-lg" role="alert">
                <p>Complimenti, hai completato tutti gli scenari! Ora te li riproporremo per continuare a esercitarti.</p>
              </div>
            )}
            
            <div className="relative bg-amber-50 border-l-4 border-amber-500 text-amber-900 p-6 rounded-r-lg mb-8 shadow-sm">
              <p className="text-xl italic font-serif">"{scenario.text}"</p>
              <button onClick={setNewScenario} disabled={isLoading} className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors text-gray-500 disabled:opacity-50" title="Nuovo Scenario"><RefreshIcon /></button>
            </div>

            <div className="space-y-6">
                {/* Options Grid */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">1. Seleziona lo Stato dell'Io:</h3>
                    <div className={`grid gap-3 ${level === 'basic' ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'}`}>
                        {(level === 'basic' ? BASIC_OPTIONS : ADVANCED_OPTIONS).map((option) => (
                            <button
                                key={option.id}
                                onClick={() => handleOptionSelection(option)}
                                className={`py-3 px-2 rounded-lg border-2 font-bold text-sm sm:text-base transition-all h-full flex items-center justify-center text-center ${
                                    selectedOption?.id === option.id 
                                    ? option.color + ' ring-2 ring-offset-1 ring-sky-300 transform scale-105'
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Justification */}
                {selectedOption && (
                    <div className="animate-fade-in">
                        <label htmlFor="justification" className="block text-lg font-semibold text-gray-800 mb-2">2. Perché hai scelto questo stato?</label>
                        <textarea 
                            id="justification" 
                            rows={3} 
                            value={justification} 
                            onChange={(e) => setJustification(e.target.value)} 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 transition shadow-sm" 
                            placeholder="Quali parole, toni o atteggiamenti ti hanno guidato? Es. 'Usa un imperativo...' oppure 'Sembra un dato di fatto oggettivo...'"
                        ></textarea>
                    </div>
                )}
            </div>
            
            {error && <p className="text-red-600 mt-4 text-center">{error}</p>}

            <div className="mt-8 text-center">
              <button 
                onClick={handleGenerateFeedback} 
                disabled={isLoading || !selectedOption || !justification} 
                className="bg-sky-600 text-white px-8 py-3 rounded-full font-semibold transition-all hover:bg-sky-700 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Analisi in corso...' : 'Verifica Risposta'}
              </button>
            </div>

            {isLoading && <div className="mt-8"><LoadingSpinner /></div>}

            {feedback && (
              <div className="mt-8 border-t pt-6 bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    Feedback del Supervisore
                </h2>
                <div className="prose max-w-none text-gray-700">
                  {renderMarkdown(feedback)}
                </div>
                <div className="mt-8 text-center">
                  <button onClick={setNewScenario} className="bg-amber-500 text-white px-8 py-3 rounded-full font-semibold transition-all hover:bg-amber-600 shadow-md">
                    Prossimo Scenario
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    );
};

export default EgoStatesTool;
