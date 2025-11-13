import React, { useState, useEffect } from 'react';

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

type VissiTrap = 'Valutare' | 'Interpretare' | 'Soluzionare' | 'Sostenere' | 'Investigare';

const VISSI_TYPES: Record<VissiTrap, { description: string }> = {
    'Valutare': { description: "Esprimere giudizi di valore (es. 'Hai fatto bene', 'Non dovresti...')." },
    'Interpretare': { description: "Spiegare al cliente il 'vero' significato dei suoi pensieri (es. 'Questo significa che...')." },
    'Soluzionare': { description: "Dare consigli o suggerire soluzioni (es. 'Dovresti provare a...')." },
    'Sostenere': { description: "Offrire rassicurazioni premature o minimizzare (es. 'Vedrai che andrà tutto bene')." },
    'Investigare': { description: "Fare domande per raccogliere dati invece di esplorare il vissuto (es. 'Da quanto tempo...?')." }
};

const DIALOGUES: { id: number; client: string; counselor: string; trap: VissiTrap; explanation: string }[] = [
    { id: 1, client: "Non ce la faccio più, il mio capo mi sta rendendo la vita impossibile.", counselor: "Secondo me dovresti parlargli chiaramente e, se non cambia nulla, iniziare a mandare curriculum altrove.", trap: 'Soluzionare', explanation: "Il counselor offre due soluzioni dirette invece di esplorare il vissuto di 'non farcela più' del cliente." },
    { id: 2, client: "Ho litigato di nuovo con mia sorella. Non ci parliamo da una settimana.", counselor: "Non ti preoccupare, siete sorelle, vedrai che si sistemerà tutto come sempre.", trap: 'Sostenere', explanation: "Il counselor minimizza il problema e offre una rassicurazione generica, chiudendo lo spazio all'esplorazione del dolore del cliente." },
    { id: 3, client: "Mi sento bloccato, come se non stessi andando da nessuna parte nella mia vita.", counselor: "Questo accade perché hai una profonda paura del fallimento che ti paralizza.", trap: 'Interpretare', explanation: "Il counselor offre una spiegazione psicologica del comportamento del cliente, invece di aiutarlo a esplorare la sua sensazione di essere 'bloccato'." },
    { id: 4, client: "Ho deciso di lasciare il mio lavoro per inseguire la mia passione per la pittura.", counselor: "Hai fatto benissimo! È una scelta coraggiosa e giusta per te.", trap: 'Valutare', explanation: "Il counselor esprime un giudizio di valore positivo ('hai fatto benissimo'), che, sebbene di supporto, lo pone in una posizione di superiorità e blocca l'esplorazione di eventuali ambivalenze del cliente." },
    { id: 5, client: "Questa settimana mi sono sentito molto ansioso.", counselor: "E quando hai iniziato a sentirti così? Ti è successo qualcosa di particolare martedì?", trap: 'Investigare', explanation: "Il counselor si focalizza sulla raccolta di dati e fatti ('quando?', 'cosa?'), spostando l'attenzione dall'esperienza soggettiva dell'ansia a una cronaca degli eventi." },
    { id: 6, client: "Sono indeciso se accettare o meno questa nuova offerta di lavoro.", counselor: "Non pensarci troppo. A volte bisogna solo buttarsi e vedere come va.", trap: 'Sostenere', explanation: "Il counselor offre un incoraggiamento che minimizza la complessità della decisione del cliente, spingendolo all'azione senza esplorare i suoi dubbi." },
    { id: 7, client: "Credo che il mio partner non mi ami più.", counselor: "Perché non provi a organizzare una cena romantica per riaccendere la fiamma?", trap: 'Soluzionare', explanation: "Il counselor propone una soluzione pratica a un problema emotivo complesso, ignorando la necessità del cliente di esprimere e comprendere il suo dolore." }
];

interface VissiToolProps {
  onGoHome: () => void;
  onExerciseComplete: () => void;
}

