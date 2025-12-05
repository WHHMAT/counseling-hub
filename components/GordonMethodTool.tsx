import React, { useState } from 'react';

const ArrowLeftIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
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

interface Scenario {
  id: number;
  title: string;
  context: string;
  userRole: string;
  aiRole: string;
  aiName: string;
}

const SCENARIOS: Scenario[] = [
  { id: 1, title: "Conflitto sul Lavoro", context: "Tu e il tuo collega Alex dovete completare un report importante insieme. Alex continua a inviarti le sue parti all'ultimo minuto, costringendoti a fare le ore piccole per integrare tutto e rispettare la scadenza. Questo sta diventando un'abitudine.", userRole: "collega di Alex", aiRole: "il tuo collega Alex", aiName: "Alex" },
  { id: 2, title: "Conflitto tra Coinquilini", context: "Condividi un appartamento con Sam. Nonostante abbiate concordato di dividere le pulizie, Sam lascia costantemente i suoi piatti sporchi nel lavandino per giorni, rendendo la cucina disordinata e poco igienica.", userRole: "coinquilino/a di Sam", aiRole: "il tuo coinquilino Sam", aiName: "Sam" },
  { id: 3, title: "Conflitto di Coppia", context: "Tu e il tuo partner, Chris, avete pianificato una serata speciale per il vostro anniversario. Tuttavia, Chris ti ha appena comunicato di aver accettato un invito a cena con i suoi amici per la stessa sera, dimenticandosene completamente.", userRole: "partner di Chris", aiRole: "il tuo partner Chris", aiName: "Chris" },
];

interface IMessage {
  behavior: string;
  feeling: string;
  effect: string;
}

interface ActionPlan {
    who: string;
    where: string;
    when: string;
}

interface GordonMethodToolProps {
  onGoHome: () => void;
  onExerciseComplete: (scenarioId: number) => void;
}

