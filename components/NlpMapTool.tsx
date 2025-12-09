import React, { useState, useEffect } from 'react';
import { useUserData } from '../hooks/useUserData';
import { db } from '../firebase';
import firebase from '../firebase';

const TOOL_ID = 'nlp-client-map';

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
    {
        id: 1,
        text: "È sempre la stessa storia. Al lavoro, non ne va mai bene una. Il mio capo mi ha dato un altro progetto e so già che sarà un disastro. Devo essere perfetto, ogni singolo dettaglio deve essere impeccabile, altrimenti penserà che sono un incapace. L'ultima volta, ho fatto un piccolo errore in una slide e mi sono sentito morire. Ho pensato: 'Ecco, ora tutti sanno che sono un fallimento'. È ovvio che non sono portato per questo ruolo. La gente non capisce la pressione che sento. Tutti gli altri sembrano così tranquilli, solo io mi sento così. È impossibile andare avanti in questo modo. Non posso continuare a sentirmi così male."
    },
    {
        id: 2,
        text: "La mia relazione è un punto morto. Lui non mi ascolta mai. Ogni volta che provo a parlargli, so esattamente cosa sta pensando: 'ecco che ricomincia'. È inutile. L'altra sera volevo solo un po' di supporto, e lui se n'è uscito con una soluzione stupida. Mi ha fatto sentire invisibile. Ovviamente, questo significa che non gli importa più di me. Gli uomini sono tutti uguali, non si preoccupano dei sentimenti. Sono infelice. Non dovrei sentirmi così sola in una relazione. C'è una mancanza di connessione e questo mi distrugge."
    },
    {
        id: 3,
        text: "Tutti alla mia età hanno già capito cosa fare della loro vita. Hanno carriere avviate, famiglie... io invece sono qui. Non posso prendere una decisione. Ogni scelta sembra quella sbagliata. Se provo a fare qualcosa di nuovo, il risultato è sempre deludente. L'iscrizione a quel corso è stata una perdita di tempo. Mi rende ansioso pensare al futuro. Non si può avere successo se si parte così indietro. È necessario avere le idee chiare fin da subito, e io non le ho. Questo mi fa sentire bloccato."
    }
];

interface NlpMapToolProps {
  onGoHome: () => void;
  onExerciseComplete: (scenarioId: number) => void;
  userData: ReturnType<typeof useUserData>['userData'];
}

