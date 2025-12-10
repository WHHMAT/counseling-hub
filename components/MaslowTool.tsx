import React, { useState, useEffect } from 'react';
import { useUserData } from '../hooks/useUserData';
import { db } from '../firebase';
import firebase from '../firebase';

const TOOL_ID = 'maslow-pyramid';

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

const CLIENT_STORIES = [
    { id: 1, story: "Sono un libero professionista e ultimamente è un disastro. Il lavoro scarseggia, ho due fatture importanti non pagate e l'affitto è in scadenza. Passo le notti a guardare il soffitto, preoccupato che da un momento all'altro mi possano sfrattare. Non riesco nemmeno a pensare a nuovi progetti o a essere creativo. Come posso concentrarmi se non so se avrò un tetto sulla testa il mese prossimo? Mi sento un fallito, tutti i miei amici hanno carriere stabili e io sono qui a contare gli spiccioli." },
    { id: 2, story: "Ho ottenuto questa promozione che sognavo da anni. Sono a capo di un team, ho un ottimo stipendio e sulla carta è tutto perfetto. Eppure... mi sento isolata. I miei vecchi colleghi ora mi vedono come 'il capo' e mantengono le distanze. Pranzano senza di me, non mi invitano più agli aperitivi. Ho lavorato così tanto per arrivare qui, e ora mi sento sola. In più, ho la costante paura di fare un errore e di deludere le aspettative di tutti, dimostrando di non essere all'altezza del ruolo." },
    { id: 3, story: "Mi sono appena laureato con il massimo dei voti. Ho fatto tutto quello che dovevo: studio matto, sacrifici, notti in bianco. Ora tutti mi chiedono 'E adesso? Che farai?'. E io non lo so. Vedo i miei compagni che si buttano in carriere prestigiose, ma a me non interessa. Mi piacerebbe fare qualcosa di mio, magari aprire un piccolo laboratorio di falegnameria, usare le mani, creare. Ma è un'idea folle, vero? Lasciare una strada sicura per... segatura e chiodi. I miei genitori sarebbero delusissimi." },
    { id: 4, story: "Da quando mia madre si è ammalata, la mia vita è solo lei. La spesa, le medicine, le visite mediche... non ho un minuto per me. Ho smesso di vedere le mie amiche, ho lasciato la palestra. A volte mi guardo allo specchio e non mi riconosco. Non sto dicendo che non le voglia bene, ma sento che sto scomparendo. Chi sono io, oltre a essere 'la figlia che si prende cura della madre'? Non ho più sogni, non ho più passioni. Esisto e basta." },
    { id: 5, story: "Ho tutto quello che un artista potrebbe desiderare: mostre, critiche positive, opere vendute a cifre che non avrei mai immaginato. Ho raggiunto tutti gli obiettivi che mi ero prefissato. E adesso? Sento un vuoto. La spinta creativa, quella fame che mi portava a dipingere per ore, si è affievolita. Ho iniziato un percorso di volontariato, insegno arte ai bambini di un quartiere difficile. È l'unica cosa che mi dà ancora un senso, vedere i loro occhi illuminarsi. Ma mi chiedo se la mia arte abbia ancora qualcosa da dire." }
];

interface MaslowToolProps {
  onGoHome: () => void;
  onExerciseComplete: (points: number, toolId: string, exerciseId: number) => void;
  userData: ReturnType<typeof useUserData>['userData'];
}