const GordonMethodTool: React.FC<GordonMethodToolProps> = ({ onGoHome, onExerciseComplete }) => {
    const [step, setStep] = useState<'selection' | 'phase1' | 'phase2' | 'phase3' | 'phase4' | 'phase5' | 'phase6'>('selection');
    const [scenario, setScenario] = useState<Scenario | null>(null);
    const [iMessage, setIMessage] = useState<IMessage>({ behavior: '', feeling: '', effect: '' });
    const [aiResponse, setAiResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Phase 2
    const [userSolutionsInput, setUserSolutionsInput] = useState('');
    const [combinedSolutions, setCombinedSolutions] = useState<string[]>([]);
    const [isAIBrainstorming, setIsAIBrainstorming] = useState(false);

    // Phase 3
    const [evaluationFeedback, setEvaluationFeedback] = useState('');
    const [isAIEvaluating, setIsAIEvaluating] = useState(false);
    
    // Phase 4
    const [chosenSolution, setChosenSolution] = useState<string | null>(null);
    const [rationale, setRationale] = useState('');
    const [aiAgreement, setAiAgreement] = useState('');

    // Phase 5
    const [actionPlan, setActionPlan] = useState<ActionPlan>({ who: '', where: '', when: '' });
    const [aiPlanConfirmation, setAiPlanConfirmation] = useState('');


    const handleSelectScenario = (selectedScenario: Scenario) => {
        setScenario(selectedScenario);
        setStep('phase1');
    };
    
    const handleSendIMessage = async () => {
        if (!iMessage.behavior || !iMessage.feeling || !iMessage.effect) {
            setError("Per favore, compila tutti e tre i campi del 'Messaggio-Io'.");
            return;
        }
        setIsLoading(true);
        setError('');

        const fullIMessage = `Quando tu ${iMessage.behavior}, io mi sento ${iMessage.feeling}, perché ${iMessage.effect}.`;

        const systemInstruction = `Sei un esperto del Metodo Gordon per la risoluzione dei conflitti. Stai interpretando il ruolo di ${scenario?.aiRole}, ${scenario?.aiName}. Un utente (che interpreta il ruolo di ${scenario?.userRole}) ti ha appena inviato un 'Messaggio-Io' per descrivere come si sente riguardo a questo conflitto: "${scenario?.context}".
Il tuo compito è rispondere in due parti, dimostrando le tecniche di Gordon:
1.  **Ascolto Attivo:** Inizia riflettendo empaticamente ciò che hai capito del suo messaggio. Parafrasa i suoi sentimenti e i suoi bisogni per dimostrare che hai compreso senza giudicare. Esempio: 'Quindi, se ho capito bene, quando io faccio X, ti senti Y, perché per te è importante Z. È così?'.
2.  **Messaggio-Io (la tua parte):** Dopo aver mostrato comprensione, esprimi con calma e in modo non accusatorio il tuo punto di vista e i tuoi bisogni, usando a tua volta un 'Messaggio-Io'. Esempio: 'Apprezzo che tu me l'abbia detto. Dal mio punto di vista, quando sono di fretta, a volte faccio X perché ho bisogno di Y. Non è mia intenzione crearti disagio.'
Il tuo tono deve essere collaborativo e orientato a risolvere il problema insieme, non a vincere la discussione. Sii breve e naturale.`;

        try {
            const res = await fetch('/.netlify/functions/generateFeedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ systemInstruction, userContent: fullIMessage }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Errore del server.');
            
            setAiResponse(data.feedback);
            if (scenario) {
                 onExerciseComplete(scenario.id);
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Si è verificato un errore.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAskAIForSolutions = async () => {
        const userSolutions = userSolutionsInput.split('\n').map(s => s.trim()).filter(s => s);
        if (userSolutions.length === 0) {
            setError("Per favore, inserisci almeno una possibile soluzione prima di chiedere aiuto.");
            return;
        }
        setIsAIBrainstorming(true);
        setError('');

        const systemInstruction = `Stai continuando il role-play come ${scenario?.aiName}, ${scenario?.aiRole}. Avete definito il conflitto e ora state facendo brainstorming per trovare soluzioni. L'utente ti ha proposto alcune idee. Il tuo compito è agire come un partner collaborativo.
Regole del brainstorming:
1.  **Nessuna critica:** Non valutare o criticare le idee dell'utente. Accoglile positivamente.
2.  **Quantità, non qualità:** L'obiettivo è generare più idee possibili.
3.  **Sii creativo:** Pensa fuori dagli schemi.

Il tuo compito è rispondere in due parti:
1.  **Incoraggiamento:** Inizia con una frase positiva che valida le idee dell'utente (es. "Ottime idee!", "Interessante, mi fai pensare a...").
2.  **Aggiungi 2-3 nuove idee:** Proponi 2 o 3 soluzioni creative dal tuo punto di vista, presentandole come un elenco puntato (usa '- ' per ogni punto). Restituisci SOLO le tue nuove idee nell'elenco, non ripetere quelle dell'utente.`;
        
        const userContent = `Le mie idee sono:
${userSolutions.join('\n')}`;

        try {
            const res = await fetch('/.netlify/functions/generateFeedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ systemInstruction, userContent }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Errore del server.');

            const aiIdeasText = data.feedback;
            const aiSolutions = aiIdeasText.split('\n')
                .filter((line: string) => line.startsWith('- '))
                .map((line: string) => line.substring(2).trim());
            
            setCombinedSolutions([...userSolutions, ...aiSolutions]);

        } catch (e) {
             setError(e instanceof Error ? e.message : 'Si è verificato un errore.');
        } finally {
            setIsAIBrainstorming(false);
        }
    };

    const handleAskForEvaluation = async () => {
        setIsAIEvaluating(true);
        setEvaluationFeedback('');
        setError('');

        const systemInstruction = `Sei un esperto del Metodo Gordon e continui il tuo role-play come ${scenario?.aiName}, ${scenario?.aiRole}. Avete generato una lista di soluzioni e ora è il momento di valutarle.
Il tuo compito è analizzare ogni soluzione dal tuo punto di vista, in modo onesto e collaborativo. Per ogni punto della lista, esprimi:
- **Cosa ne pensi:** Ti sembra una soluzione valida?
- **Bisogni soddisfatti:** Quali dei tuoi bisogni (impliciti o espliciti) verrebbero soddisfatti?
- **Preoccupazioni:** Ci sono aspetti che ti preoccupano o che non soddisfano altri tuoi bisogni?
Mantieni un tono costruttivo. L'obiettivo non è scartare le idee, ma capirle a fondo per trovare quella migliore per entrambi.
Rispondi con un'analisi concisa per ogni punto, usando un elenco.`;

        const userContent = `Ecco la lista di soluzioni che abbiamo generato:
${combinedSolutions.map(s => `- ${s}`).join('\n')}

Cosa ne pensi? Esaminiamole una per una dal tuo punto di vista.`;

        try {
            const res = await fetch('/.netlify/functions/generateFeedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ systemInstruction, userContent }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Errore del server.');
            
            setEvaluationFeedback(data.feedback);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Si è verificato un errore.');
        } finally {
            setIsAIEvaluating(false);
        }
    };
    
    const handleProposeSolution = async () => {
        if (!chosenSolution) {
            setError("Per favore, scegli una soluzione da proporre.");
            return;
        }
         if (!rationale) {
            setError("Per favore, spiega brevemente perché hai scelto questa soluzione.");
            return;
        }
        setIsLoading(true);
        setAiAgreement('');
        setError('');

        const systemInstruction = `Sei un esperto del Metodo Gordon e continui il tuo role-play come ${scenario?.aiName}. L'utente ha valutato le opzioni e ora ti sta proponendo la soluzione che ritiene migliore per entrambi, spiegando il perché. Il tuo compito è rispondere in modo collaborativo per finalizzare l'accordo.
- Se la soluzione proposta è ragionevole e in linea con le tue esigenze espresse in precedenza, **accettala con entusiasmo** e conferma il tuo impegno (es. "Sono assolutamente d'accordo, mi sembra un'ottima soluzione per entrambi. Mi impegno a fare la mia parte.").
- Se hai una **piccola riserva**, esprimila in modo costruttivo e proponi un piccolissimo aggiustamento per renderla perfetta, ma l'obiettivo è **raggiungere un accordo, non riaprire la discussione**.
- Concludi sempre con un **tono positivo**, confermando la risoluzione del conflitto.`;

        const userContent = `Ok, dopo aver valutato tutto, ecco la soluzione che propongo:
**Soluzione Scelta:** "${chosenSolution}"
**Mia Motivazione:** "${rationale}"
Sei d'accordo? Possiamo procedere così?`;

        try {
            const res = await fetch('/.netlify/functions/generateFeedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ systemInstruction, userContent }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Errore del server.');
            
            setAiAgreement(data.feedback);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Si è verificato un errore.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmPlan = async () => {
        if (!actionPlan.who || !actionPlan.when) {
            setError("Per favore, definisci almeno 'Chi farà cosa?' e 'Quando?'.");
            return;
        }
        setIsLoading(true);
        setAiPlanConfirmation('');
        setError('');

        const systemInstruction = `Sei sempre ${scenario?.aiName}. Avete raggiunto un accordo e l'utente ti ha appena proposto un piano d'azione concreto. Il tuo compito è:
1.  **Rivedere il piano:** Assicurati che sia chiaro e fattibile dal tuo punto di vista.
2.  **Confermare il tuo impegno:** Rispondi positivamente, confermando che sei d'accordo con il piano e che farai la tua parte.
3.  **Aggiungere un tocco finale:** Concludi con una frase che rafforzi la collaborazione (es. "Perfetto, me lo segno in agenda. Sono contento che ne abbiamo parlato.", oppure "Ottimo, facciamo così. Grazie per aver affrontato la questione con me.").`;

        const userContent = `Ok, ecco il piano d'azione per la nostra soluzione:
- **Chi farà cosa?** ${actionPlan.who}
- **Dove?** ${actionPlan.where || 'Non specificato'}
- **Quando?** ${actionPlan.when}
Ti va bene?`;

        try {
             const res = await fetch('/.netlify/functions/generateFeedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ systemInstruction, userContent }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Errore del server.');
            
            setAiPlanConfirmation(data.feedback);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Si è verificato un errore.');
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

    const reset = () => {
        setStep('selection');
        setScenario(null);
        setIMessage({ behavior: '', feeling: '', effect: '' });
        setAiResponse('');
        setError('');
        setUserSolutionsInput('');
        setCombinedSolutions([]);
        setEvaluationFeedback('');
        setChosenSolution(null);
        setRationale('');
        setAiAgreement('');
        setActionPlan({ who: '', where: '', when: '' });
        setAiPlanConfirmation('');
    };

    const renderSelection = () => (
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">Metodo Gordon per la Risoluzione dei Conflitti</h1>
            <p className="text-gray-600 text-center mb-8">Scegli uno scenario per iniziare a praticare la prima fase: Identificare e Definire il Conflitto.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SCENARIOS.map(sc => (
                    <div key={sc.id} onClick={() => handleSelectScenario(sc)} className="bg-sky-50 border-2 border-sky-200 rounded-xl p-6 text-center hover:border-sky-500 hover:bg-sky-100 cursor-pointer transition-all flex flex-col">
                        <h2 className="text-xl font-bold text-sky-800">{sc.title}</h2>
                        <p className="text-gray-600 mt-2 flex-grow">{sc.context}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderPhase1 = () => {
        if (!scenario) return null;
        return (
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <button onClick={reset} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold mb-6 text-sm transition-colors">
                    <ArrowLeftIcon />
                    Scegli un altro scenario
                </button>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Fase 1: Identificare e Definire il Conflitto</h1>
                <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-900 p-4 rounded-r-lg my-4">
                    <p className="font-semibold">Scenario: {scenario.title}</p>
                    <p className="italic">"{scenario.context}"</p>
                </div>
                
                <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-3">Costruisci il tuo "Messaggio-Io"</h2>
                <p className="text-gray-600 mb-4">Esprimi come ti senti senza accusare l'altro. Completa le frasi qui sotto.</p>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Quando tu... (descrivi il comportamento oggettivo)</label>
                        <input type="text" value={iMessage.behavior} onChange={e => setIMessage({...iMessage, behavior: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" placeholder="es. invii la tua parte di report all'ultimo minuto" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Io mi sento... (esprimi la tua emozione)</label>
                        <input type="text" value={iMessage.feeling} onChange={e => setIMessage({...iMessage, feeling: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" placeholder="es. stressato/a e sotto pressione" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Perché... (spiega l'impatto concreto su di te)</label>
                        <input type="text" value={iMessage.effect} onChange={e => setIMessage({...iMessage, effect: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" placeholder="es. ho bisogno di tempo per revisionare e integrare il lavoro con calma" />
                    </div>
                </div>

                {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                
                {!aiResponse && (
                    <div className="mt-6 text-center">
                        <button onClick={handleSendIMessage} disabled={isLoading} className="bg-sky-600 text-white px-8 py-3 rounded-full font-semibold transition-all hover:bg-sky-700 shadow-md hover:shadow-lg disabled:bg-gray-400">
                           {isLoading ? 'Invio...' : 'Invia Messaggio-Io'}
                        </button>
                    </div>
                )}
                
                {isLoading && <div className="mt-6"><LoadingSpinner /></div>}
                
                {aiResponse && (
                    <div className="mt-8 border-t pt-6 space-y-4">
                        <div>
                           <p className="font-semibold text-gray-800">Tu:</p>
                           <div className="bg-sky-100 p-3 rounded-lg">
                               <p className="italic">"Quando tu {iMessage.behavior}, io mi sento {iMessage.feeling}, perché {iMessage.effect}."</p>
                           </div>
                        </div>
                         <div>
                           <p className="font-semibold text-gray-800">{scenario.aiName}:</p>
                           <div className="bg-gray-100 p-3 rounded-lg">
                               <p className="italic">"{aiResponse}"</p>
                           </div>
                        </div>
                        <div className="text-center bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                           <h3 className="font-bold text-green-800">Ottimo Lavoro! Avete definito il conflitto.</h3>
                           <p className="text-green-700">Ora siete pronti per la fase successiva.</p>
                            <button onClick={() => setStep('phase2')} className="mt-4 bg-green-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-700 transition-colors shadow-sm">
                                Vai alla Fase 2: Brainstorming
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderPhase2 = () => {
        if (!scenario) return null;
        return (
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <button onClick={() => setStep('phase1')} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold mb-6 text-sm transition-colors">
                    <ArrowLeftIcon />
                    Torna alla Fase 1
                </button>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Fase 2: Generare Possibili Soluzioni</h1>
                <p className="text-gray-600 my-4">È il momento del brainstorming. L'obiettivo è generare più idee possibili per risolvere il problema, senza criticarle. Inserisci ogni idea su una nuova riga.</p>

                {combinedSolutions.length === 0 ? (
                    <>
                        <textarea
                            value={userSolutionsInput}
                            onChange={(e) => setUserSolutionsInput(e.target.value)}
                            rows={6}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition shadow-sm"
                            placeholder="Es.&#10;Possiamo stabilire una scadenza interna per le nostre parti.&#10;Possiamo lavorare insieme in contemporanea.&#10;Potresti inviarmi le bozze man mano che le scrivi."
                        />
                        {error && <p className="text-red-500 text-center mt-2">{error}</p>}
                        <div className="mt-6 text-center">
                            <button onClick={handleAskAIForSolutions} disabled={isAIBrainstorming} className="bg-sky-600 text-white px-8 py-3 rounded-full font-semibold transition-all hover:bg-sky-700 shadow-md hover:shadow-lg disabled:bg-gray-400">
                                {isAIBrainstorming ? 'Ci sta pensando...' : `Chiedi a ${scenario.aiName} di aggiungere idee`}
                            </button>
                        </div>
                         {isAIBrainstorming && <div className="mt-4"><LoadingSpinner /></div>}
                    </>
                ) : (
                    <div className="mt-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3">Lista delle Soluzioni Proposte:</h2>
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <ul className="list-disc list-inside space-y-2 text-gray-700">
                                {combinedSolutions.map((solution, index) => (
                                    <li key={index}>{solution}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="text-center bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg mt-6">
                           <h3 className="font-bold text-green-800">Brainstorming completato!</h3>
                           <p className="text-green-700">Avete una lista di opzioni. Il prossimo passo è valutarle insieme.</p>
                           <button onClick={() => setStep('phase3')} className="mt-4 bg-green-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-700 transition-colors shadow-sm">
                                Vai alla Fase 3: Valutazione
                            </button>
                        </div>
                         <div className="mt-6 text-center">
                            <button onClick={() => { setUserSolutionsInput(combinedSolutions.join('\n')); setCombinedSolutions([]); }} className="text-sky-600 hover:text-sky-800 font-semibold transition-colors">
                                Riprova il Brainstorming
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderPhase3 = () => {
        if (!scenario) return null;
        return (
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <button onClick={() => setStep('phase2')} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold mb-6 text-sm transition-colors">
                    <ArrowLeftIcon />
                    Torna alla Fase 2
                </button>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Fase 3: Valutare le Soluzioni Proposte</h1>
                <p className="text-gray-600 my-4">Ora esaminate criticamente ogni soluzione. L'obiettivo è capire quali sono accettabili per entrambi.</p>
                
                <div className="bg-gray-50 p-4 rounded-lg border mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">Lista da Valutare:</h2>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {combinedSolutions.map((solution, index) => (
                            <li key={index}>{solution}</li>
                        ))}
                    </ul>
                </div>
                
                {error && <p className="text-red-500 text-center mt-4">{error}</p>}

                {!evaluationFeedback && (
                    <div className="mt-6 text-center">
                        <button onClick={handleAskForEvaluation} disabled={isAIEvaluating} className="bg-sky-600 text-white px-8 py-3 rounded-full font-semibold transition-all hover:bg-sky-700 shadow-md hover:shadow-lg disabled:bg-gray-400">
                           {isAIEvaluating ? 'Valutazione in corso...' : `Chiedi a ${scenario.aiName} cosa ne pensa`}
                        </button>
                    </div>
                )}
                
                {isAIEvaluating && <div className="mt-6"><LoadingSpinner /></div>}
                
                {evaluationFeedback && (
                    <div className="mt-8 border-t pt-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3">La valutazione di {scenario.aiName}:</h2>
                        <div className="bg-gray-100 p-4 rounded-lg prose max-w-none text-gray-800">
                           {renderMarkdown(evaluationFeedback)}
                        </div>
                         <div className="text-center bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg mt-6">
                           <h3 className="font-bold text-green-800">Valutazione completata!</h3>
                           <p className="text-green-700">Ora avete un'idea più chiara di quale soluzione possa funzionare. Il prossimo passo è scegliere la migliore.</p>
                           <button onClick={() => setStep('phase4')} className="mt-4 bg-green-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-700 transition-colors shadow-sm">
                                Vai alla Fase 4: Scelta della Soluzione
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };
    
    const renderPhase4 = () => {
        if (!scenario) return null;
        return (
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <button onClick={() => setStep('phase3')} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold mb-6 text-sm transition-colors">
                    <ArrowLeftIcon />
                    Torna alla Fase 3
                </button>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Fase 4: Scegliere la Soluzione Migliore</h1>
                <p className="text-gray-600 my-4">Dopo aver valutato le opzioni, scegli la soluzione che ritieni soddisfi meglio i bisogni di entrambi e proponila per raggiungere un accordo.</p>
                
                {!aiAgreement ? (
                    <>
                        <div className="space-y-3 mb-6">
                            <h2 className="text-lg font-semibold text-gray-800">1. Seleziona la soluzione che vuoi proporre:</h2>
                            {combinedSolutions.map((solution, index) => (
                                <div 
                                    key={index}
                                    onClick={() => setChosenSolution(solution)}
                                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${chosenSolution === solution ? 'bg-sky-100 border-sky-500 ring-2 ring-sky-300' : 'bg-white border-gray-300 hover:border-sky-400'}`}
                                >
                                    {solution}
                                </div>
                            ))}
                        </div>
                        <div className="mb-4">
                            <label htmlFor="rationale" className="block text-lg font-semibold text-gray-700 mb-2">2. Spiega brevemente perché la ritieni la scelta migliore:</label>
                            <textarea id="rationale" rows={3} value={rationale} onChange={(e) => setRationale(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" placeholder="Es. Credo che questa soluzione funzioni per entrambi perché..."/>
                        </div>
                        
                        {error && <p className="text-red-500 text-center mt-4">{error}</p>}

                        <div className="mt-6 text-center">
                            <button onClick={handleProposeSolution} disabled={isLoading} className="bg-sky-600 text-white px-8 py-3 rounded-full font-semibold transition-all hover:bg-sky-700 shadow-md hover:shadow-lg disabled:bg-gray-400">
                               {isLoading ? 'Invio proposta...' : `Proponi a ${scenario.aiName}`}
                            </button>
                        </div>
                         {isLoading && <div className="mt-6"><LoadingSpinner /></div>}
                    </>
                ) : (
                    <div className="mt-8 border-t pt-6 space-y-4">
                         <div>
                           <p className="font-semibold text-gray-800">La tua Proposta:</p>
                           <div className="bg-sky-100 p-3 rounded-lg">
                                <p className="font-bold">Soluzione: <span className="font-normal italic">"{chosenSolution}"</span></p>
                                <p className="font-bold mt-2">Motivazione: <span className="font-normal italic">"{rationale}"</span></p>
                           </div>
                        </div>
                         <div>
                           <p className="font-semibold text-gray-800">Risposta di {scenario.aiName}:</p>
                           <div className="bg-gray-100 p-3 rounded-lg">
                               <p className="italic">"{aiAgreement}"</p>
                           </div>
                        </div>
                         <div className="text-center bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                           <h3 className="font-bold text-green-800">Accordo Raggiunto!</h3>
                           <p className="text-green-700">Avete una soluzione condivisa. Ora è il momento di renderla concreta.</p>
                           <button onClick={() => setStep('phase5')} className="mt-4 bg-green-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-700 transition-colors shadow-sm">
                                Vai alla Fase 5: Piano d'Azione
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderPhase5 = () => {
        if (!scenario) return null;
        return (
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <button onClick={() => setStep('phase4')} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold mb-6 text-sm transition-colors">
                    <ArrowLeftIcon />
                    Torna alla Fase 4
                </button>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Fase 5: Definire le Modalità di Attuazione</h1>
                <p className="text-gray-600 my-4">Un accordo è forte solo se è chiaro come metterlo in pratica. Definite chi farà cosa, dove e quando.</p>

                <div className="bg-gray-50 p-4 rounded-lg border mb-6">
                    <p className="font-semibold text-gray-800">Soluzione Concordata:</p>
                    <p className="italic text-gray-700">"{chosenSolution}"</p>
                </div>

                {!aiPlanConfirmation ? (
                    <>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="who" className="block text-sm font-medium text-gray-700">Chi farà cosa?</label>
                                <input id="who" type="text" value={actionPlan.who} onChange={e => setActionPlan({...actionPlan, who: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" placeholder="Es. Entrambi ci impegneremo a..." />
                            </div>
                            <div>
                                <label htmlFor="where" className="block text-sm font-medium text-gray-700">Dove? (Opzionale)</label>
                                <input id="where" type="text" value={actionPlan.where} onChange={e => setActionPlan({...actionPlan, where: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                            </div>
                             <div>
                                <label htmlFor="when" className="block text-sm font-medium text-gray-700">Quando?</label>
                                <input id="when" type="text" value={actionPlan.when} onChange={e => setActionPlan({...actionPlan, when: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" placeholder="Es. A partire da domani / Ogni venerdì pomeriggio" />
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                        <div className="mt-6 text-center">
                            <button onClick={handleConfirmPlan} disabled={isLoading} className="bg-sky-600 text-white px-8 py-3 rounded-full font-semibold transition-all hover:bg-sky-700 shadow-md hover:shadow-lg disabled:bg-gray-400">
                                {isLoading ? 'Invio piano...' : `Conferma il Piano con ${scenario.aiName}`}
                            </button>
                        </div>
                        {isLoading && <div className="mt-6"><LoadingSpinner /></div>}
                    </>
                ) : (
                     <div className="mt-8 border-t pt-6 space-y-4">
                         <div>
                           <p className="font-semibold text-gray-800">Il Piano d'Azione Proposto:</p>
                           <div className="bg-sky-100 p-3 rounded-lg">
                                <p><strong>Chi/Cosa:</strong> {actionPlan.who}</p>
                                <p><strong>Dove:</strong> {actionPlan.where || 'N/A'}</p>
                                <p><strong>Quando:</strong> {actionPlan.when}</p>
                           </div>
                        </div>
                         <div>
                           <p className="font-semibold text-gray-800">Conferma di {scenario.aiName}:</p>
                           <div className="bg-gray-100 p-3 rounded-lg">
                               <p className="italic">"{aiPlanConfirmation}"</p>
                           </div>
                        </div>
                         <div className="text-center bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                           <h3 className="font-bold text-green-800">Piano d'Azione Definito!</h3>
                           <p className="text-green-700">Avete un piano chiaro e condiviso. L'ultimo passo è assicurarsi che funzioni nel tempo.</p>
                           <button onClick={() => setStep('phase6')} className="mt-4 bg-green-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-700 transition-colors shadow-sm">
                                Vai alla Fase 6: Verifica
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderPhase6 = () => {
        if (!scenario) return null;
        return (
             <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Fase 6: Verificare i Risultati</h1>
                <div className="my-6">
                    <svg className="mx-auto h-16 w-16 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Congratulazioni!</h2>
                <p className="text-gray-600 mt-4 max-w-2xl mx-auto">Hai completato con successo la simulazione del Metodo Gordon per questo scenario. Hai identificato il problema, generato e valutato soluzioni, raggiunto un accordo e definito un piano d'azione.</p>
                <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-900 p-4 rounded-r-lg my-6 text-left">
                    <h3 className="font-bold">L'Importanza della Verifica</h3>
                    <p>In una situazione reale, questo sarebbe il momento di pianificare un "check-in". Dopo un periodo di tempo stabilito (es. una settimana), tu e {scenario.aiName} vi incontrereste di nuovo per rispondere a una semplice domanda: "La nostra soluzione sta funzionando come speravamo?".</p>
                    <p className="mt-2">Questa fase è fondamentale per assicurarsi che il problema sia veramente risolto e per apportare eventuali modifiche al piano, se necessario.</p>
                </div>
                <button onClick={reset} className="bg-sky-600 text-white px-8 py-3 rounded-full font-semibold transition-all hover:bg-sky-700 shadow-md hover:shadow-lg">
                    Inizia un nuovo scenario
                </button>
            </div>
        );
    };


    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <button onClick={onGoHome} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold mb-8 transition-colors">
                    <ArrowLeftIcon />
                    Torna al menu principale
                </button>
                {step === 'selection' && renderSelection()}
                {step === 'phase1' && renderPhase1()}
                {step === 'phase2' && renderPhase2()}
                {step === 'phase3' && renderPhase3()}
                {step === 'phase4' && renderPhase4()}
                {step === 'phase5' && renderPhase5()}
                {step === 'phase6' && renderPhase6()}
                <footer className="text-center py-8 mt-12">
                    <p className="text-gray-500">&copy; {new Date().getFullYear()} Hub Competenze Counseling. Tutti i diritti riservati.</p>
                </footer>
            </div>
        </div>
    );
};

export default GordonMethodTool;