const VissiTool: React.FC<VissiToolProps> = ({ onGoHome, onExerciseComplete }) => {
    const [dialogue, setDialogue] = useState(DIALOGUES[0]);
    const [userSelection, setUserSelection] = useState<VissiTrap | null>(null);
    const [userExplanation, setUserExplanation] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showAnswer, setShowAnswer] = useState(false);

    const setNewDialogue = () => {
        setUserSelection(null);
        setUserExplanation('');
        setFeedback('');
        setError('');
        setShowAnswer(false);

        let newDialogue;
        do {
            newDialogue = DIALOGUES[Math.floor(Math.random() * DIALOGUES.length)];
        } while (newDialogue.id === dialogue.id);
        setDialogue(newDialogue);
    };

    useEffect(() => {
        setNewDialogue();
    }, []);

    const handleGenerateFeedback = async () => {
        if (!userSelection) {
            setError("Per favore, seleziona una trappola del VISSI.");
            return;
        }
        if (!userExplanation.trim()) {
            setError("Per favore, spiega brevemente il perché della tua scelta.");
            return;
        }

        setIsLoading(true);
        setError('');
        setFeedback('');

        const prompt = `Sei un supervisore di counseling esperto, specializzato nell'identificazione delle "risposte trappola" del VISSI. Il tuo compito è valutare l'analisi di uno studente.

**Contesto:**
- **Dialogo Cliente-Counselor:**
  - Cliente: "${dialogue.client}"
  - Counselor: "${dialogue.counselor}"
- **Risposta Corretta:** La trappola è **${dialogue.trap}**, perché ${dialogue.explanation}.

**Analisi dello Studente:**
- **Trappola Selezionata:** ${userSelection}
- **Motivazione dello Studente:** "${userExplanation}"

**Istruzioni per il Feedback:**
Fornisci un'analisi concisa e costruttiva in formato Markdown, strutturata come segue (usa ** per i titoli):

**Valutazione:**
Inizia dicendo chiaramente se l'identificazione della trappola da parte dello studente è **Corretta** o **Non Corretta**.

**Analisi della Motivazione:**
Valuta la spiegazione dello studente. Ha colto il punto centrale? La sua argomentazione è solida? Sii specifico. (Es. "La tua spiegazione coglie perfettamente il punto..." oppure "Nella tua spiegazione ti sei concentrato su un aspetto secondario...").

**Spiegazione Approfondita:**
Fornisci una spiegazione chiara e didattica del perché la risposta del counselor è un esempio della trappola **${dialogue.trap}**. Usa la spiegazione fornita nel contesto come base.

**Esempio di Riformulazione Efficace:**
Offri un esempio concreto di come il counselor avrebbe potuto rispondere in modo più efficace, senza cadere in trappola. (Es. "Un'alternativa più efficace sarebbe stata una riformulazione come: 'Sentirti rendere la vita impossibile dal tuo capo deve essere davvero pesante.'").

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
            setShowAnswer(true);
            onExerciseComplete();
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
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <button onClick={onGoHome} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold mb-8 transition-colors">
                    <ArrowLeftIcon />
                    Torna al menu principale
                </button>

                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Esercizio: Riconosci le Trappole del VISSI</h1>
                    <p className="text-gray-600 mb-6">Leggi il dialogo, identifica la risposta trappola del counselor e spiega perché.</p>
                    
                    <div className="relative bg-gray-50 border rounded-lg p-4 mb-6">
                        <p className="font-semibold text-gray-600">Cliente:</p>
                        <p className="text-lg italic text-gray-800">"{dialogue.client}"</p>
                        <p className="font-semibold text-gray-600 mt-3">Counselor:</p>
                        <p className="text-lg italic text-sky-800">"{dialogue.counselor}"</p>
                        <button onClick={setNewDialogue} disabled={isLoading} className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors text-gray-500 disabled:opacity-50" title="Nuovo Dialogo"><RefreshIcon /></button>
                    </div>

                    {!feedback && (
                        <>
                            <div className="mb-4">
                                <h2 className="block text-md font-semibold text-gray-700 mb-3">1. Quale trappola del VISSI riconosci in questa risposta?</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {(Object.keys(VISSI_TYPES) as VissiTrap[]).map(trap => (
                                        <button key={trap} onClick={() => setUserSelection(trap)} className={`p-3 rounded-lg border-2 text-left transition-all duration-200 ${userSelection === trap ? 'bg-sky-100 border-sky-500 ring-2 ring-sky-300' : 'bg-white border-gray-300 hover:border-sky-400'}`}>
                                            <p className="font-bold text-gray-800">{trap}</p>
                                            <p className="text-sm text-gray-600">{VISSI_TYPES[trap].description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="user-explanation" className="block text-md font-semibold text-gray-700 mb-2">2. Spiega brevemente il perché:</label>
                                <textarea id="user-explanation" rows={3} value={userExplanation} onChange={(e) => setUserExplanation(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition shadow-sm" placeholder="Es. Perché offre una soluzione invece di esplorare..." />
                            </div>
                            
                            {error && <p className="text-red-600 mt-2 text-center">{error}</p>}
                            
                            <div className="mt-6 text-center">
                                <button onClick={handleGenerateFeedback} disabled={isLoading} className="bg-sky-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 ease-in-out hover:bg-sky-700 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    {isLoading ? 'Analisi in corso...' : 'Valuta la mia Analisi'}
                                </button>
                            </div>
                        </>
                    )}

                    {isLoading && <div className="mt-8"><LoadingSpinner /></div>}
                    
                    {feedback && (
                        <div className="mt-8 border-t pt-6">
                            {showAnswer && (
                                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg mb-6">
                                    <h3 className="font-bold text-amber-900">Risposta Corretta: {dialogue.trap}</h3>
                                    <p className="text-amber-800">{dialogue.explanation}</p>
                                </div>
                            )}
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Feedback del Supervisore AI</h2>
                            <div className="bg-gray-50 rounded-lg p-4 text-gray-700 prose max-w-none">
                                {renderMarkdown(feedback)}
                            </div>
                            <div className="mt-6 text-center">
                                <button onClick={setNewDialogue} className="bg-amber-500 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 ease-in-out hover:bg-amber-600 shadow-md hover:shadow-lg">
                                    Prossimo Dialogo
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

export default VissiTool;