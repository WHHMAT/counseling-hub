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

interface CategorizedTasks {
  q1: string[]; // Urgent, Important
  q2: string[]; // Not Urgent, Important
  q3: string[]; // Urgent, Not Important
  q4: string[]; // Not Urgent, Not Important
}

interface EisenhowerMatrixToolProps {
  onGoHome: () => void;
  onExerciseComplete: () => void;
}

const EisenhowerMatrixTool: React.FC<EisenhowerMatrixToolProps> = ({ onGoHome, onExerciseComplete }) => {
    const [step, setStep] = useState<'input' | 'categorize' | 'result'>('input');
    const [tasksInput, setTasksInput] = useState('');
    const [allTasks, setAllTasks] = useState<string[]>([]);
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [categorizedTasks, setCategorizedTasks] = useState<CategorizedTasks>({ q1: [], q2: [], q3: [], q4: [] });
    const [isUrgent, setIsUrgent] = useState<boolean | null>(null);
    const [isImportant, setIsImportant] = useState<boolean | null>(null);
    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleStartCategorization = () => {
        const tasks = tasksInput.split('\n').map(t => t.trim()).filter(t => t !== '');
        if (tasks.length === 0) {
            setError('Per favore, inserisci almeno un impegno.');
            return;
        }
        setAllTasks(tasks);
        setStep('categorize');
        setError('');
    };

    const handleNextTask = () => {
        if (isUrgent === null || isImportant === null) {
            setError('Per favore, rispondi a entrambe le domande per classificare l\'impegno.');
            return;
        }
        
        const currentTask = allTasks[currentTaskIndex];
        const newCategorizedTasks = { ...categorizedTasks };

        if (isUrgent && isImportant) newCategorizedTasks.q1.push(currentTask);
        else if (!isUrgent && isImportant) newCategorizedTasks.q2.push(currentTask);
        else if (isUrgent && !isImportant) newCategorizedTasks.q3.push(currentTask);
        else newCategorizedTasks.q4.push(currentTask);

        setCategorizedTasks(newCategorizedTasks);
        setIsUrgent(null);
        setIsImportant(null);
        setError('');

        if (currentTaskIndex < allTasks.length - 1) {
            setCurrentTaskIndex(currentTaskIndex + 1);
        } else {
            setStep('result');
        }
    };
    
    const handleGetFeedback = async () => {
        setIsLoading(true);
        setFeedback('');
        setError('');

        const prompt = `Sei un coach di produttività esperto nella Matrice di Eisenhower. Un utente ha categorizzato i suoi impegni. Il tuo compito è fornire un'analisi costruttiva e un suggerimento pratico.

Ecco la matrice dell'utente:
- **Urgente e Importante (Da Fare Subito):**
${categorizedTasks.q1.length > 0 ? categorizedTasks.q1.map(t => `- ${t}`).join('\n') : 'Nessuno'}
- **Importante ma non Urgente (Da Pianificare):**
${categorizedTasks.q2.length > 0 ? categorizedTasks.q2.map(t => `- ${t}`).join('\n') : 'Nessuno'}
- **Urgente ma non Importante (Da Delegare):**
${categorizedTasks.q3.length > 0 ? categorizedTasks.q3.map(t => `- ${t}`).join('\n') : 'Nessuno'}
- **Né Urgente né Importante (Da Eliminare):**
${categorizedTasks.q4.length > 0 ? categorizedTasks.q4.map(t => `- ${t}`).join('\n') : 'Nessuno'}

Fornisci il feedback in formato Markdown, strutturato così (usa ** per i titoli):

**Analisi della tua Matrice:**
Commenta brevemente la distribuzione dei compiti. C'è un buon equilibrio? C'è un sovraccarico in un quadrante specifico (es. troppe urgenze)? Sii incoraggiante e non giudicante.

**Il Segreto del Successo: il Quadrante 2**
Spiega brevemente perché il Quadrante 2 (Importante, non Urgente) è cruciale per la crescita a lungo termine e per ridurre lo stress futuro.

**Un Suggerimento Pratico:**
Offri un consiglio specifico e attuabile basato sulla lista dell'utente. Ad esempio, suggerisci come un'attività del Quadrante 1 potrebbe essere prevenuta con più pianificazione (Quadrante 2), o come un'attività del Quadrante 3 potrebbe essere gestita diversamente (es. automatizzata, semplificata).

**Punteggio:**
Assegna un punteggio di 10 per aver completato l'esercizio.`;

        try {
            const res = await fetch('/.netlify/functions/generateFeedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Errore del server.');

            setFeedback(data.feedback);
            onExerciseComplete();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Si è verificato un errore sconosciuto.');
        } finally {
            setIsLoading(false);
        }
    };

    const resetState = () => {
        setStep('input');
        setTasksInput('');
        setAllTasks([]);
        setCurrentTaskIndex(0);
        setCategorizedTasks({ q1: [], q2: [], q3: [], q4: [] });
        setIsUrgent(null);
        setIsImportant(null);
        setFeedback('');
        setError('');
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

    const renderInputStep = () => (
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Matrice di Eisenhower</h1>
            <p className="text-gray-600 mb-6">Inizia elencando tutti i tuoi impegni, compiti o attività. Inseriscine uno per riga.</p>
            <textarea
                value={tasksInput}
                onChange={(e) => setTasksInput(e.target.value)}
                rows={10}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition shadow-sm"
                placeholder="Es.&#10;Preparare la presentazione per martedì&#10;Rispondere alle email urgenti&#10;Andare in palestra&#10;Guardare una serie TV"
            />
            {error && <p className="text-red-600 mt-2 text-center">{error}</p>}
            <div className="mt-6 text-center">
                <button onClick={handleStartCategorization} className="bg-sky-600 text-white px-8 py-3 rounded-full font-semibold transition-all hover:bg-sky-700 shadow-md hover:shadow-lg">
                    Inizia a Categorizzare
                </button>
            </div>
        </div>
    );

    const renderCategorizeStep = () => (
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="text-center mb-6">
                 <p className="text-sm font-semibold text-sky-600">IMPEGNO {currentTaskIndex + 1} DI {allTasks.length}</p>
                 <h2 className="text-2xl font-bold text-gray-800 mt-1">"{allTasks[currentTaskIndex]}"</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-semibold text-gray-700 mb-3">1. È urgente?</h3>
                    <div className="space-y-2">
                        <button onClick={() => setIsUrgent(true)} className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${isUrgent === true ? 'bg-sky-100 border-sky-500' : 'bg-gray-50 border-gray-300 hover:border-sky-400'}`}>
                            <p className="font-bold">Sì</p>
                            <p className="text-sm text-gray-600">Richiede la mia attenzione immediata.</p>
                        </button>
                        <button onClick={() => setIsUrgent(false)} className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${isUrgent === false ? 'bg-sky-100 border-sky-500' : 'bg-gray-50 border-gray-300 hover:border-sky-400'}`}>
                            <p className="font-bold">No</p>
                            <p className="text-sm text-gray-600">Può aspettare, non ha una scadenza a breve.</p>
                        </button>
                    </div>
                </div>
                 <div>
                    <h3 className="font-semibold text-gray-700 mb-3">2. È importante?</h3>
                    <div className="space-y-2">
                        <button onClick={() => setIsImportant(true)} className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${isImportant === true ? 'bg-amber-100 border-amber-500' : 'bg-gray-50 border-gray-300 hover:border-amber-400'}`}>
                            <p className="font-bold">Sì</p>
                            <p className="text-sm text-gray-600">Contribuisce ai miei obiettivi a lungo termine.</p>
                        </button>
                        <button onClick={() => setIsImportant(false)} className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${isImportant === false ? 'bg-amber-100 border-amber-500' : 'bg-gray-50 border-gray-300 hover:border-amber-400'}`}>
                            <p className="font-bold">No</p>
                            <p className="text-sm text-gray-600">Non mi aiuta a raggiungere i miei obiettivi.</p>
                        </button>
                    </div>
                </div>
            </div>
            {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
            <div className="mt-8 text-center">
                <button onClick={handleNextTask} className="bg-sky-600 text-white px-8 py-3 rounded-full font-semibold transition-all hover:bg-sky-700 shadow-md hover:shadow-lg disabled:bg-gray-400" disabled={isUrgent === null || isImportant === null}>
                    {currentTaskIndex < allTasks.length - 1 ? 'Prossimo Impegno' : 'Mostra la Matrice'}
                </button>
            </div>
        </div>
    );

    const renderResultStep = () => (
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">La tua Matrice di Eisenhower</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Q1 */}
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                    <h2 className="font-bold text-lg text-red-800">Urgente e Importante</h2>
                    <p className="text-sm text-red-700 mb-3">DA FARE SUBITO</p>
                    <ul className="space-y-1 text-gray-800 list-disc list-inside">{categorizedTasks.q1.map((t, i) => <li key={i}>{t}</li>)}</ul>
                </div>
                {/* Q2 */}
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <h2 className="font-bold text-lg text-green-800">Importante, non Urgente</h2>
                    <p className="text-sm text-green-700 mb-3">DA PIANIFICARE</p>
                    <ul className="space-y-1 text-gray-800 list-disc list-inside">{categorizedTasks.q2.map((t, i) => <li key={i}>{t}</li>)}</ul>
                </div>
                {/* Q3 */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <h2 className="font-bold text-lg text-blue-800">Urgente, non Importante</h2>
                    <p className="text-sm text-blue-700 mb-3">DA DELEGARE</p>
                    <ul className="space-y-1 text-gray-800 list-disc list-inside">{categorizedTasks.q3.map((t, i) => <li key={i}>{t}</li>)}</ul>
                </div>
                {/* Q4 */}
                <div className="bg-gray-100 border-2 border-gray-200 rounded-lg p-4">
                    <h2 className="font-bold text-lg text-gray-800">Né Urgente, né Importante</h2>
                    <p className="text-sm text-gray-700 mb-3">DA ELIMINARE</p>
                    <ul className="space-y-1 text-gray-800 list-disc list-inside">{categorizedTasks.q4.map((t, i) => <li key={i}>{t}</li>)}</ul>
                </div>
            </div>

            <div className="mt-8 text-center">
                {!feedback && !isLoading && (
                    <button onClick={handleGetFeedback} className="bg-amber-500 text-white px-8 py-3 rounded-full font-semibold transition-all hover:bg-amber-600 shadow-md hover:shadow-lg">
                        Chiedi un'analisi all'AI
                    </button>
                )}
            </div>

            {isLoading && <div className="mt-8"><LoadingSpinner /></div>}
            
            {feedback && (
                <div className="mt-8 border-t pt-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Feedback del Coach AI</h2>
                    <div className="bg-gray-50 rounded-lg p-4 text-gray-700 prose max-w-none">
                        {renderMarkdown(feedback)}
                    </div>
                </div>
            )}

            <div className="mt-8 text-center">
                 <button onClick={resetState} className="text-sky-600 hover:text-sky-800 font-semibold transition-colors">
                    Crea una nuova matrice
                </button>
            </div>
        </div>
    );
    
    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <button onClick={onGoHome} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold mb-8 transition-colors">
                    <ArrowLeftIcon />
                    Torna al menu principale
                </button>

                {step === 'input' && renderInputStep()}
                {step === 'categorize' && renderCategorizeStep()}
                {step === 'result' && renderResultStep()}

            </div>
        </div>
    );
};

export default EisenhowerMatrixTool;
