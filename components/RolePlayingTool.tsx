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

const CLIENT_SENTENCES = [
    "Non so più cosa fare, mi sento completamente bloccato al lavoro.",
    "Continuo a litigare con il mio partner per le stesse cose, è estenuante.",
    "Mi sento così solo da quando mi sono trasferito in questa nuova città.",
    "Ho paura di non essere all'altezza delle aspettative dei miei genitori.",
    "A volte penso di non avere un vero scopo nella vita.",
    "Sono arrabbiato perché nessuno sembra capire quello che sto passando.",
    "Mi sento frustrato perché i miei sforzi non vengono mai riconosciuti.",
    "È un caos totale. Il mio capo mi ha dato questo progetto impossibile, a casa i bambini sono malati e mio marito pensa solo alla sua partita di calcetto. Non so come farò a gestire tutto.",
    "Da una parte vorrei cambiare lavoro perché questo non mi soddisfa più, ma dall'altra ho paura di lasciare la sicurezza che ho. E poi c'è il mutuo da pagare... sono paralizzato.",
    "Tutti mi dicono che dovrei essere felice, ho una bella famiglia, un buon lavoro... ma dentro mi sento vuoto, come se stessi recitando una parte. Non capisco perché."
];

const REFORMULATION_TYPES = {
    general: {
        title: "Riformulazione Generale",
        promptInstruction: "L'obiettivo dello studente è formulare una 'riformulazione rogersiana', che consiste nel riflettere il sentimento e il significato del cliente in modo empatico e non giudicante."
    },
    simple: {
        title: "Riflessione Semplice",
        description: "Si rimanda all’altro l’equivalente del contenuto del messaggio ricevuto, ripetendo le sue stesse parole. Evita che la comunicazione diventi un dialogo tra persone che non si capiscono bene.",
        example: "Esempio: “Mi stai dicendo che …”",
        promptInstruction: "Lo studente sta praticando la 'Riflessione Semplice'. Valuta specificamente se la sua risposta ripete il contenuto del messaggio del cliente con parole equivalenti per mostrare comprensione, come nell'esempio 'Mi stai dicendo che...'.",
    },
    echo: {
        title: "Riformulazione Eco",
        description: "Consiste nel ripetere le ultime, o l’ultima parola del cliente o una che si ritiene importante.",
        example: "Esempio: Cliente: “Oggi sono un po’ triste…” Counselor: “Triste…”",
        promptInstruction: "Lo studente sta praticando la 'Riformulazione Eco'. Valuta specificamente se la sua risposta ripete una o più parole chiave finali o importanti della frase del cliente, per incoraggiare l'approfondimento.",
    },
    paraphrase: {
        title: "Parafrasi",
        description: "Si ridicono gli stessi concetti, ma con parole diverse.",
        example: "Esempio: Cliente: “Oggi sono un po’ triste…” Counselor: “Mi stai dicendo che oggi sei un poco giù di tono…”",
        promptInstruction: "Lo studente sta praticando la 'Parafrasi'. Valuta specificamente se la sua risposta riesprime il concetto principale del cliente usando parole diverse, per dimostrare una profonda comprensione del contenuto.",
    },
    elucidation: {
        title: "Delucidazione",
        description: "Si restituiscono al cliente anche i suoi sentimenti, sottolineandoli. Si opera un cambio figura/sfondo, portando l'emozione in primo piano. Da usare con cautela.",
        example: "Esempio: “Cosa provi ora mentre mi dici questo?”",
        promptInstruction: "Lo studente sta praticando la 'Delucidazione'. L'obiettivo è portare in primo piano i sentimenti sottostanti del cliente. Valuta se la risposta mette in luce l'emozione implicita nel messaggio, ad esempio attraverso una riflessione del sentimento o una domanda aperta che esplori il vissuto emotivo (come nell'esempio: 'Cosa provi ora...?'). Questa non è una domanda investigativa, ma un invito a esplorare l'emozione.",
    },
    summary: {
        title: "Riepilogo",
        description: "Si riassume l’espressione caotica del cliente. Molto utile nei momenti di confusione per aiutare il contenuto quando non è chiaro.",
        example: "Esempio: 'Quindi, se ho capito bene, da un lato ti senti sopraffatto dalle responsabilità, e dall'altro c'è questa sensazione di vuoto. È così?'",
        promptInstruction: "Lo studente sta praticando il 'Riepilogo'. L'obiettivo è sintetizzare i punti chiave di un'espressione confusa o complessa del cliente in un insieme coerente. Valuta se la risposta raccoglie e ordina i diversi temi o sentimenti espressi dal cliente, aiutandolo a fare chiarezza, senza aggiungere interpretazioni o soluzioni.",
    }
};

interface RolePlayingToolProps {
  onGoHome: () => void;
  onExerciseComplete: () => void;
}

