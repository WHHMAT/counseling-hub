import React, { useState, useEffect } from 'react';
import { useUserData } from '../hooks/useUserData';
import { db } from '../firebase';
import firebase from '../firebase';

const TOOL_ID = 'rapport-pacing';

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

const CLIENT_SITUATIONS = [
    { sentence: "Vedo un futuro nero, non riesco a immaginare come le cose possano migliorare.", cue: "detto a bassa voce, con le spalle curve." },
    { sentence: "Sento un peso enorme sulle spalle, è come se portassi il mondo intero.", cue: "accompagnato da un profondo sospiro." },
    { sentence: "La sua voce continua a rimbombarmi in testa, non riesco a smettere di pensare a quello che mi ha detto.", cue: "portandosi una mano alla tempia." },
    { sentence: "Ho l'amaro in bocca per come sono andate le cose, è una sensazione terribile.", cue: "con un'espressione facciale disgustata." },
    { sentence: "C'è una puzza di bruciato in questa situazione, qualcosa non mi torna.", cue: "arricciando il naso." },
    { sentence: "Tutti mi dicono di guardare il lato positivo, ma per me è tutto sfocato e confuso.", cue: "socchiudendo gli occhi come per mettere a fuoco." },
    { sentence: "Mi sento freddo e distaccato da tutti, come se fossi dietro un vetro.", cue: "stringendosi nelle braccia come per proteggersi." },
    { sentence: "È un labirinto senza uscita, ogni strada che provo mi riporta al punto di partenza.", cue: "muovendo le mani in modo agitato e inconcludente." },
    { sentence: "Le sue parole sono state musica per le mie orecchie, finalmente qualcuno che capisce.", cue: "con un sorriso che illumina il viso." },
    { sentence: "Questa decisione mi lascia una sensazione di vuoto dentro, un buco nello stomaco.", cue: "poggiando una mano sulla pancia." }
];

interface RapportToolProps {
  onGoHome: () => void;
  onExerciseComplete: (points: number, toolId: string, exerciseId: string) => void;
  userData: ReturnType<typeof useUserData>['userData'];
}

