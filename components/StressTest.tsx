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
    { text: "Mi sento teso/a o 'su di giri' per la maggior parte del tempo.", positive: false },
    { text: "Riesco a rilassarmi facilmente quando ne ho l'occasione.", positive: true },
    { text: "Sono irritabile o irascibile per piccole cose.", positive: false },
    { text: "Ho difficoltà a concentrarmi sui compiti da svolgere.", positive: false },
    { text: "Dormo bene e mi sveglio riposato/a.", positive: true },
    { text: "Soffro di mal di testa o tensioni muscolari (es. collo, schiena).", positive: false },
    { text: "Ho pensieri ansiosi o preoccupazioni che non riesco a fermare.", positive: false },
    { text: "Ho energia sufficiente per affrontare la giornata.", positive: true },
    { text: "Mi sento sopraffatto/a dalle mie responsabilità.", positive: false },
    { text: "Mi sento emotivamente svuotato/a.", positive: false },
    { text: "Riesco a gestire i problemi imprevisti con calma.", positive: true },
    { text: "Ho notato cambiamenti nel mio appetito (mangio più o meno del solito).", positive: false },
    { text: "Mi sento disconnesso/a dagli altri o preferisco isolarmi.", positive: false },
    { text: "Provo gioia e soddisfazione nelle mie attività quotidiane.", positive: true },
    { text: "Ho difficoltà a prendere decisioni, anche quelle semplici.", positive: false },
    { text: "Sento il cuore battere forte o avere palpitazioni senza un motivo fisico.", positive: false },
    { text: "Mi sento fiducioso/a nella mia capacità di gestire i problemi personali.", positive: true },
    { text: "Tendo a procrastinare più del solito.", positive: false },
    { text: "Soffro di problemi di stomaco (es. acidità, crampi, indigestione).", positive: false },
    { text: "Mi sento impaziente o facilmente frustrato/a.", positive: false },
    { text: "Ho tempo per hobby e attività che mi piacciono.", positive: true },
    { text: "Mi sento triste o 'giù di morale' senza un motivo apparente.", positive: false },
    { text: "Dimentico le cose più spesso del solito.", positive: false },
    { text: "Riesco a mantenere un senso dell'umorismo anche nei momenti difficili.", positive: true },
    { text: "Uso abitudini poco sane per gestire la tensione (es. fumare, bere, mangiare troppo).", positive: false },
    { text: "Mi sento inquieto/a e non riesco a stare fermo/a.", positive: false },
    { text: "Sento di avere il controllo sulla mia vita.", positive: true },
    { text: "Ho la sensazione che stia per accadere qualcosa di brutto.", positive: false },
    { text: "Le mie relazioni personali sono una fonte di supporto, non di stress.", positive: true },
    { text: "Sento che le cose non miglioreranno mai.", positive: false }
];


interface StressTestProps {
  onGoHome: () => void;
  onExerciseComplete: () => void;
  backButtonText?: string;
}

const StressTest: React.FC<StressTestProps> = ({ onGoHome, onExerciseComplete, backButtonText = "Torna al menu principale" }) => {
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
            // Punteggio alto = stress alto
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

        const prompt = `Sei un counselor esperto nella gestione dello stress. Stai commentando il risultato di un test di autovalutazione. Il test non è diagnostico. Il tuo tono deve essere rassicurante, informativo e orientato al benessere.

Il punteggio totale del test va da 30 (basso stress) a 150 (alto stress).
Puoi considerare queste fasce indicative:
- 30-70: Livello di stress basso o ben gestito.
- 71-110: Livello di stress moderato, che potrebbe iniziare a impattare su alcune aree della vita quotidiana.
- 111-150: Livello di stress alto o molto alto, che merita attenzione e strategie di gestione attive.

L'utente ha ottenuto un punteggio di: ${totalScore}.

Fornisci un'analisi in formato Markdown, strutturata come segue (usa ** per i titoli):

**Interpretazione del tuo Punteggio:**
Spiega cosa potrebbe significare questo punteggio in termini di livello di stress percepito. Normalizza l'esperienza dello stress come parte della vita, ma sottolinea l'importanza di gestirlo.

**Sintomi Potenzialmente Evidenti:**
Basandoti sul punteggio, ipotizza quali tipi di sintomi dello stress (fisici, emotivi, cognitivi, comportamentali) potrebbero essere più presenti. Sii delicato e usa un linguaggio possibilista (es. "Potresti notare...", "Alcune persone con questo livello di stress sperimentano...").

**Spunti di Riflessione per la Gestione dello Stress:**
Offri alcune domande aperte per aiutare la persona a identificare le fonti di stress e le attuali strategie di coping. (Es: "Quali sono le 3 principali fonti di pressione nella tua vita in questo momento?", "Cosa fai di solito per rilassarti? Ti aiuta davvero?", "C'è una piccola attività piacevole che potresti reintrodurre nella tua settimana?").

**Conclusione Incoraggiante:**
Termina con un messaggio positivo, ricordando che riconoscere il proprio livello di stress è il primo passo per prendersene cura e che esistono molte strategie efficaci per ritrovare l'equilibrio.`;


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

            setResult(data.feedback);
            setShowResult(true);
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
                <p className="text-gray-500 text-sm">(su un massimo di 150)</p>
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
        <div className="bg-gray-50 min-h-screen pt-20 pb-12 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <button onClick={onGoHome} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold mb-8 transition-colors">
                    <ArrowLeftIcon />
                    {backButtonText}
                </button>

                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Test di Autovalutazione sullo Stress</h1>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-r-lg mt-4">
                        <h2 className="font-bold">Disclaimer Importante</h2>
                        <p className="mt-1">Questo test non ha alcun valore diagnostico e non sostituisce in alcun modo una valutazione medica o psicologica professionale. È uno strumento di auto-esplorazione per aumentare la consapevolezza sul tuo attuale livello di stress.</p>
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

export default StressTest;