const RolePlayingTool: React.FC<RolePlayingToolProps> = ({ onGoHome, onExerciseComplete }) => {
    const [reformulationType, setReformulationType] = useState<keyof typeof REFORMULATION_TYPES | null>(null);
    const [clientSentence, setClientSentence] = useState('');
    const [studentResponse, setStudentResponse] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (reformulationType) {
            setNewSentence();
        }
    }, [reformulationType]);

    const cleanUpState = () => {
        setStudentResponse('');
        setFeedback('');
        setError('');
    };

    const setNewSentence = () => {
        cleanUpState();
        const randomIndex = Math.floor(Math.random() * CLIENT_SENTENCES.length);
        let newSentence = CLIENT_SENTENCES[randomIndex];
        if (CLIENT_SENTENCES.length > 1) {
            while (newSentence === clientSentence) {
                const newIndex = Math.floor(Math.random() * CLIENT_SENTENCES.length);
                newSentence = CLIENT_SENTENCES[newIndex];
            }
        }
        setClientSentence(newSentence);
    };

    const handleSelectType = (type: keyof typeof REFORMULATION_TYPES) => {
        setReformulationType(type);
    };
    
    const handleBackToSelection = () => {
        setReformulationType(null);
        cleanUpState();
    }

    const handleGenerateFeedback = async () => {
        if (!studentResponse.trim() || !reformulationType) {
            setError("Per favore, inserisci la tua riformulazione.");
            return;
        }
        setIsLoading(true);
        setError('');
        setFeedback('');

        try {
            const typeInstruction = REFORMULATION_TYPES[reformulationType].promptInstruction;
            
            const prompt = `Sei un supervisore esperto di counseling specializzato nell'approccio centrato sulla persona di Carl Rogers. Il tuo compito è valutare la risposta di uno studente di counseling alla frase di un cliente.
${typeInstruction}

Indipendentemente dalla tecnica specifica, la riformulazione DEVE SEMPRE EVITARE le "risposte trappola", conosciute con l'acronimo VISSI:
- Valutare: Esprimere giudizi di valore (es. "Hai fatto bene", "Non dovresti sentirti così").
- Interpretare: Spiegare al cliente il significato nascosto dei suoi pensieri o comportamenti (es. "Probabilmente reagisci così perché...").
- Soluzionare: Dare consigli o suggerire soluzioni (es. "Dovresti provare a...").
- Sostenere: Offrire rassicurazioni premature o minimizzare (es. "Vedrai che andrà tutto bene", "Non è così grave").
- Investigare: Fare domande chiuse o per raccogliere dati, spostando il focus dal vissuto emotivo del cliente (es. "Da quanto tempo ti senti così?", "Chi altro c'era?").

Analizza la 'Frase del Cliente' e la 'Riformulazione dello Studente'. Fornisci un feedback costruttivo in formato Markdown.

Il feedback deve essere strutturato così (usa ** per i titoli):
**Valutazione Generale:**
Una valutazione sintetica sulla tecnica specifica richiesta (es. "Ottima Riformulazione Eco", "Riflessione Semplice Efficace", "Buon Tentativo con Elementi da Migliorare", "Risposta Trappola: Consiglio").
**Analisi della Risposta:**
Spiega perché la riformulazione è (o non è) efficace, collegandoti ai principi della tecnica scelta e ai principi rogersiani generali.
**Verifica VISSI:**
Identifica esplicitamente se la risposta cade in una delle categorie VISSI. Se sì, spiega quale e perché.
**Esempi Migliorativi:**
Offri 1 o 2 esempi concreti della tecnica di riformulazione specifica richiesta per la frase del cliente.
**Incoraggiamento Finale:**
Una breve frase positiva per motivare lo studente.

---
**Frase del Cliente:** "${clientSentence}"
---
**Riformulazione dello Studente:** "${studentResponse}"
---`;

            const res = await fetch('/.netlify/functions/generateFeedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            if (!res.ok) {
                throw new Error(`Error: ${res.statusText}`);
            }

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
            if (line.startsWith('* ')) {
                return <li key={index} className="ml-5 list-disc">{line.substring(2)}</li>;
            }
            return <p key={index} className="mb-2">{line}</p>;
        });
    };

    const renderSelectionScreen = () => (
        <>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Esercizio di Riformulazione</h1>
            <p className="text-gray-600 mb-8">Scegli su quale tipo di riformulazione vuoi esercitarti.</p>
            <div className="space-y-4">
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                    <h2 className="text-xl font-bold text-sky-700">{REFORMULATION_TYPES.simple.title}</h2>
                    <p className="text-gray-600 mt-2">{REFORMULATION_TYPES.simple.description}</p>
                    <p className="text-gray-500 italic mt-1">{REFORMULATION_TYPES.simple.example}</p>
                    <button onClick={() => handleSelectType('simple')} className="mt-4 bg-sky-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-sky-700 transition-colors">Inizia</button>
                </div>
                 <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                    <h2 className="text-xl font-bold text-sky-700">{REFORMULATION_TYPES.echo.title}</h2>
                    <p className="text-gray-600 mt-2">{REFORMULATION_TYPES.echo.description}</p>
                    <p className="text-gray-500 italic mt-1">{REFORMULATION_TYPES.echo.example}</p>
                    <button onClick={() => handleSelectType('echo')} className="mt-4 bg-sky-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-sky-700 transition-colors">Inizia</button>
                </div>
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                    <h2 className="text-xl font-bold text-sky-700">{REFORMULATION_TYPES.paraphrase.title}</h2>
                    <p className="text-gray-600 mt-2">{REFORMULATION_TYPES.paraphrase.description}</p>
                    <p className="text-gray-500 italic mt-1">{REFORMULATION_TYPES.paraphrase.example}</p>
                    <button onClick={() => handleSelectType('paraphrase')} className="mt-4 bg-sky-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-sky-700 transition-colors">Inizia</button>
                </div>
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                    <h2 className="text-xl font-bold text-sky-700">{REFORMULATION_TYPES.elucidation.title}</h2>
                    <p className="text-gray-600 mt-2">{REFORMULATION_TYPES.elucidation.description}</p>
                    <p className="text-gray-500 italic mt-1">{REFORMULATION_TYPES.elucidation.example}</p>
                    <button onClick={() => handleSelectType('elucidation')} className="mt-4 bg-sky-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-sky-700 transition-colors">Inizia</button>
                </div>
                 <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                    <h2 className="text-xl font-bold text-sky-700">{REFORMULATION_TYPES.summary.title}</h2>
                    <p className="text-gray-600 mt-2">{REFORMULATION_TYPES.summary.description}</p>
                    <p className="text-gray-500 italic mt-1">{REFORMULATION_TYPES.summary.example}</p>
                    <button onClick={() => handleSelectType('summary')} className="mt-4 bg-sky-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-sky-700 transition-colors">Inizia</button>
                </div>
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                    <h2 className="text-xl font-bold text-sky-700">{REFORMULATION_TYPES.general.title}</h2>
                    <p className="text-gray-600 mt-2">Un esercizio generale per riflettere il sentimento e il significato del cliente in modo empatico e non giudicante.</p>
                    <button onClick={() => handleSelectType('general')} className="mt-4 bg-gray-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-gray-700 transition-colors">Inizia</button>
                </div>
            </div>
        </>
    );

    const renderExerciseScreen = () => (
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
             <button onClick={handleBackToSelection} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold mb-6 text-sm transition-colors">
                    <ArrowLeftIcon />
                    Cambia tipo di esercizio
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Esercizio: {reformulationType && REFORMULATION_TYPES[reformulationType].title}</h1>
            <p className="text-gray-600 mb-6">Leggi la frase del cliente e prova a riformularla secondo la tecnica scelta, evitando le trappole del VISSI.</p>
            
            <div className="relative bg-sky-50 border-l-4 border-sky-500 text-sky-800 p-4 rounded-r-lg mb-6">
                <p className="font-semibold">Frase del Cliente:</p>
                <p className="text-lg italic pr-12">"{clientSentence}"</p>
                <button
                    onClick={setNewSentence}
                    disabled={isLoading}
                    className="absolute top-1/2 right-4 -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors text-gray-600 disabled:bg-gray-200 disabled:cursor-not-allowed"
                    aria-label="Genera una nuova frase"
                    title="Genera una nuova frase"
                >
                    <RefreshIcon />
                </button>
            </div>

            <div>
                <label htmlFor="student-response" className="block text-md font-semibold text-gray-700 mb-2">La tua Riformulazione:</label>
                <textarea
                    id="student-response"
                    rows={4}
                    value={studentResponse}
                    onChange={(e) => setStudentResponse(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition shadow-sm"
                    placeholder="Scrivi qui la tua riformulazione..."
                    aria-label="La tua Riformulazione"
                />
            </div>

            {error && <p className="text-red-600 mt-2">{error}</p>}

            <div className="mt-6 text-center">
                <button
                    onClick={handleGenerateFeedback}
                    disabled={isLoading}
                    className="bg-sky-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 ease-in-out hover:bg-sky-700 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Analisi in corso...' : 'Valuta la mia risposta'}
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
                         <button
                             onClick={setNewSentence}
                             className="bg-amber-500 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 ease-in-out hover:bg-amber-600 shadow-md hover:shadow-lg"
                         >
                             Prossima Frase
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

                {!reformulationType ? renderSelectionScreen() : renderExerciseScreen()}
                
                 <footer className="text-center py-8 mt-12">
                    <p className="text-gray-500">&copy; {new Date().getFullYear()} Hub Competenze Counseling. Tutti i diritti riservati.</p>
                </footer>
            </div>
        </div>
    );
};

export default RolePlayingTool;