const RapportTool: React.FC<RapportToolProps> = ({ onGoHome, onExerciseComplete, userData }) => {
    const [clientSituation, setClientSituation] = useState<{ sentence: string; cue: string } | null>(null);
    const [studentResponse, setStudentResponse] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showResetMessage, setShowResetMessage] = useState(false);

    useEffect(() => {
        setNewSituation();
    }, [userData]);

    const resetUserProgressForTool = async () => {
        if (userData && firebase.auth().currentUser) {
            const userRef = db.collection('users').doc(firebase.auth().currentUser.uid);
            await userRef.update({
                [`completedExercises.${TOOL_ID}`]: []
            });
        }
    };

    const setNewSituation = async () => {
        setFeedback('');
        setStudentResponse('');
        setError('');

        const completedSituations = userData?.completedExercises?.[TOOL_ID] as string[] || [];
        let availableSituations = CLIENT_SITUATIONS.filter(s => !completedSituations.includes(s.sentence));

        if (availableSituations.length === 0 && CLIENT_SITUATIONS.length > 0) {
            setShowResetMessage(true);
            setTimeout(() => setShowResetMessage(false), 4000);
            await resetUserProgressForTool();
            availableSituations = CLIENT_SITUATIONS;
        }
        
        if (availableSituations.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableSituations.length);
            setClientSituation(availableSituations[randomIndex]);
        } else {
            setClientSituation({ sentence: "Nessuna situazione disponibile.", cue: "" });
        }
    };

    const handleGenerateFeedback = async () => {
        if (!studentResponse.trim() || !clientSituation) {
            setError("Per favore, inserisci la tua risposta.");
            return;
        }
        setIsLoading(true);
        setError('');
        setFeedback('');

        try {
            const prompt = `Sei un formatore esperto di PNL (Programmazione Neuro-Linguistica) e counseling, specializzato nell'insegnare la tecnica del "ricalco" (pacing/mirroring) per costruire il rapport.

Il tuo compito è analizzare e valutare la risposta di uno studente di counseling alla frase di un cliente, fornendo un feedback costruttivo.

Considera i seguenti elementi:
- La frase verbale del cliente.
- Il dettaglio non verbale/para-verbale fornito.
- La risposta dello studente.

Valuta la risposta dello studente in base alla sua capacità di ricalcare il cliente su più livelli:
- **Verbale:** Ha usato parole chiave o predicati del sistema rappresentazionale del cliente (VAK)?
- **Para-verbale:** La sua risposta suggerisce un tono/ritmo/volume che si sintonizza con quello ipotizzato del cliente?
- **Non Verbale:** La sua risposta riconosce o si allinea con la postura/gestualità/respiro descritto?
- **Valori/Credenze e Situazionale:** La risposta valida l'esperienza del cliente o si connette a un livello più profondo?

Fornisci il feedback in formato Markdown, strutturato come segue (usa ** per i titoli):

**Valutazione Generale:**
Un commento sintetico sull'efficacia complessiva della risposta nel costruire rapport. (Es: "Ottimo ricalco su più livelli", "Buon ricalco verbale, ma si può migliorare sul non verbale", "Efficace, ma attento a non scivolare nel sostegno").

**Cosa ha funzionato bene:**
Elenca 1-2 punti di forza specifici. Spiega *perché* hanno funzionato. (Es: "Hai colto e utilizzato la parola chiave 'nero', mantenendo il focus sull'esperienza visiva del cliente.").

**Aree di Miglioramento:**
Identifica 1-2 aspetti che potrebbero essere migliorati. Sii specifico e costruttivo. (Es: "La tua risposta non ha ancora agganciato il dettaglio para-verbale della 'voce bassa'. Provare a modularla avrebbe potuto aumentare la connessione.").

**Suggerimenti Pratici:**
Offri 1-2 esempi alternativi di risposta che integrino più livelli di ricalco, spiegando brevemente la strategia. (Es: "Un'alternativa potrebbe essere: '(Abbassando leggermente il tono di voce) Quando vedi tutto così nero... dev'essere davvero pesante.' Questo ricalca sia il verbale ('nero') che il para-verbale ('voce bassa').").

**Punteggio:**
Assegna un punteggio numerico: 10 per un ricalco eccellente su più livelli; 5 per un buon ricalco verbale che però tralascia il non verbale/para-verbale, o viceversa; 0 se la risposta non è un ricalco ma cade in una trappola (es. soluzione, giudizio).

---
**Situazione del Cliente:**
- **Frase:** "${clientSituation.sentence}"
- **Dettaglio non verbale/para-verbale:** "${clientSituation.cue}"
---
**Risposta dello Studente:** "${studentResponse}"
---`;

            const res = await fetch('/.netlify/functions/generateFeedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || `Errore del server: ${res.status}`);
            }

            setFeedback(data.feedback);

            const scoreMatch = data.feedback.match(/\*\*Punteggio:\*\*\s*(\d+)/);
            const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
            
            onExerciseComplete(score, TOOL_ID, clientSituation.sentence);

        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : "Si è verificato un errore sconosciuto. Riprova.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const renderMarkdown = (text: string) => {
        const lines = text.split('\n');
        const renderedLines = [];
        let listBuffer: string[] = [];
    
        const flushList = (keyPrefix: string) => {
            if (listBuffer.length > 0) {
                renderedLines.push(
                    <ul key={keyPrefix} className="list-disc list-inside space-y-1 pl-2">
                        {listBuffer.map((item, idx) => <li key={`${keyPrefix}-${idx}`}>{item}</li>)}
                    </ul>
                );
                listBuffer = [];
            }
        };
    
        lines.forEach((line, index) => {
            if (line.startsWith('**') && line.endsWith('**')) {
                flushList(`list-before-header-${index}`);
                renderedLines.push(<h3 key={`header-${index}`} className="text-lg font-bold text-gray-800 mt-4 mb-2">{line.replace(/\*\*/g, '')}</h3>);
            } else if (line.match(/^\d+\.\s/) || line.startsWith('* ') || line.startsWith('- ')) {
                listBuffer.push(line.replace(/^\d+\.\s|^\*\s|^-\s/, ''));
            } else if (line.trim() === '') {
                flushList(`list-before-space-${index}`);
                renderedLines.push(<div key={`space-${index}`} className="h-2" />);
            } else {
                flushList(`list-before-p-${index}`);
                renderedLines.push(<p key={`p-${index}`} className="mb-2">{line}</p>);
            }
        });
    
        flushList('final-list');
        return renderedLines;
    };
    

    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <button onClick={onGoHome} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold mb-8 transition-colors">
                    <ArrowLeftIcon />
                    Torna al menu principale
                </button>

                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Esercizio di Rapport: Ricalco e Rispecchiamento</h1>
                    <p className="text-gray-600 mb-6">Analizza la frase del cliente, includendo il dettaglio non verbale, e scrivi una risposta per costruire il rapport.</p>
                    
                    {showResetMessage && (
                        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-r-lg" role="alert">
                            <p>Complimenti, hai completato tutte le situazioni! Ora te le riproporremo per continuare a esercitarti.</p>
                        </div>
                    )}

                    {clientSituation && (
                        <div className="relative bg-sky-50 border-l-4 border-sky-500 text-sky-800 p-4 rounded-r-lg mb-6">
                            <p className="font-semibold">Frase del Cliente:</p>
                            <p className="text-lg italic">"{clientSituation.sentence}"</p>
                            <p className="text-md text-sky-700 mt-2">({clientSituation.cue})</p>

                            <button
                                onClick={setNewSituation}
                                disabled={isLoading}
                                className="absolute top-1/2 right-4 -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors text-gray-600 disabled:bg-gray-200 disabled:cursor-not-allowed"
                                aria-label="Genera una nuova frase"
                                title="Genera una nuova frase"
                            >
                                <RefreshIcon />
                            </button>
                        </div>
                    )}
                    
                    <div>
                        <label htmlFor="student-response" className="block text-md font-semibold text-gray-700 mb-2">La tua Risposta (prova a ricalcare):</label>
                        <textarea
                            id="student-response"
                            rows={4}
                            value={studentResponse}
                            onChange={(e) => setStudentResponse(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition shadow-sm"
                            placeholder="Scrivi qui la tua risposta..."
                            aria-label="La tua Risposta"
                        />
                    </div>


                    {error && <p className="text-red-600 mt-4 text-center">{error}</p>}

                    <div className="mt-6 text-center">
                        <button
                            onClick={handleGenerateFeedback}
                            disabled={isLoading || !studentResponse}
                            className="bg-sky-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 ease-in-out hover:bg-sky-700 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Analisi in corso...' : 'Valuta la mia Risposta'}
                        </button>
                    </div>

                    {isLoading && <div className="mt-8"><LoadingSpinner /></div>}

                    {feedback && (
                        <div className="mt-8 border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Feedback del Supervisore AI</h2>
                            <div className="bg-gray-50 rounded-lg p-4 text-gray-700 prose max-w-none">
                                {renderMarkdown(feedback)}
                            </div>
                            <div className="mt-6 text-center">
                                <button
                                    onClick={setNewSituation}
                                    className="bg-amber-500 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 ease-in-out hover:bg-amber-600 shadow-md hover:shadow-lg"
                                >
                                    Prossima Situazione
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <footer className="text-center py-8 mt-12">
                    <p className="text-gray-500">&copy; {new Date().getFullYear()} Hub Competenze Counseling. Tutti i diritti riservati.</p>
                </footer>
            </div>
        </div>
    );
};

export default RapportTool;