const NlpMapTool: React.FC<NlpMapToolProps> = ({ onGoHome, onExerciseComplete, userData }) => {
    const [scenario, setScenario] = useState(SCENARIOS[0]);
    const [deletions, setDeletions] = useState('');
    const [generalizations, setGeneralizations] = useState('');
    const [distortions, setDistortions] = useState('');
    const [summary, setSummary] = useState('');
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
        setDeletions('');
        setGeneralizations('');
        setDistortions('');
        setSummary('');
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

    useEffect(() => {
        setNewScenario();
    }, [userData]);

    const handleGenerateFeedback = async () => {
        if (!deletions.trim() && !generalizations.trim() && !distortions.trim()) {
            setError("Per favore, compila almeno uno dei campi di analisi (cancellazioni, generalizzazioni, deformazioni).");
            return;
        }
        if (!summary.trim()) {
            setError("Per favore, scrivi una descrizione generale della mappa del cliente.");
            return;
        }
        setIsLoading(true);
        setError('');
        setFeedback('');

        const prompt = `Sei un supervisore di counseling e un Master Practitioner di PNL. Il tuo compito è valutare l'analisi di uno studente basata sul Metamodello della PNL.

**Testo del Cliente:**
"${scenario.text}"

**Analisi dello Studente:**
- **Cancellazioni Rilevate:** "${deletions}"
- **Generalizzazioni Rilevate:** "${generalizations}"
- **Deformazioni Rilevate:** "${distortions}"
- **Descrizione Generale della Mappa del Cliente:** "${summary}"

**Istruzioni per il Feedback:**
Fornisci un'analisi costruttiva in formato Markdown, strutturata come segue (usa ** per i titoli):

**Valutazione Generale:**
Una sintesi sull'efficacia complessiva dell'analisi dello studente.

**Analisi delle Violazioni del Metamodello:**
Per ognuna delle tre categorie (Cancellazioni, Generalizzazioni, Deformazioni):
- **Esempi Corretti:** Conferma gli esempi che lo studente ha identificato correttamente.
- **Esempi Mancanti o Imprecisi:** Indica gentilmente 1-2 esempi chiave presenti nel testo che sono stati tralasciati o classificati in modo errato, spiegando brevemente perché appartengono a quella categoria.

**Valutazione della Mappa del Cliente:**
Valuta la qualità della descrizione generale. Lo studente ha colto le credenze limitanti, i valori e le regole del mondo del cliente? La sintesi è coerente con le violazioni identificate?

**Domande Potenti da Porre:**
Suggerisci 2-3 domande specifiche (basate sul Metamodello) che un counselor potrebbe usare per sfidare le violazioni linguistiche e aiutare il cliente ad arricchire la sua mappa. (Es. Per una generalizzazione come "tutti...", una domanda potrebbe essere "Tutti, senza eccezioni?").

**Punteggio:**
Assegna un punteggio numerico: 10 per un'analisi accurata e approfondita; 5 se l'analisi è parziale o contiene imprecisioni significative; 0 se l'analisi è superficiale o errata.
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
            onExerciseComplete(scenario.id);
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

    return (
      <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <button onClick={onGoHome} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold mb-8 transition-colors">
            <ArrowLeftIcon />
            Torna al menu principale
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">PNL - La Mappa del Cliente</h1>
            <p className="text-gray-600 mb-6">Leggi il testo del cliente, identifica le violazioni del Metamodello PNL e descrivi la sua "mappa del mondo".</p>

            {showResetMessage && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-r-lg" role="alert">
                <p>Complimenti, hai completato tutti gli scenari! Ora te li riproporremo per continuare a esercitarti.</p>
              </div>
            )}
            
            <div className="relative bg-sky-50 border-l-4 border-sky-500 text-sky-800 p-4 rounded-r-lg mb-6">
              <p className="font-semibold">Testo del Cliente:</p>
              <p className="italic whitespace-pre-wrap">"{scenario.text}"</p>
              <button onClick={setNewScenario} disabled={isLoading} className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors text-gray-500 disabled:opacity-50" title="Nuovo Scenario"><RefreshIcon /></button>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="deletions" className="block text-md font-bold text-gray-700 mb-2">1. Cancellazioni Rilevate</label>
                <textarea id="deletions" rows={3} value={deletions} onChange={(e) => setDeletions(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" placeholder="Elenca le frasi o parole dove mancano informazioni..."></textarea>
              </div>
              <div>
                <label htmlFor="generalizations" className="block text-md font-bold text-gray-700 mb-2">2. Generalizzazioni Rilevate</label>
                <textarea id="generalizations" rows={3} value={generalizations} onChange={(e) => setGeneralizations(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" placeholder="Elenca le frasi che contengono generalizzazioni universali (sempre, mai, tutti...)..."></textarea>
              </div>
              <div>
                <label htmlFor="distortions" className="block text-md font-bold text-gray-700 mb-2">3. Deformazioni Rilevate</label>
                <textarea id="distortions" rows={3} value={distortions} onChange={(e) => setDistortions(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" placeholder="Elenca le frasi che mostrano letture del pensiero, causa-effetto, ecc..."></textarea>
              </div>
              <div>
                <label htmlFor="summary" className="block text-md font-bold text-gray-700 mb-2">4. Descrizione Generale della Mappa del Cliente</label>
                <textarea id="summary" rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" placeholder="Basandoti sulla tua analisi, descrivi brevemente le credenze e le regole del mondo di questa persona..."></textarea>
              </div>
            </div>
            
            {error && <p className="text-red-600 mt-4 text-center">{error}</p>}

            <div className="mt-8 text-center">
              <button onClick={handleGenerateFeedback} disabled={isLoading} className="bg-sky-600 text-white px-8 py-3 rounded-full font-semibold transition-all hover:bg-sky-700 shadow-md hover:shadow-lg disabled:bg-gray-400">
                {isLoading ? 'Analisi in corso...' : 'Valuta la mia Analisi'}
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
                  <button onClick={setNewScenario} className="bg-amber-500 text-white px-8 py-3 rounded-full font-semibold transition-all hover:bg-amber-600 shadow-md">
                    Prossimo Scenario
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

export default NlpMapTool;
