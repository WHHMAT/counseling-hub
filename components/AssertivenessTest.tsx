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
    { text: "Esprimo le mie opinioni con fiducia, anche se sono diverse da quelle degli altri.", positive: true },
    { text: "Fatico a dire 'no' alle richieste degli altri, anche quando sono oberato/a.", positive: false },
    { text: "Quando ho un problema con qualcuno, glielo dico direttamente in modo calmo e rispettoso.", positive: true },
    { text: "Tendo a tenere per me i miei sentimenti per evitare conflitti.", positive: false },
    { text: "Sono in grado di chiedere ciò di cui ho bisogno o ciò che voglio.", positive: true },
    { text: "Spesso mi scuso anche quando non ho fatto nulla di male.", positive: false },
    { text: "Se qualcuno mi tratta ingiustamente, sono in grado di farglielo notare.", positive: true },
    { text: "Preferisco subire un'ingiustizia piuttosto che creare una discussione.", positive: false },
    { text: "So accettare un complimento senza sminuirmi.", positive: true },
    { text: "Se un servizio non è all'altezza (es. al ristorante), fatico a farlo presente.", positive: false },
    { text: "Mi sento a mio agio nel dare un feedback costruttivo agli altri.", positive: true },
    { text: "Permetto agli altri di prendere decisioni per me.", positive: false },
    { text: "Mantengo il contatto visivo durante le conversazioni importanti.", positive: true },
    { text: "Parlo con un tono di voce esitante quando esprimo le mie esigenze.", positive: false },
    { text: "Sono in grado di ricevere critiche costruttive senza mettermi sulla difensiva.", positive: true },
    { text: "Mi sento responsabile della felicità degli altri.", positive: false },
    { text: "Quando non sono d'accordo con una decisione di gruppo, esprimo il mio punto di vista.", positive: true },
    { text: "Mi sento ansioso/a all'idea di dover affrontare qualcuno.", positive: false },
    { text: "So negoziare per trovare un compromesso che soddisfi anche le mie esigenze.", positive: true },
    { text: "Do più importanza ai bisogni degli altri che ai miei.", positive: false },
    { text: "Quando faccio un errore, lo ammetto senza troppe giustificazioni.", positive: true },
    { text: "Mi sento in colpa quando metto i miei bisogni al primo posto.", positive: false },
    { text: "So difendere i miei diritti in modo rispettoso.", positive: true },
    { text: "Evito di chiedere favori perché non voglio disturbare.", positive: false },
    { text: "Se qualcuno interrompe mentre parlo, sono in grado di riprendere la parola.", positive: true },
    { text: "Ho paura che esprimere i miei veri sentimenti possa danneggiare le mie relazioni.", positive: false },
    { text: "So iniziare una conversazione con persone che non conosco.", positive: true },
    { text: "Lascio che gli altri si prendano il merito del mio lavoro.", positive: false },
    { text: "Se ho bisogno di aiuto, lo chiedo apertamente.", positive: true },
    { text: "Mi sento spesso sfruttato/a o non considerato/a dagli altri.", positive: false }
];

interface AssertivenessTestProps {
  onGoHome: () => void;
  onExerciseComplete: () => void;
  backButtonText?: string;
}

const AssertivenessTest: React.FC<AssertivenessTestProps> = ({ onGoHome, onExerciseComplete, backButtonText = "Torna al menu principale" }) => {
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

        const prompt = `Sei un counselor esperto in comunicazione assertiva. Stai commentando il risultato di un test di autovalutazione sull'assertività. Il test non è diagnostico. Il tuo tono deve essere incoraggiante, chiaro e orientato alla crescita.

Il punteggio totale del test va da 30 (bassa assertività) a 150 (alta assertività).
Puoi considerare queste fasce indicative:
- 30-70: Stile comunicativo che tende al passivo, con difficoltà a esprimere bisogni e opinioni.
- 71-110: Stile comunicativo misto, con abilità assertive presenti in alcuni contesti ma non in altri.
- 111-150: Stile comunicativo prevalentemente assertivo, con una buona capacità di esprimersi in modo efficace e rispettoso.

L'utente ha ottenuto un punteggio di: ${totalScore}.

Fornisci un'analisi in formato Markdown, strutturata come segue (usa ** per i titoli):

**Interpretazione del tuo Punteggio:**
Spiega cosa potrebbe significare questo punteggio in termini di stile comunicativo (passivo, assertivo, aggressivo). Sottolinea che l'assertività è un'abilità che si può apprendere e migliorare con la pratica.

**Possibili Punti di Forza Assertivi:**
Basandoti sul punteggio, ipotizza quali potrebbero essere le aree in cui la persona dimostra già una buona assertività (es. esprimere opinioni, difendere i propri diritti, gestire i complimenti).

**Spunti di Riflessione per la Crescita:**
Suggerisci delicatamente alcune aree su cui la persona potrebbe voler riflettere. Poni domande aperte per stimolare la consapevolezza. (Es: "In quali situazioni o con quali persone ti risulta più difficile dire 'no'?", "Cosa temi possa accadere se esprimi un'opinione impopolare?", "Come potresti iniziare a fare una piccola richiesta in modo diretto questa settimana?").

**Conclusione Incoraggiante:**
Termina con un messaggio positivo, ricordando che la comunicazione assertiva migliora le relazioni, aumenta l'autostima e riduce lo stress, e che ogni passo verso una maggiore assertività è una vittoria.`;


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
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <button onClick={onGoHome} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold mb-8 transition-colors">
                    <ArrowLeftIcon />
                    {backButtonText}
                </button>

                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Test di Autovalutazione sull'Assertività</h1>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-r-lg mt-4">
                        <h2 className="font-bold">Disclaimer Importante</h2>
                        <p className="mt-1">Questo test non ha alcun valore diagnostico e non sostituisce in alcun modo una valutazione professionale. È uno strumento di auto-esplorazione pensato per stimolare la riflessione personale sul tuo stile comunicativo.</p>
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

export default AssertivenessTest;