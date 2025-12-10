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
    { text: "Dico 'no' a richieste che non voglio o non posso soddisfare, senza sentirmi eccessivamente in colpa.", positive: true },
    { text: "Mi sento responsabile per le emozioni degli altri e cerco di 'risolverle' per loro.", positive: false },
    { text: "Comunico chiaramente i miei bisogni e limiti nelle relazioni importanti.", positive: true },
    { text: "Spesso mi ritrovo a fare cose per gli altri anche se sono stanco/a o sovraccarico/a.", positive: false },
    { text: "Riesco a dedicare del tempo a me stesso/a senza sentirmi egoista.", positive: true },
    { text: "Fatico a esprimere un'opinione diversa da quella del gruppo per paura del conflitto o del rifiuto.", positive: false },
    { text: "Mi sento a mio agio nel terminare una conversazione che mi sta mettendo a disagio.", positive: true },
    { text: "Permetto agli altri di interrompermi o parlare sopra di me frequentemente.", positive: false },
    { text: "Riconosco quando le mie risorse (tempo, energia) sono al limite e agisco di conseguenza.", positive: true },
    { text: "Mi lamento spesso del comportamento degli altri, ma fatico a chiedere loro direttamente di cambiare.", positive: false },
    { text: "I miei valori guidano le mie decisioni, anche se vanno contro le aspettative esterne.", positive: true },
    { text: "Mi sento prosciugato/a dopo aver passato del tempo con certe persone.", positive: false },
    { text: "Sono in grado di accettare un 'no' da parte degli altri senza prenderla sul personale.", positive: true },
    { text: "Tendo a giustificare eccessivamente le mie decisioni e le mie scelte.", positive: false },
    { text: "Ho relazioni in cui mi sento rispettato/a e ascoltato/a.", positive: true },
    { text: "Condivido informazioni personali molto intime troppo presto in una nuova conoscenza.", positive: false },
    { text: "Mi sento in diritto di proteggere il mio spazio fisico e il mio tempo.", positive: true },
    { text: "Sul lavoro, mi faccio carico di compiti che non mi competono per dimostrare il mio valore.", positive: false },
    { text: "Riesco a distinguere tra i miei sentimenti e quelli delle persone a me vicine.", positive: true },
    { text: "Credo che stabilire dei confini possa danneggiare le mie relazioni.", positive: false }
];


interface BoundariesTestProps {
  onGoHome: () => void;
  onExerciseComplete: () => void;
  backButtonText?: string;
}

const BoundariesTest: React.FC<BoundariesTestProps> = ({ onGoHome, onExerciseComplete, backButtonText = "Torna al menu principale" }) => {
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
            // Punteggio alto = confini sani
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

        const prompt = `Sei un counselor esperto che sta commentando il risultato di un test di autovalutazione sulla capacità di stabilire sani confini personali. Il test non è diagnostico. Il tuo tono deve essere incoraggiante, chiaro e non giudicante.

Il punteggio totale del test va da 20 (difficoltà a stabilire confini) a 100 (solida capacità di stabilire confini).
Puoi considerare queste fasce indicative:
- 20-45: Area che suggerisce una significativa difficoltà nel riconoscere e/o attuare confini sani.
- 46-75: Capacità di stabilire confini variabile, con punti di forza in alcuni contesti e vulnerabilità in altri.
- 76-100: Buona o eccellente capacità di stabilire e mantenere confini sani in modo flessibile e consapevole.

L'utente ha ottenuto un punteggio di: ${totalScore}.

Fornisci un'analisi in formato Markdown, strutturata come segue (usa ** per i titoli):

**Interpretazione del tuo Punteggio:**
Spiega cosa potrebbe significare questo punteggio in termini di gestione dei confini personali. Usa un linguaggio empatico, sottolineando che i confini sono un'abilità che si apprende.

**Possibili Punti di Forza:**
Basandoti sul punteggio, ipotizza quali potrebbero essere gli ambiti in cui la persona riesce già a stabilire buoni confini (es. sul lavoro, nelle amicizie, nel proteggere il proprio tempo).

**Spunti di Riflessione:**
Suggerisci delicatamente alcune aree su cui la persona potrebbe voler riflettere. Poni domande aperte. (Es: "In quali situazioni senti più difficile dire 'no'?", "Cosa temi possa accadere se comunichi un tuo bisogno?", "Come potresti iniziare a creare un piccolo spazio per te questa settimana?").

**Conclusione Incoraggiante:**
Termina con un messaggio positivo, ricordando che imparare a gestire i confini è un atto di cura verso sé stessi e verso gli altri, e che ogni piccolo passo è un grande successo.`;

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
        <div className="bg-gray-50 min-h-screen pt-20 pb-12 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <button onClick={onGoHome} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold mb-8 transition-colors">
                    <ArrowLeftIcon />
                    {backButtonText}
                </button>

                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Test di Autovalutazione sui Confini Personali</h1>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-r-lg mt-4">
                        <h2 className="font-bold">Disclaimer Importante</h2>
                        <p className="mt-1">Questo test non ha alcun valore diagnostico e non sostituisce in alcun modo una valutazione professionale. È uno strumento di auto-esplorazione pensato per stimolare la riflessione personale sulla tua capacità di stabilire e mantenere sani confini.</p>
                    </div>
                </div>
                
                {isLoading ? <LoadingSpinner /> : (showResult ? renderResult() : renderTest())}
                
            </div>
        </div>
    );
};

export default BoundariesTest;
