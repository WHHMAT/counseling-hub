import React, { useState, useEffect, useRef } from 'react';

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

const SendIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
);


const CLIENT_SCENARIOS = [
    { id: 1, name: "Marco", goal: "vorrebbe essere meno stressato dal lavoro." },
    { id: 2, name: "Giulia", goal: "vorrebbe migliorare la sua autostima." },
    { id: 3, name: "Luca", goal: "vorrebbe iniziare a fare più attività fisica." },
    { id: 4, name: "Sara", goal: "vorrebbe migliorare la comunicazione con il suo partner." },
    { id: 5, name: "Davide", goal: "sente di procrastinare troppo e vorrebbe essere più produttivo." }
];

interface SmartGoalToolProps {
  onGoHome: () => void;
  onExerciseComplete: () => void;
}

interface ChatMessage {
    sender: 'user' | 'client';
    text: string;
}

const SmartGoalTool: React.FC<SmartGoalToolProps> = ({ onGoHome, onExerciseComplete }) => {
    const [mode, setMode] = useState<'self' | 'client' | null>(null);
    const [clientStep, setClientStep] = useState<'dialogue' | 'synthesis'>('dialogue');
    const [scenario, setScenario] = useState(CLIENT_SCENARIOS[0]);

    // State for goal fields
    const [objective, setObjective] = useState('');
    const [specific, setSpecific] = useState('');
    const [measurable, setMeasurable] = useState('');
    const [achievable, setAchievable] = useState('');
    const [relevant, setRelevant] = useState('');
    const [timeBound, setTimeBound] = useState('');

    // State for interactive dialogue
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [userMessage, setUserMessage] = useState('');
    const [isClientTyping, setIsClientTyping] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);


    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory, isClientTyping]);

    const resetFormState = () => {
        setObjective('');
        setSpecific('');
        setMeasurable('');
        setAchievable('');
        setRelevant('');
        setTimeBound('');
        setFeedback('');
        setError('');
        setChatHistory([]);
        setUserMessage('');
        setClientStep('dialogue');
    };

    const handleModeSelect = (selectedMode: 'self' | 'client') => {
        resetFormState();
        setMode(selectedMode);
        if (selectedMode === 'client') {
            setNewScenario();
        }
    };
    
    const handleBackToSelection = () => {
        setMode(null);
        resetFormState();
    }

    const setNewScenario = () => {
        resetFormState();
        let newScenario;
        do {
            newScenario = CLIENT_SCENARIOS[Math.floor(Math.random() * CLIENT_SCENARIOS.length)];
        } while (newScenario.id === scenario.id);
        setScenario(newScenario);
    };
    
    const handleSendMessage = async () => {
        if (!userMessage.trim()) return;

        const newHistory: ChatMessage[] = [...chatHistory, { sender: 'user', text: userMessage }];
        setChatHistory(newHistory);
        setUserMessage('');
        setIsClientTyping(true);

        const systemInstruction = `Sei ${scenario.name}, un cliente di counseling. Il tuo obiettivo iniziale è: "${scenario.goal}". Stai parlando con un counselor (l'utente) che ti sta aiutando a definire meglio il tuo obiettivo. Rispondi alle sue domande in modo collaborativo ma realistico. Non dare subito tutte le risposte, ma rifletti sulle domande che ti vengono poste. Parla in prima persona. Sii breve e naturale. L'intera cronologia della conversazione è qui sotto. La tua ultima risposta dovrebbe basarsi sull'ultima domanda dell'utente.`;

        const userContent = `Cronologia Chat:
${newHistory.map(msg => `${msg.sender === 'user' ? 'Counselor' : scenario.name}: ${msg.text}`).join('\n')}
Counselor: ${userMessage}
${scenario.name}:`;

        try {
            const res = await fetch('/.netlify/functions/generateFeedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ systemInstruction, userContent }),
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            setChatHistory(prev => [...prev, { sender: 'client', text: data.feedback }]);
        } catch (e) {
            console.error(e);
            setChatHistory(prev => [...prev, { sender: 'client', text: "Mi dispiace, non ho capito. Puoi riformulare?" }]);
        } finally {
            setIsClientTyping(false);
        }
    };


    const handleGenerateFeedback = async () => {
        if (!specific || !measurable || !achievable || !relevant || !timeBound) {
            setError("Per favore, compila tutti e cinque i campi S.M.A.R.T.");
            return;
        }
        setIsLoading(true);
        setError('');
        setFeedback('');

        let systemInstruction;
        let userContent;

        if (mode === 'self') {
            systemInstruction = `Sei un coach esperto nel definire obiettivi S.M.A.R.T. Valuta l'obiettivo definito dall'utente. Fornisci un feedback costruttivo in formato Markdown, strutturato come segue (usa ** per i titoli):
**Valutazione Generale:**
Un commento sintetico sulla qualità complessiva dell'obiettivo S.M.A.R.T.
**Analisi dei Criteri:**
- **Specifico:** Valuta se è chiaro cosa si vuole ottenere.
- **Misurabile:** Valuta se ci sono criteri concreti per misurare il successo.
- **Raggiungibile:** Valuta se l'obiettivo sembra realistico per la persona.
- **Rilevante:** Valuta se l'obiettivo è importante e allineato con altri scopi.
- **Temporizzato:** Valuta se c'è una scadenza chiara e definita.
Per ogni punto, sii specifico e costruttivo.
**Suggerimento Migliorativo:**
Offri un piccolo suggerimento per rendere uno dei punti ancora più forte.
**Riformulazione Finale:**
Proponi una frase unica e ben formata che integri tutti i punti S.M.A.R.T. in un obiettivo completo e motivante.`;
            userContent = `**Obiettivo Generale:** "${objective}"
**S (Specifico):** "${specific}"
**M (Misurabile):** "${measurable}"
**A (Raggiungibile - Achievable):** "${achievable}"
**R (Rilevante):** "${relevant}"
**T (Temporizzato - Time-bound):** "${timeBound}"`;
        } else { // mode === 'client'
             systemInstruction = `Sei un supervisore di counseling esperto. Lo studente ha condotto un dialogo con un cliente per aiutarlo a trasformare un obiettivo vago in uno S.M.A.R.T. Valuta sia il PROCESSO (il dialogo) sia il RISULTATO (la sintesi S.M.A.R.T.). Fornisci un feedback costruttivo in Markdown (usa ** per i titoli):

**Valutazione del Processo (Dialogo):**
Analizza la cronologia della chat. Le domande del counselor erano aperte, esplorative e centrate sul cliente? Ha guidato il cliente a riflettere o ha suggerito le risposte? Valuta la sua capacità di "maieutica".

**Valutazione del Risultato (Sintesi S.M.A.R.T.):**
Analizza la definizione S.M.A.R.T. proposta dallo studente.
- **Coerenza:** La sintesi riflette quanto emerso nel dialogo?
- **Specificità:** I campi S.M.A.R.T. sono ben definiti e basati sulle parole del cliente?
- **Centratura:** L'obiettivo finale è ancora del cliente o è diventato del counselor?

**Punti di Forza Complessivi:**
Evidenzia 1-2 cose che lo studente ha fatto particolarmente bene, sia nel dialogo che nella sintesi.

**Aree di Miglioramento:**
Suggerisci un aspetto chiave da migliorare. (Es: "Nel dialogo, prova a usare più domande che iniziano con 'Come' invece di 'Perché' per favorire l'esplorazione").

**Domanda di Supervisione:**
Concludi con una domanda aperta che stimoli la riflessione dello studente sul suo lavoro. (Es: "Qual è stata la domanda più difficile da porre durante il dialogo e perché?").`;
            userContent = `**Obiettivo Vago del Cliente:** "${scenario.name} ${scenario.goal}"
**Cronologia del Dialogo:**
${chatHistory.map(msg => `${msg.sender === 'user' ? 'Counselor' : scenario.name}: ${msg.text}`).join('\n')}

**Definizione S.M.A.R.T. Proposta dallo Studente:**
- **S (Specifico):** "${specific}"
- **M (Misurabile):** "${measurable}"
- **A (Raggiungibile - Achievable):** "${achievable}"
- **R (Rilevante):** "${relevant}"
- **T (Temporizzato - Time-bound):** "${timeBound}"`;
        }

        try {
            const res = await fetch('/.netlify/functions/generateFeedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ systemInstruction, userContent }),
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            setFeedback(data.feedback);
            onExerciseComplete();
        } catch (e) {
            console.error(e);
            setError("Si è verificato un errore durante la generazione del feedback. Riprova.");
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

    const renderSelectionScreen = () => (
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">Strumento Obiettivo S.M.A.R.T.</h1>
            <p className="text-gray-600 text-center mb-8">Scegli come vuoi esercitarti a definire obiettivi ben formati.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div onClick={() => handleModeSelect('self')} className="bg-sky-50 border-2 border-sky-200 rounded-xl p-6 text-center hover:border-sky-500 hover:bg-sky-100 cursor-pointer transition-all">
                    <h2 className="text-xl font-bold text-sky-800">Definisci un tuo obiettivo</h2>
                    <p className="text-gray-600 mt-2">Usa il modello S.M.A.R.T. per trasformare un tuo desiderio personale in un obiettivo concreto e ricevi un'analisi.</p>
                </div>
                <div onClick={() => handleModeSelect('client')} className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 text-center hover:border-amber-500 hover:bg-amber-100 cursor-pointer transition-all">
                    <h2 className="text-xl font-bold text-amber-800">Aiuta un cliente a definire un obiettivo</h2>
                    <p className="text-gray-600 mt-2">Esercitati nel ruolo di counselor con un dialogo interattivo per rendere S.M.A.R.T. l'obiettivo del cliente.</p>
                </div>
            </div>
        </div>
    );
    
     const renderClientDialogue = () => (
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
             <button onClick={handleBackToSelection} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold mb-6 text-sm transition-colors">
                <ArrowLeftIcon />
                Cambia modalità
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Dialogo con il Cliente</h1>
            <div className="relative bg-amber-50 border-l-4 border-amber-500 text-amber-900 p-4 rounded-r-lg mb-6">
                <p className="font-semibold">Obiettivo Vago del Cliente:</p>
                <p className="text-lg italic">"{scenario.name} {scenario.goal}"</p>
                <button onClick={setNewScenario} disabled={isLoading} className="absolute top-1/2 right-4 -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors text-gray-600 disabled:bg-gray-200" title="Nuovo Scenario"><RefreshIcon /></button>
            </div>

            <div ref={chatContainerRef} className="h-80 overflow-y-auto bg-gray-100 rounded-lg p-4 space-y-4 mb-4 border">
                 {chatHistory.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg ${msg.sender === 'user' ? 'bg-sky-600 text-white' : 'bg-white shadow-sm'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                 {isClientTyping && (
                    <div className="flex justify-start">
                        <div className="max-w-xs p-3 rounded-lg bg-white shadow-sm">
                            <div className="flex items-center space-x-1">
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    </div>
                 )}
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isClientTyping && handleSendMessage()}
                    className="flex-grow p-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-sky-500"
                    placeholder="Fai una domanda al cliente..."
                    disabled={isClientTyping}
                />
                <button onClick={handleSendMessage} disabled={isClientTyping || !userMessage} className="bg-sky-600 text-white p-3 rounded-full hover:bg-sky-700 disabled:bg-gray-400 transition-colors">
                    <SendIcon className="h-6 w-6"/>
                </button>
            </div>
             <div className="mt-8 text-center">
                <button onClick={() => setClientStep('synthesis')} className="bg-green-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 ease-in-out hover:bg-green-700 shadow-md hover:shadow-lg">
                    Passa alla Sintesi S.M.A.R.T.
                </button>
            </div>
        </div>
    );
    
    const renderGoalForm = () => (
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <button onClick={mode === 'client' ? () => setClientStep('dialogue') : handleBackToSelection} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold mb-6 text-sm transition-colors">
                <ArrowLeftIcon />
                {mode === 'client' ? 'Torna al Dialogo' : 'Cambia modalità'}
            </button>

            {mode === 'self' ? (
                <>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Definisci il tuo Obiettivo S.M.A.R.T.</h1>
                    <p className="text-gray-600 mb-6">Trasforma un tuo desiderio in un obiettivo concreto e ben formato.</p>
                    <div className="mb-6">
                        <label htmlFor="objective" className="block text-md font-semibold text-gray-700 mb-2">Descrivi il tuo obiettivo generale:</label>
                        <input id="objective" type="text" value={objective} onChange={(e) => setObjective(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition shadow-sm" placeholder="Es. Vorrei essere più in forma" />
                    </div>
                </>
            ) : (
                <>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Sintesi dell'Obiettivo S.M.A.R.T.</h1>
                    <p className="text-gray-600 mb-6">Basandoti sul dialogo, sintetizza le informazioni raccolte per definire l'obiettivo del cliente.</p>
                     <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-900 p-4 rounded-r-lg mb-6">
                        <p className="font-semibold">Obiettivo Vago del Cliente:</p>
                        <p className="text-lg italic">"{scenario.name} {scenario.goal}"</p>
                    </div>
                </>
            )}

            <div className="space-y-4">
                <div>
                    <label htmlFor="specific" className="block text-md font-semibold text-gray-700">S - Specifico <span className="font-normal text-gray-500">(Cosa vuoi ottenere esattamente?)</span></label>
                    <input id="specific" type="text" value={specific} onChange={(e) => setSpecific(e.target.value)} className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" placeholder="Es. Correre 5km senza fermarmi" />
                </div>
                 <div>
                    <label htmlFor="measurable" className="block text-md font-semibold text-gray-700">M - Misurabile <span className="font-normal text-gray-500">(Come misurerai il progresso?)</span></label>
                    <input id="measurable" type="text" value={measurable} onChange={(e) => setMeasurable(e.target.value)} className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" placeholder="Es. Usando un'app di tracking per la corsa" />
                </div>
                 <div>
                    <label htmlFor="achievable" className="block text-md font-semibold text-gray-700">A - Raggiungibile (Achievable) <span className="font-normal text-gray-500">(È un obiettivo realistico per te/il cliente ora?)</span></label>
                    <input id="achievable" type="text" value={achievable} onChange={(e) => setAchievable(e.target.value)} className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" placeholder="Es. Sì, partendo da 3 allenamenti a settimana" />
                </div>
                 <div>
                    <label htmlFor="relevant" className="block text-md font-semibold text-gray-700">R - Rilevante <span className="font-normal text-gray-500">(Perché questo obiettivo è importante?)</span></label>
                    <input id="relevant" type="text" value={relevant} onChange={(e) => setRelevant(e.target.value)} className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" placeholder="Es. Per migliorare la mia salute e sentirmi più energico" />
                </div>
                 <div>
                    <label htmlFor="time-bound" className="block text-md font-semibold text-gray-700">T - Temporizzato (Time-bound) <span className="font-normal text-gray-500">(Entro quando?)</span></label>
                    <input id="time-bound" type="text" value={timeBound} onChange={(e) => setTimeBound(e.target.value)} className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" placeholder="Es. Entro 3 mesi" />
                </div>
            </div>

             {error && <p className="text-red-600 mt-4 text-center">{error}</p>}

            <div className="mt-8 text-center">
                <button onClick={handleGenerateFeedback} disabled={isLoading} className="bg-sky-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 ease-in-out hover:bg-sky-700 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed">
                    {isLoading ? 'Analisi in corso...' : 'Valuta Lavoro Svolto'}
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
                        <button onClick={mode === 'self' ? () => {handleModeSelect('self')} : setNewScenario} className="bg-amber-500 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 ease-in-out hover:bg-amber-600 shadow-md hover:shadow-lg">
                            {mode === 'self' ? 'Nuovo Obiettivo Personale' : 'Nuovo Cliente'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );


    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <button onClick={onGoHome} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold mb-8 transition-colors">
                    <ArrowLeftIcon />
                    Torna al menu principale
                </button>

                {!mode ? renderSelectionScreen() : (
                    mode === 'self' ? renderGoalForm() : (
                        clientStep === 'dialogue' ? renderClientDialogue() : renderGoalForm()
                    )
                )}

                <footer className="text-center py-8 mt-12">
                    <p className="text-gray-500">&copy; {new Date().getFullYear()} Hub Competenze Counseling. Tutti i diritti riservati.</p>
                </footer>
            </div>
        </div>
    );
};

export default SmartGoalTool;
