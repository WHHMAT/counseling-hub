import React, { useState, useEffect } from 'react';
import { useUserData } from '../hooks/useUserData';
import { db } from '../firebase';
import firebase from '../firebase';

const TOOL_ID = 'phenomenological-feedback';

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
        text: "Da quando ho iniziato questo nuovo progetto, mi sento come se stessi annegando. Le email non smettono mai di arrivare, il telefono squilla in continuazione. Tutti si aspettano che io abbia la risposta a tutto, subito. Ho provato a parlarne con il mio partner, ma minimizza, dice che è solo stress. Ma non è solo stress, è... un peso che mi schiaccia. Non riesco più a dormire bene, mi sveglio di soprassalto pensando a qualche scadenza che ho dimenticato. Vorrei solo che tutto si fermasse, anche solo per un giorno, per poter respirare.",
        cues: "Mentre parla, si stringe le braccia attorno al petto e il suo sguardo si fissa su un punto vuoto sul pavimento."
    },
    {
        id: 2,
        text: "Abbiamo deciso di separarci. È stata una decisione comune, entrambi pensiamo sia la cosa migliore. Sulla carta ha tutto senso, non litigavamo più, eravamo diventati due estranei. Eppure, non riesco a smettere di piangere. La casa sembra così vuota, ogni oggetto mi ricorda qualcosa di lui. Mi dico che devo essere forte, che passerà, ma poi mi ritrovo a fissare il telefono sperando che chiami. Mi sento stupida, dovrei essere sollevata e invece mi sento solo persa. Non so più chi sono senza di lui.",
        cues: "Parla con un tono di voce uniforme e le sue mani, che tremano leggermente, stringono e piegano un fazzoletto di carta."
    },
    {
        id: 3,
        text: "Mio figlio adolescente non mi parla più. O meglio, risponde a monosillabi. 'Come è andata a scuola?' 'Bene'. 'Cosa hai fatto oggi?' 'Niente'. Prima eravamo così legati, mi raccontava tutto. Ora sembra che io sia diventato il nemico. Ogni cosa che dico è sbagliata, ogni domanda è un'intrusione. L'altro giorno ho provato ad abbracciarlo e si è irrigidito, si è scostato come se lo avessi scottato. Mi manca il mio bambino, e ho una paura tremenda di aver sbagliato tutto come genitore, di averlo perso per sempre.",
        cues: "Mantiene una postura eretta e sulle sue labbra c'è un leggero sorriso mentre racconta."
    }
];

interface PhenomenologicalFeedbackToolProps {
  onGoHome: () => void;
  onExerciseComplete: (points: number, toolId: string, exerciseId: number) => void;
  userData: ReturnType<typeof useUserData>['userData'];
}

