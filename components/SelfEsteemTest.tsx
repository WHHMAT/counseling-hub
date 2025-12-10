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
    { text: "In generale, sono soddisfatto/a di me stesso/a.", positive: true },
    { text: "A volte penso di non valere assolutamente nulla.", positive: false },
    { text: "Sento di avere un certo numero di buone qualità.", positive: true },
    { text: "Sono in grado di fare le cose bene come la maggior parte delle altre persone.", positive: true },
    { text: "Sento di non avere molto di cui essere orgoglioso/a.", positive: false },
    { text: "A volte mi sento davvero inutile.", positive: false },
    { text: "Sento di essere una persona di valore, almeno alla pari degli altri.", positive: true },
    { text: "Vorrei poter avere più rispetto per me stesso/a.", positive: false },
    { text: "Tutto sommato, tendo a pensare di essere un fallimento.", positive: false },
    { text: "Ho un atteggiamento positivo verso me stesso/a.", positive: true },
    { text: "Accetto i miei difetti e le mie imperfezioni.", positive: true },
    { text: "Tendo a confrontarmi spesso con gli altri e a sentirmi inferiore.", positive: false },
    { text: "Mi sento a mio agio nel prendere decisioni importanti.", positive: true },
    { text: "Ho fiducia nelle mie opinioni, anche se diverse da quelle degli altri.", positive: true },
    { text: "Spesso critico me stesso/a per i miei errori.", positive: false },
    { text: "Credo di meritare amore e rispetto.", positive: true },
    { text: "Fatico ad accettare complimenti.", positive: false },
    { text: "Mi sento sicuro/a delle mie capacità.", positive: true },
    { text: "Penso di essere una persona interessante.", positive: true },
    { text: "Mi preoccupo molto di ciò che gli altri pensano di me.", positive: false },
    { text: "Sono in grado di gestire le critiche senza sentirmi attaccato/a personalmente.", positive: true },
    { text: "Mi sento in colpa per aver dedicato del tempo a me stesso/a.", positive: false },
    { text: "Riesco a riprendermi abbastanza in fretta dopo una delusione.", positive: true },
    { text: "Esprimo i miei bisogni e desideri in modo chiaro e rispettoso.", positive: true },
    { text: "Tendo a concentrarmi sui miei insuccessi piuttosto che sui miei successi.", positive: false },
    { text: "Mi sento degno/a di felicità e successo.", positive: true },
    { text: "Evito di provare cose nuove per paura di fallire.", positive: false },
    { text: "Sono orgoglioso/a di chi sono.", positive: true },
    { text: "Spesso metto i bisogni degli altri prima dei miei, a mio discapito.", positive: false },
    { text: "Affronto le sfide con un atteggiamento ottimista.", positive: true }
];

interface SelfEsteemTestProps {
  onGoHome: () => void;
  onExerciseComplete: () => void;
  backButtonText?: string;
}

const SelfEsteemTest: React.FC<SelfEsteemTestProps> = ({ onGoHome, onExerciseComplete, backButtonText = "Torna al menu principale" }) => {
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
            const score = question.positive ? answerValue : 6 - answerValue;
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

        const prompt = `Sei un counselor esperto che sta commentando il risultato di un test di autovalutazione sull'autostima. Il test non è diagnostico. Il tuo tono deve essere incoraggiante, riflessivo e non giudicante.

Il punteggio totale del test va da 30 (bassa autostima) a 150 (alta autostima).
Puoi considerare queste fasce indicative:
- 30-70: Area che potrebbe beneficiare di una profonda riflessione e cura.
- 71-110: Livello di autostima nella media, con un equilibrio di punti di forza e aree di miglioramento.
- 111-150: Livello di autostima tendenzialmente alto e solido.

L'utente ha ottenuto un punteggio di: ${totalScore}.

Fornisci un'analisi in formato Markdown, strutturata come segue (usa ** per i titoli):

**Interpretazione del tuo Punteggio:**
Spiega cosa potrebbe significare questo punteggio in termini generali, usando un linguaggio accessibile, empatico e non clinico.

**Punti di Forza Emergenti:**
Basandoti sul punteggio, ipotizza quali potrebbero essere i punti di forza della persona in relazione alla sua autostima.

**Aree di Riflessione:**
Suggerisci delicatamente alcune aree su cui la persona potrebbe voler riflettere per coltivare ulteriormente la propria autostima. Offri spunti e domande aperte, non soluzioni o consigli diretti.

**Conclusione Incoraggiante:**
Termina con un messaggio positivo che ricordi all'utente che l'autostima è un percorso dinamico e in continua evoluzione, e che questo test è solo una fotografia di un momento.`;

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
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Test di Autovalutazione sull'Autostima</h1>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-r-lg mt-4">
                        <h2 className="font-bold">Disclaimer Importante</h2>
                        <p className="mt-1">Questo test non ha alcun valore diagnostico e non sostituisce in alcun modo una valutazione professionale. È uno strumento di auto-esplorazione pensato per stimolare la riflessione personale sul tema dell'autostima.</p>
                    </div>
                </div>
                
                {isLoading ? <LoadingSpinner /> : (showResult ? renderResult() : renderTest())}
                
            </div>
        </div>
    );
};

// FIX: Added default export to make the component available for import.
export default SelfEsteemTest;