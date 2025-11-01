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

const LIKERT_OPTIONS = [
    'Fortemente in disaccordo',
    'In disaccordo',
    'Neutrale',
    'D\'accordo',
    'Fortemente d\'accordo'
];

const QUESTIONS = [
    { text: "Tendo a essere il mio peggior critico.", positive: false },
    { text: "Dopo un errore, la mia prima reazione è di auto-rimprovero.", positive: false },
    { text: "Mi concedo raramente di essere 'abbastanza bravo/a'.", positive: false },
    { text: "Mi confronto spesso con gli altri e mi sento inadeguato/a.", positive: false },
    { text: "Una piccola critica esterna può rovinare la mia intera giornata.", positive: false },
    { text: "Ho una voce interiore che mi dice che non sono capace o che fallirò.", positive: false },
    { text: "Mi sento a mio agio nel celebrare i miei successi, anche quelli piccoli.", positive: true },
    { text: "Sono in grado di perdonarmi per i miei errori passati.", positive: true },
    { text: "Credo che la perfezione sia l'unico standard accettabile per me.", positive: false },
    { text: "Evito di provare nuove attività per paura di non essere immediatamente bravo/a.", positive: false },
    { text: "Quando ricevo un complimento, spesso lo sminuisco o non ci credo.", positive: false },
    { text: "Parlo a me stesso/a con la stessa gentilezza che userei con un amico caro.", positive: true },
    { text: "Sento che il mio valore dipende strettamente dai miei risultati e successi.", positive: false },
    { text: "Riesco a vedere un errore come un'opportunità di apprendimento, non come un fallimento personale.", positive: true },
    { text: "Ho standard per me stesso/a molto più alti di quelli che ho per gli altri.", positive: false },
    { text: "La paura di essere giudicato/a mi blocca spesso.", positive: false },
    { text: "Riesco a riposarmi senza sentirmi in colpa per non essere produttivo/a.", positive: true },
    { text: "La mia voce interiore tende a usare parole dure come 'stupido/a', 'incapace', 'un disastro'.", positive: false },
    { text: "Accetto che commettere errori fa parte dell'essere umano.", positive: true },
    { text: "Sento una pressione costante a dover dimostrare il mio valore.", positive: false }
];

interface InnerCriticTestProps {
  onGoHome: () => void;
  onExerciseComplete: () => void;
  backButtonText?: string;
}