const MaslowTool: React.FC<MaslowToolProps> = ({ onGoHome, onExerciseComplete, userData }) => {
    const [clientStory, setClientStory] = useState<{ id: number; story: string } | null>(null);
    const [studentAnalysis, setStudentAnalysis] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showResetMessage, setShowResetMessage] = useState(false);

    useEffect(() => {
        setNewStory();
    }, [userData]);

    const resetUserProgressForTool = async () => {
        if (userData && firebase.auth().currentUser) {
            const userRef = db.collection('users').doc(firebase.auth().currentUser.uid);
            await userRef.update({
                [`completedExercises.${TOOL_ID}`]: []
            });
        }
    };

    const setNewStory = async () => {
        setFeedback('');
        setStudentAnalysis('');
        setError('');

        const completedStories = userData?.completedExercises?.[TOOL_ID] || [];
        let availableStories = CLIENT_STORIES.filter(story => !completedStories.includes(story.id));

        if (availableStories.length === 0 && CLIENT_STORIES.length > 0) {
            setShowResetMessage(true);
            setTimeout(() => setShowResetMessage(false), 4000);
            await resetUserProgressForTool();
            availableStories = CLIENT_STORIES;
        }

        if (availableStories.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableStories.length);
            setClientStory(availableStories[randomIndex]);
        } else {
            setClientStory({ id: 0, story: "Nessuna storia disponibile al momento." });
        }
    };

    const handleGenerateFeedback = async () => {
        if (!studentAnalysis.trim() || !clientStory) {
            setError("Per favore, inserisci la tua analisi.");
            return;
        }
        setIsLoading(true);
        setError('');
        setFeedback('');

        try {
            const prompt = `Sei un supervisore di counseling esperto, specializzato in psicologia umanistica e nella teoria della Gerarchia dei Bisogni di Abraham Maslow.

Il tuo compito è analizzare la valutazione di uno studente di counseling riguardo alla storia di un cliente. Lo studente deve identificare i bisogni del cliente e collocarli correttamente nei 5 livelli della piramide di Maslow:
1.  **Bisogni Fisiologici:** (respiro, cibo, acqua, sonno, sesso, omeostasi).
2.  **Bisogni di Sicurezza:** (sicurezza fisica, di occupazione, morale, familiare, di salute, di proprietà).
3.  **Bisogni di Appartenenza:** (amicizia, affetto familiare, intimità sessuale).
4.  **Bisogni di Stima:** (autostima, autocontrollo, realizzazione, rispetto reciproco).
5.  **Bisogni di Autorealizzazione:** (moralità, creatività, spontaneità, accettazione, assenza di pregiudizi).

Fornisci un feedback costruttivo e didattico in formato Markdown, strutturato come segue (usa ** per i titoli):

**Valutazione Generale:**
Una sintesi dell'accuratezza e della profondità dell'analisi dello studente. (Es: "Analisi molto accurata, hai colto le sfumature principali", "Hai identificato bene i bisogni di base, ma l'analisi dei livelli superiori può essere più approfondita").

**Bisogni Correttamente Identificati:**
Elenca i bisogni che lo studente ha correttamente individuato e classificato. Per ciascuno, cita una frase o un concetto dalla storia del cliente che lo conferma. (Es: "**Sicurezza:** Corretto. La sua preoccupazione per lo sfratto ('non so se avrò un tetto sulla testa') è un chiaro indicatore di un bisogno di sicurezza insoddisfatto.").

**Bisogni Mancanti o da Approfondire:**
Evidenzia eventuali bisogni importanti che lo studente ha trascurato o classificato in modo impreciso. Spiega perché quel bisogno è presente nella storia. (Es: "**Stima:** Hai omesso questo punto. Quando dice 'Mi sento un fallito' sta esprimendo un profondo bisogno di autostima e di riconoscimento.").

**Riflessioni Aggiuntive:**
Offri spunti più profondi. Ad esempio, spiega come un bisogno insoddisfatto a un livello inferiore blocchi l'emergere dei bisogni superiori (principio di Maslow). (Es: "Nota come la mancanza di sicurezza economica blocchi completamente la sua capacità di 'pensare a nuovi progetti', legata all'autorealizzazione. È un esempio perfetto di come la gerarchia funzioni nella pratica.").

**Consiglio Pratico per la Seduta:**
Suggerisci come il counselor potrebbe usare questa analisi in una sessione reale. (Es: "Una domanda potente potrebbe essere: 'Mentre mi parli della paura di perdere la casa, cosa succede al tuo sentirti un professionista capace?' Questo collega il bisogno di sicurezza a quello di stima.").

**Punteggio:**
Assegna un punteggio numerico: 10 per un'analisi accurata che coglie i bisogni a più livelli e offre spunti profondi; 5 se l'analisi identifica solo i bisogni più evidenti o li classifica in modo impreciso; 0 se l'analisi è completamente fuori strada.

---
**Storia del Cliente:** "${clientStory.story}"
---
**Analisi dello Studente:** "${studentAnalysis}"
---`;

            const res = await fetch('/.netlify/functions/generateFeedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || `Errore del server: ${res.status}`);
            }

            setFeedback(data.feedback);
            
            const scoreMatch = data.feedback.match(/\*\*Punteggio:\*\*\s*(\d+)/);
            const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;

            onExerciseComplete(score, TOOL_ID, clientStory.id);

        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : "Si è verificato un errore sconosciuto. Riprova.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const renderMarkdown = (text: string) => {
        const lines = text.split('\n');
        const renderedLines = [];
        let listBuffer: string[] = [];
    
        const flushList = (keyPrefix: string) => {
            if (listBuffer.length > 0) {
                renderedLines.push(
                    <ul key={keyPrefix} className="list-disc list-inside space-y-1 pl-2">
                        {listBuffer.map((item, idx) => <li key={`${keyPrefix}-${idx}`}>{item}</li>)}
                    </ul>
                );
                listBuffer = [];
            }
        };
    
        lines.forEach((line, index) => {
            if (line.startsWith('**') && line.endsWith('**')) {
                flushList(`list-before-header-${index}`);
                renderedLines.push(<h3 key={`header-${index}`} className="text-lg font-bold text-gray-800 mt-4 mb-2">{line.replace(/\*\*/g, '')}</h3>);
            } else if (line.match(/^\d+\.\s/) || line.startsWith('* ') || line.startsWith('- ')) {
                listBuffer.push(line.replace(/^\d+\.\s|^\*\s|^-\s/, ''));
            } else if (line.trim() === '') {
                flushList(`list-before-space-${index}`);
                renderedLines.push(<div key={`space-${index}`} className="h-2" />);
            } else {
                flushList(`list-before-p-${index}`);
                renderedLines.push(<p key={`p-${index}`} className="mb-2">{line}</p>);
            }
        });
    
        flushList('final-list');
        return renderedLines;
    };
    

    return (
        <div className="bg-gray-50 min-h-screen pt-20 pb-12 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <button onClick={onGoHome} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold mb-8 transition-colors">
                    <ArrowLeftIcon />
                    Torna al menu principale
                </button>

                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Esercizio: Analisi dei Bisogni con la Piramide di Maslow</h1>
                    <p className="text-gray-600 mb-6">Leggi la storia del cliente e identifica i suoi bisogni insoddisfatti, collocandoli nei livelli della piramide di Maslow.</p>

                    {showResetMessage && (
                        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-r-lg" role="alert">
                            <p>Complimenti, hai completato tutte le storie! Ora te le riproporremo per continuare a esercitarti.</p>
                        </div>
                    )}
                    
                    {clientStory && (
                        <div className="relative bg-sky-50 border-l-4 border-sky-500 text-sky-800 p-4 rounded-r-lg mb-6">
                            <p className="font-semibold">Storia del Cliente:</p>
                            <p className="text-lg italic">"{clientStory.story}"</p>
                            
                            <button
                                onClick={setNewStory}
                                disabled={isLoading}
                                className="absolute top-1/2 right-4 -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors text-gray-600 disabled:bg-gray-200 disabled:cursor-not-allowed"
                                aria-label="Genera una nuova storia"
                                title="Genera una nuova storia"
                            >
                                <RefreshIcon />
                            </button>
                        </div>
                    )}
                    
                    <div>
                        <label htmlFor="student-analysis" className="block text-md font-semibold text-gray-700 mb-2">La tua Analisi dei Bisogni:</label>
                        <textarea
                            id="student-analysis"
                            rows={5}
                            value={studentAnalysis}
                            onChange={(e) => setStudentAnalysis(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition shadow-sm"
                            placeholder="Es. Bisogni di Sicurezza: Paura di perdere la casa. Bisogni di Stima: Si sente un fallito..."
                            aria-label="La tua Analisi dei Bisogni"
                        />
                    </div>

                    {error && <p className="text-red-600 mt-4 text-center">{error}</p>}

                    <div className="mt-6 text-center">
                        <button
                            onClick={handleGenerateFeedback}
                            disabled={isLoading || !studentAnalysis}
                            className="bg-sky-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 ease-in-out hover:bg-sky-700 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Analisi in corso...' : 'Valuta la mia Analisi'}
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
                                    onClick={setNewStory}
                                    className="bg-amber-500 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 ease-in-out hover:bg-amber-600 shadow-md hover:shadow-lg"
                                >
                                    Prossima Storia
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default MaslowTool;
