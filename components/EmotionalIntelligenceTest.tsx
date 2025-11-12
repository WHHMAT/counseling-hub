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
    { text: "Riconosco le mie emozioni mentre le provo.", positive: true },
    { text: "Spesso non mi rendo conto del mio stato d'animo.", positive: false },
    { text: "Quando sono arrabbiato/a, riesco a calmarmi in tempi ragionevoli.", positive: true },
    { text: "Le mie emozioni tendono a prendere il sopravvento su di me.", positive: false },
    { text: "Sono in grado di motivarmi a portare a termine compiti anche quando non ne ho voglia.", positive: true },
    { text: "Fatico a rimanere concentrato/a sui miei obiettivi a lungo termine.", positive: false },
    { text: "Capisco facilmente come si sentono gli altri, anche se non lo dicono esplicitamente.", positive: true },
    { text: "A volte trovo difficile capire il punto di vista di un'altra persona.", positive: false },
    { text: "Sono bravo/a a gestire i conflitti e a trovare soluzioni che vadano bene a tutti.", positive: true },
    { text: "Tendo a evitare le conversazioni difficili.", positive: false },
    { text: "So identificare le cause scatenanti dei miei cambiamenti d'umore.", positive: true },
    { text: "Agisco d'impulso quando provo emozioni forti.", positive: false },
    { text: "Riesco a rimanere ottimista anche di fronte alle difficoltà.", positive: true },
    { text: "Le critiche mi scoraggiano facilmente.", positive: false },
    { text: "Sono sensibile ai segnali non verbali degli altri (linguaggio del corpo, tono di voce).", positive: true },
    { text: "A volte le mie parole feriscono gli altri senza che me ne renda conto.", positive: false },
    { text: "Sono considerato/a una persona a cui è facile confidarsi.", positive: true },
    { text: "Fatico a lavorare in gruppo e a collaborare efficacemente.", positive: false },
    { text: "So distinguere tra emozioni simili, come rabbia e frustrazione, o delusione e tristezza.", positive: true },
    { text: "Quando sono stressato/a, fatico a pensare chiaramente.", positive: false },
    { text: "La passione per quello che faccio è una grande fonte di energia per me.", positive: true },
    { text: "Le battute d'arresto mi fanno dubitare di tutte le mie capacità.", positive: false },
    { text: "Mostro empatia e preoccupazione per gli altri quando sono in difficoltà.", positive: true },
    { text: "A volte posso sembrare freddo/a o distante senza volerlo.", positive: false },
    { text: "Sono bravo/a a costruire e mantenere relazioni positive.", positive: true },
    { text: "Trovo difficile persuadere o influenzare positivamente gli altri.", positive: false },
    { text: "Accetto le mie emozioni, anche quelle negative, senza giudicarmi.", positive: true },
    { text: "Tendo a rimuginare a lungo sui miei sentimenti negativi.", positive: false },
    { text: "Sono in grado di adattare il mio comportamento a diverse situazioni sociali.", positive: true },
    { text: "Mi sento a disagio in situazioni sociali nuove o complesse.", positive: false }
];


interface EmotionalIntelligenceTestProps {
  onGoHome: () => void;
  onExerciseComplete: () => void;
  backButtonText?: string;
}

const EmotionalIntelligenceTest: React.FC<EmotionalIntelligenceTestProps> = ({ onGoHome, onExerciseComplete, backButtonText = "Torna al menu principale" }) => {
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
            // Punteggio alto = intelligenza emotiva alta
            const score = question.positive ? answerValue : 6 - answerValue;
            return total + (score -1); // Normalizzo da 0 a 4
        }, 0);
    };

    const handleCalculateResult = async () => {
        if (Object.keys(answers).length < QUESTIONS.length) {
            setError("Per favore, rispondi a tutte le domande prima di calcolare il risultato.");
            return;
        }

        setIsLoading(true);
        setError('');
        const totalScore = calculateScore() + 30; // Riporto la scala a 30-150
        setScore(totalScore);

        const prompt = `Sei un counselor esperto in intelligenza emotiva. Stai commentando il risultato di un test di autovalutazione. Il test non è diagnostico. Il tuo tono deve essere incoraggiante, chiaro e focalizzato sulla crescita.

Il punteggio totale del test va da 30 (bassa intelligenza emotiva) a 150 (alta intelligenza emotiva).
Puoi considerare queste fasce indicative:
- 30-70: Area che suggerisce che ci sono significative opportunità di crescita nella consapevolezza e gestione delle emozioni.
- 71-110: Livello di intelligenza emotiva nella media, con un probabile equilibrio tra aree di competenza e aree da potenziare.
- 111-150: Livello di intelligenza emotiva tendenzialmente alto, indicativo di una buona padronanza delle competenze emotive.

L'utente ha ottenuto un punteggio di: ${totalScore}.

Fornisci un'analisi in formato Markdown, strutturata come segue (usa ** per i titoli):

**Interpretazione del tuo Punteggio:**
Spiega cosa potrebbe significare questo punteggio in termini generali di intelligenza emotiva. Sottolinea che l'IE è un insieme di abilità che possono essere sviluppate nel tempo.

**Possibili Punti di Forza nelle 5 Aree:**
Basandoti sul punteggio, ipotizza quali delle 5 aree dell'intelligenza emotiva (Autoconsapevolezza, Autoregolazione, Motivazione, Empatia, Abilità Sociali) potrebbero essere dei punti di forza. Sii generico e possibilista.

**Spunti di Riflessione per la Crescita:**
Suggerisci delicatamente alcune domande aperte per riflettere sulle aree che potrebbero beneficiare di maggiore attenzione. Collega le domande alle 5 aree. (Es: Per l'empatia: "In quali situazioni ti risulta più difficile metterti nei panni degli altri?", Per l'autoregolazione: "Quali strategie usi attualmente per gestire lo stress o la rabbia?").

**Conclusione Incoraggiante:**
Termina con un messaggio positivo, ricordando che la consapevolezza è il primo passo e che ogni sforzo per comprendere meglio sé stessi e gli altri è un segno di grande forza.`;


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
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Test di Autovalutazione sull'Intelligenza Emotiva</h1>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-r-lg mt-4">
                        <h2 className="font-bold">Disclaimer Importante</h2>
                        <p className="mt-1">Questo test non ha alcun valore diagnostico e non sostituisce in alcun modo una valutazione professionale. È uno strumento di auto-esplorazione pensato per stimolare la riflessione personale sulla tua capacità di riconoscere, comprendere e gestire le emozioni.</p>
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

export default EmotionalIntelligenceTest;