const InnerCriticTest: React.FC<InnerCriticTestProps> = ({ onGoHome, onExerciseComplete, backButtonText = "Torna al menu principale" }) => {
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [result, setResult] = useState('');
    const [score, setScore] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showResult, setShowResult] = useState(false);

    const handleAnswerChange = (questionIndex: number, value: number) => {
        setAnswers(prev => ({ ...prev, [questionIndex]: value + 1 }));
    };

    const calculateScore = () => {
        return QUESTIONS.reduce((total, question, index) => {
            const answerValue = answers[index];
            if (!answerValue) return total;
            // Un punteggio alto indica un Giudice Interiore forte
            const score = question.positive ? (6 - answerValue) : answerValue;
            return total + score;
        }, 0);
    };

    const handleCalculateResult = async () => {
        if (Object.keys(answers).length < QUESTIONS.length) {
            setError("Per favore, rispondi a tutte le domande prima di calcolare il risultato.");
            return;
        }

        setIsLoading(true);
        setError('');
        const totalScore = calculateScore();
        setScore(totalScore);

        const prompt = `Sei un counselor esperto che sta commentando il risultato di un test di autovalutazione sul "Giudice Interiore". Il test non è diagnostico. Il tuo tono deve essere compassionevole, incoraggiante e non giudicante.

Il punteggio totale del test va da 20 (giudice interiore poco attivo) a 100 (giudice interiore molto attivo e severo).
Puoi considerare queste fasce indicative:
- 20-40: Giudice Interiore poco presente o gestito con consapevolezza.
- 41-70: Presenza moderata del Giudice Interiore, che si attiva in determinate situazioni (es. stress, novità).
- 71-100: Giudice Interiore molto attivo, severo e potenzialmente limitante nella vita quotidiana.

L'utente ha ottenuto un punteggio di: ${totalScore}.

Fornisci un'analisi in formato Markdown, strutturata come segue (usa ** per i titoli):

**Interpretazione del tuo Punteggio:**
Spiega cosa potrebbe significare questo punteggio in termini di attività del Giudice Interiore. Usa un linguaggio empatico e normalizzante (es. "Molte persone sperimentano una voce critica interiore...").

**Le Caratteristiche del tuo Giudice Interiore:**
Basandoti sul punteggio, ipotizza quali "messaggi" tipici potrebbe inviare questo Giudice Interiore. Potrebbe essere un "perfezionista", un "sobillatore", uno che "confronta" o uno che "catastrofizza"? Descrivi brevemente uno o due di questi aspetti in modo delicato.

**Spunti per Coltivare la Gentilezza Interiore:**
Offri alcune aree di riflessione per iniziare a dialogare con questa parte di sé. Non dare soluzioni, ma poni domande aperte per stimolare la consapevolezza. (Es: "Come ti parleresti se fossi un caro amico in questa stessa situazione?", "Cosa succederebbe se ti concedessi di essere 'abbastanza bravo' invece che 'perfetto'?").

**Conclusione Incoraggiante:**
Termina con un messaggio positivo, ricordando all'utente che riconoscere il proprio Giudice Interiore è il primo, fondamentale passo per trasformare la relazione con esso da critica a compassionevole.`;

        try {
            const res = await fetch('/.netlify/functions/generateFeedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            setResult(data.feedback);
            setShowResult(true);
            onExerciseComplete();
        } catch (e) {
            console.error(e);
            setError("Si è verificato un errore durante la generazione del resoconto. Riprova.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderMarkdown = (text: string) => {
        return text.split('\n').map((line, index) => {
            if (line.startsWith('**') && line.endsWith('**')) {
                return <h3 key={index} className="text-xl font-bold text-gray-800 mt-6 mb-3">{line.replace(/\*\*/g, '')}</h3>;
            }
            return <p key={index} className="mb-2 leading-relaxed">{line}</p>;
        });
    };
    
    const resetTest = () => {
        setAnswers({});
        setResult('');
        setScore(0);
        setError('');
        setShowResult(false);
    };

    const renderTest = () => (
        <>
            <div className="space-y-6">
                {QUESTIONS.map((q, index) => (
                    <div key={index} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                        <p className="font-semibold text-gray-800 mb-4">{index + 1}. {q.text}</p>
                        <fieldset className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
                            <legend className="sr-only">Risposta per: {q.text}</legend>
                            {LIKERT_OPTIONS.map((option, value) => (
                                <div key={value} className="flex items-center">
                                    <input
                                        type="radio"
                                        id={`q${index}-opt${value}`}
                                        name={`question-${index}`}
                                        value={value}
                                        checked={answers[index] === value + 1}
                                        onChange={() => handleAnswerChange(index, value)}
                                        className="h-4 w-4 text-sky-600 border-gray-300 focus:ring-sky-500"
                                    />
                                    <label htmlFor={`q${index}-opt${value}`} className="ml-2 block text-sm text-gray-700">{option}</label>
                                </div>
                            ))}
                        </fieldset>
                    </div>
                ))}
            </div>
            {error && <p className="text-red-600 mt-4 text-center font-semibold">{error}</p>}
            <div className="mt-8 text-center">
                <button
                    onClick={handleCalculateResult}
                    disabled={isLoading || Object.keys(answers).length < QUESTIONS.length}
                    className="bg-sky-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 ease-in-out hover:bg-sky-700 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Analisi in corso...' : 'Calcola il Risultato'}
                </button>
            </div>
        </>
    );

    const renderResult = () => (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-4">Il tuo Resoconto</h2>
            <div className="text-center mb-6">
                <p className="text-gray-600">Il tuo punteggio è:</p>
                <p className="text-5xl font-bold text-sky-600 my-2">{score}</p>
                <p className="text-gray-500 text-sm">(su un massimo di 100)</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-gray-700 prose max-w-none">
                {renderMarkdown(result)}
            </div>
            <div className="mt-8 text-center">
                <button
                    onClick={resetTest}
                    className="bg-amber-500 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 ease-in-out hover:bg-amber-600 shadow-md hover:shadow-lg"
                >
                    Rifai il Test
                </button>
            </div>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <button onClick={onGoHome} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold mb-8 transition-colors">
                    <ArrowLeftIcon />
                    {backButtonText}
                </button>

                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Test di Autovalutazione sul Giudice Interiore</h1>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-r-lg mt-4">
                        <h2 className="font-bold">Disclaimer Importante</h2>
                        <p className="mt-1">Questo test non ha alcun valore diagnostico e non sostituisce in alcun modo una valutazione professionale. È uno strumento di auto-esplorazione pensato per stimolare la riflessione personale e aumentare la consapevolezza sulla propria voce critica interiore.</p>
                    </div>
                </div>
                
                {isLoading ? <LoadingSpinner /> : (showResult ? renderResult() : renderTest())}
                
                <footer className="text-center py-8 mt-12">
                    <p className="text-gray-500">&copy; {new Date().getFullYear()} Hub Competenze Counseling. Tutti i diritti riservati.</p>
                </footer>
            </div>
        </div>
    );
};

export default InnerCriticTest;