const PhenomenologicalFeedbackTool: React.FC<PhenomenologicalFeedbackToolProps> = ({ onGoHome, onExerciseComplete, userData }) => {
    const [scenario, setScenario] = useState(SCENARIOS[0]);
    const [seenHeard, setSeenHeard] = useState('');
    const [thought, setThought] = useState('');
    const [felt, setFelt] = useState('');
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
        setSeenHeard('');
        setThought('');
        setFelt('');
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
            setScenario({ id: 0, text: "Nessuno scenario disponibile.", cues: "" });
        }
    };

    useEffect(() => {
        setNewScenario();
    }, [userData]);

    const handleGenerateFeedback = async () => {
        if (!seenHeard.trim() || !thought.trim() || !felt.trim()) {
            setError("Per favore, compila tutti e tre i campi del feedback.");
            return;
        }
        setIsLoading(true);
        setError('');
        setFeedback('');

        const prompt = `Sei un supervisore esperto di counseling fenomenologico. Il tuo compito è valutare il feedback di uno studente basato su uno scenario.

Il feedback fenomenologico si basa su tre pilastri:
1.  **Visto/Sentito (Dati):** Descrizione oggettiva, non interpretativa, di ciò che il cliente ha detto o fatto. Deve essere fattuale. Evita giudizi (es. "hai detto con voce triste").
2.  **Pensato (Condivisione):** Condivisione di un pensiero o un'ipotesi del counselor, presentata chiaramente come propria ("ho pensato che...") per offrire uno spunto di riflessione, senza affermare che sia la verità oggettiva del cliente.
3.  **Provato (Sentimenti):** Espressione di un'emozione autentica provata dal counselor ("ascoltandoti, ho provato..."). Deve essere un sentimento, non un pensiero mascherato da sentimento.

**Scenario del Cliente:**
- **Racconto:** "${scenario.text}"
- **Atteggiamenti non verbali:** "${scenario.cues}"

**Feedback dello Studente:**
- **Ciò che ha visto/sentito:** "${seenHeard}"
- **Ciò che ha pensato:** "${thought}"
- **Ciò che ha provato:** "${felt}"

**Istruzioni per il Feedback:**
Fornisci un'analisi costruttiva in formato Markdown, strutturata come segue (usa ** per i titoli):

**Valutazione Generale:**
Una sintesi sull'efficacia complessiva del feedback dello studente nel promuovere la consapevolezza.

**Analisi "Visto/Sentito":**
Valuta se la descrizione è puramente oggettiva. Lo studente ha riportato solo dati di fatto senza aggiungere interpretazioni o giudizi?

**Analisi "Pensato":**
Valuta se lo studente ha presentato il suo pensiero come un'ipotesi personale (usando "io ho pensato...") e non come una verità assoluta sul cliente. Lo spunto offerto apre alla riflessione o la chiude con un'interpretazione?

**Analisi "Provato":**
Valuta se lo studente ha espresso un'emozione genuina e se l'ha "posseduta" (usando "io ho provato..."). È un sentimento reale o un pensiero (es. "sento che...")?

**Suggerimento Migliorativo:**
Offri un esempio concreto e conciso di come una delle tre parti avrebbe potuto essere formulata in modo ancora più efficace e aderente ai principi.

**Punteggio:**
Assegna un punteggio numerico: 10 se tutti e tre i pilastri sono formulati in modo eccellente e fenomenologico; 5 se uno o due pilastri sono ben formulati ma uno contiene interpretazioni o giudizi; 0 se il feedback è prevalentemente interpretativo o giudicante.

---`;

        try {
            const res = await fetch('/.netlify/functions/generateFeedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || `Errore del server: ${res.status}`);
            }

            setFeedback(data.feedback);
            
            const scoreMatch = data.feedback.match(/\*\*Punteggio:\*\*\s*(\d+)/);
            const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
            
            onExerciseComplete(score, TOOL_ID, scenario.id);
        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : "Si è verificato un errore sconosciuto. Riprova.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderMarkdown = (text: string) => {
        return text.split('\n').map((line, index) => {
            if (line.startsWith('**') && line.endsWith('**')) {
                return <h3 key={index} className="text-lg font-bold text-gray-800 mt-4 mb-2">{line.replace(/\*\*/g, '')}</h3>;
            }
            return <p key={index} className="mb-2">{line}</p>;
        });
    };

    return (
        <div className="bg-gray-50 min-h-screen pt-20 pb-12 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <button onClick={onGoHome} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold mb-8 transition-colors">
                    <ArrowLeftIcon />
                    Torna al menu principale
                </button>

                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Pratica di Feedback Fenomenologico</h1>
                    <p className="text-gray-600 mb-6">Leggi lo scenario e formula un feedback basato sui tre pilastri: dati, pensieri e sentimenti.</p>

                    {showResetMessage && (
                        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-r-lg" role="alert">
                            <p>Complimenti, hai completato tutti gli scenari! Ora te li riproporremo per continuare a esercitarti.</p>
                        </div>
                    )}
                    
                    <div className="relative bg-sky-50 border-l-4 border-sky-500 text-sky-800 p-4 rounded-r-lg mb-6">
                        <p className="font-semibold">Scenario del Cliente:</p>
                        <p className="italic">"{scenario.text}"</p>
                        <p className="mt-3 font-semibold">Atteggiamenti non verbali:</p>
                        <p className="italic">{scenario.cues}</p>
                        <button onClick={setNewScenario} disabled={isLoading} className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors text-gray-500 disabled:opacity-50" title="Nuovo Scenario"><RefreshIcon /></button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label htmlFor="seen-heard" className="block text-md font-bold text-gray-700 mb-2">1. Ciò che hai visto o sentito (Dati)</label>
                            <textarea id="seen-heard" rows={3} value={seenHeard} onChange={(e) => setSeenHeard(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition shadow-sm" placeholder="Es. Ti ho sentito dire che ti senti come se stessi annegando e ho notato che ti stringevi le braccia..."></textarea>
                        </div>
                        <div>
                            <label htmlFor="thought" className="block text-md font-bold text-gray-700 mb-2">2. Ciò che ho pensato (Condivisione)</label>
                            <textarea id="thought" rows={3} value={thought} onChange={(e) => setThought(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition shadow-sm" placeholder="Es. Ho pensato che forse ti senti come se avessi perso il controllo..."></textarea>
                        </div>
                        <div>
                            <label htmlFor="felt" className="block text-md font-bold text-gray-700 mb-2">3. Ciò che hai provato (Sentimenti)</label>
                            <textarea id="felt" rows={3} value={felt} onChange={(e) => setFelt(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition shadow-sm" placeholder="Es. Ascoltandoti ho provato un senso di pesantezza/tristezza..."></textarea>
                        </div>
                    </div>
                    
                    {error && <p className="text-red-600 mt-4 text-center">{error}</p>}

                    <div className="mt-8 text-center">
                        <button onClick={handleGenerateFeedback} disabled={isLoading} className="bg-sky-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 ease-in-out hover:bg-sky-700 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {isLoading ? 'Analisi in corso...' : 'Valuta il mio Feedback'}
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
                                <button onClick={setNewScenario} className="bg-amber-500 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 ease-in-out hover:bg-amber-600 shadow-md hover:shadow-lg">
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

export default PhenomenologicalFeedbackTool;
