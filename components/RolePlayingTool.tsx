import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

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

const CLIENT_SENTENCES = [
    "Non so più cosa fare, mi sento completamente bloccato al lavoro.",
    "Continuo a litigare con il mio partner per le stesse cose, è estenuante.",
    "Mi sento così solo da quando mi sono trasferito in questa nuova città.",
    "Ho paura di non essere all'altezza delle aspettative dei miei genitori.",
    "A volte penso di non avere un vero scopo nella vita.",
    "Sono arrabbiato perché nessuno sembra capire quello che sto passando.",
    "Mi sento frustrato perché i miei sforzi non vengono mai riconosciuti."
];

const RolePlayingTool: React.FC<{ onGoHome: () => void }> = ({ onGoHome }) => {
    const [clientSentence, setClientSentence] = useState('');
    const [studentResponse, setStudentResponse] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setNewSentence();
    }, []);

    const setNewSentence = () => {
        const randomIndex = Math.floor(Math.random() * CLIENT_SENTENCES.length);
        const newSentence = CLIENT_SENTENCES.find(s => s !== clientSentence) || CLIENT_SENTENCES[randomIndex];
        setClientSentence(newSentence);
        setStudentResponse('');
        setFeedback('');
        setError('');
    };

    const handleGenerateFeedback = async () => {
        if (!studentResponse.trim()) {
            setError("Per favore, inserisci la tua riformulazione.");
            return;
        }
        setIsLoading(true);
        setError('');
        setFeedback('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const prompt = `Sei un supervisore esperto di counseling specializzato nell'approccio centrato sulla persona di Carl Rogers. Il tuo compito è valutare la risposta di uno studente di counseling alla frase di un cliente. L'obiettivo dello studente è formulare una "riformulazione rogersiana", che consiste nel riflettere il sentimento e il significato del cliente in modo empatico e non giudicante.

La riformulazione DEVE EVITARE le seguenti "risposte trappola", conosciute con l'acronimo VISSI:
- Valutare: Esprimere giudizi (es. "Hai fatto bene", "Non dovresti sentirti così").
- Interrogare: Fare domande investigative (es. "Perché ti senti così?").
- Soluzionare: Dare consigli (es. "Dovresti provare a...").
- Investigare: Indagare per ottenere dettagli non essenziali.
- Sostenere: Offrire rassicurazioni premature o minimizzare (es. "Vedrai che andrà tutto bene").

Analizza la 'Frase del Cliente' e la 'Riformulazione dello Studente'. Fornisci un feedback costruttivo in formato Markdown.

Il feedback deve essere strutturato così (usa ** per i titoli):
**Valutazione Generale:**
Una valutazione sintetica (es. "Riformulazione Empatica Efficace", "Buon Tentativo con Elementi da Migliorare", "Risposta Trappola: Consiglio").
**Analisi della Risposta:**
Spiega perché la riformulazione è (o non è) efficace, collegandoti ai principi rogersiani.
**Verifica VISSI:**
Identifica esplicitamente se la risposta cade in una delle categorie VISSI. Se sì, spiega quale e perché.
**Esempi Migliorativi:**
Offri 1 o 2 esempi concreti di riformulazioni rogersiane efficaci per la frase del cliente.
**Incoraggiamento Finale:**
Una breve frase positiva per motivare lo studente.

---
**Frase del Cliente:** "${clientSentence}"
---
**Riformulazione dello Studente:** "${studentResponse}"
---`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            setFeedback(response.text);

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

    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <button onClick={onGoHome} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold mb-8 transition-colors">
                    <ArrowLeftIcon />
                    Torna al menu principale
                </button>

                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Esercizio di Riformulazione</h1>
                    <p className="text-gray-600 mb-6">Leggi la frase del cliente e prova a riformularla secondo i principi di Carl Rogers, evitando le trappole del VISSI.</p>
                    
                    <div className="bg-sky-50 border-l-4 border-sky-500 text-sky-800 p-4 rounded-r-lg mb-6">
                        <p className="font-semibold">Frase del Cliente:</p>
                        <p className="text-lg italic">"{clientSentence}"</p>
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
                 <footer className="text-center py-8 mt-12">
                    <p className="text-gray-500">&copy; {new Date().getFullYear()} Hub Competenze Counseling. Tutti i diritti riservati.</p>
                </footer>
            </div>
        </div>
    );
};

export default RolePlayingTool;
