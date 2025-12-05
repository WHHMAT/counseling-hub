import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import firebase from '../firebase';

const ArrowLeftIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
    </div>
);

interface DiaryEntry {
    id: string;
    date: firebase.firestore.Timestamp;
    section1: string; // Cosa mi sta succedendo?
    section2: string; // Cosa mi fa soffrire?
    section3: string; // Che cosa voglio raggiungere?
    section4: string; // Che cosa ho imparato?
}

const DIARY_SECTIONS = [
    { id: 'section1', title: "1: Cosa mi sta succedendo?" },
    { id: 'section2', title: "2: Cosa mi fa soffrire?" },
    { id: 'section3', title: "3: Che cosa voglio raggiungere?" },
    { id: 'section4', title: "4: Che cosa ho imparato?" }
];

interface PersonalDiaryToolProps {
  onGoHome: () => void;
  onExerciseComplete: (entryId: string) => void;
}

const PersonalDiaryTool: React.FC<PersonalDiaryToolProps> = ({ onGoHome, onExerciseComplete }) => {
    const { user } = useAuth();
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [entries, setEntries] = useState<DiaryEntry[]>([]);
    const [currentEntry, setCurrentEntry] = useState<Partial<DiaryEntry> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showIntro, setShowIntro] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            const unsubscribe = db.collection('users').doc(user.uid).collection('diaryEntries')
                .orderBy('date', 'desc')
                .onSnapshot(snapshot => {
                    const fetchedEntries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DiaryEntry));
                    setEntries(fetchedEntries);
                    if (fetchedEntries.length === 0) {
                        setShowIntro(true);
                    }
                    setIsLoading(false);
                }, err => {
                    console.error("Error fetching diary entries:", err);
                    setError("Impossibile caricare le voci del diario.");
                    setIsLoading(false);
                });
            return () => unsubscribe();
        } else {
            setIsLoading(false);
        }
    }, [user]);

    const handleNewEntry = () => {
        setCurrentEntry({
            section1: '', section2: '', section3: '', section4: ''
        });
        setFeedback('');
        setView('editor');
    };

    const handleEditEntry = (entry: DiaryEntry) => {
        setCurrentEntry(entry);
        setFeedback('');
        setView('editor');
    };

    const handleSaveEntry = async () => {
        if (!user || !currentEntry) return;
        
        setIsSaving(true);
        setError('');
        const entryData = {
            date: currentEntry.date || firebase.firestore.FieldValue.serverTimestamp(),
            section1: currentEntry.section1 || '',
            section2: currentEntry.section2 || '',
            section3: currentEntry.section3 || '',
            section4: currentEntry.section4 || '',
        };

        try {
            const collectionRef = db.collection('users').doc(user.uid).collection('diaryEntries');
            if (currentEntry.id) {
                // Update existing entry
                await collectionRef.doc(currentEntry.id).update(entryData);
            } else {
                // Add new entry
                const docRef = await collectionRef.add(entryData);
                onExerciseComplete(docRef.id);
            }
            setView('list');
            setCurrentEntry(null);
        } catch (err) {
            console.error("Error saving entry:", err);
            setError("Si è verificato un errore durante il salvataggio.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteEntry = async (entryId: string) => {
        if (!user || !window.confirm("Sei sicuro di voler eliminare questa voce del diario? L'azione è irreversibile.")) return;

        try {
            await db.collection('users').doc(user.uid).collection('diaryEntries').doc(entryId).delete();
        } catch (err) {
            console.error("Error deleting entry:", err);
            setError("Si è verificato un errore durante l'eliminazione.");
        }
    };

    const handleGetReflection = async () => {
        if (!currentEntry) return;

        setIsFeedbackLoading(true);
        setFeedback('');
        setError('');

        const entryText = DIARY_SECTIONS.map(s => `**${s.title}**\n${currentEntry[s.id as keyof DiaryEntry] || ''}`).join('\n\n');
        
        const prompt = `Sei un counselor esperto che agisce come uno specchio compassionevole. Un utente ha scritto una voce del suo diario personale. Il tuo compito NON è dare consigli, soluzioni o interpretazioni, ma riflettere ciò che hai letto per aumentare la sua consapevolezza.

La voce del diario è la seguente:
---
${entryText}
---

Fornisci una riflessione in formato Markdown, strutturata così (usa ** per i titoli):

**Temi Principali Emersi:**
Sintetizza 1-2 temi o sentimenti chiave che sembrano emergere dalla scrittura. (Es: "Leggendo le tue parole, emerge un forte senso di sopraffazione legato alle responsabilità lavorative...").

**Connessioni e Contrasti:**
Evidenzia delicatamente eventuali connessioni o contrasti interessanti tra le diverse sezioni. (Es: "Noto un contrasto interessante: nella sezione 'Cosa mi fa soffrire' parli di solitudine, ma in 'Cosa ho imparato' rifletti sulla tua capacità di essere resiliente. Come convivono queste due parti di te?").

**Una Domanda per Te:**
Poni una singola, potente domanda aperta che inviti a un'ulteriore riflessione, basata su ciò che l'utente ha scritto. (Es: "Mentre rileggi le tue parole, quale emozione senti più forte nel corpo in questo momento?").

Ricorda: il tuo ruolo è di specchio, non di guida. Sii empatico e non giudicante.`;

        try {
            const res = await fetch('/.netlify/functions/generateFeedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Errore del server.');

            setFeedback(data.feedback);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Si è verificato un errore sconosciuto.');
        } finally {
            setIsFeedbackLoading(false);
        }
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

    const renderListView = () => (
        <>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Diario Personale</h1>
                    <p className="text-gray-600">Le tue riflessioni, in un luogo sicuro.</p>
                </div>
                <button onClick={handleNewEntry} className="bg-sky-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-sky-700 transition-colors shadow-sm">Nuova Voce</button>
            </div>

            {showIntro && (
                 <div className="bg-amber-50 border-l-4 border-amber-400 text-amber-900 p-4 rounded-r-lg mb-6">
                    <h2 className="font-bold">Benvenuto/a nel tuo Diario!</h2>
                    <p className="mt-2">Per un diario efficace, ricorda questi principi:</p>
                    <ul className="list-disc list-inside mt-2 text-sm">
                        <li><strong>Volontario:</strong> Scrivi quando ne senti il bisogno.</li>
                        <li><strong>Descrittivo:</strong> Sii specifico/a, evita le generalizzazioni.</li>
                        <li><strong>Spontaneo e Onesto:</strong> Lascia fluire i pensieri senza censure.</li>
                        <li><strong>Datato:</strong> Ogni voce ha la sua data per seguire il tuo percorso.</li>
                        <li><strong>Personale:</strong> Questo è il tuo spazio, con le tue regole.</li>
                    </ul>
                    <h3 className="font-bold mt-4">Scegli il tuo Stile di Scrittura:</h3>
                    <p className="mt-1 text-sm">Puoi usare questo diario in molti modi. Ecco alcuni stili che potresti esplorare:</p>
                    <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                        <li><strong>Scrittura Fenomenologica:</strong> Attieniti ai "dati di realtà" (cosa è successo, senza sentimenti o idee) per potenziare la tua lucidità, specialmente se ti senti dominato/a dal passato.</li>
                        <li><strong>Scrittura-Testimonianza:</strong> La più semplice e spontanea. Usala per "vederci più chiaro" e far emergere consapevolezza dagli eventi.</li>
                        <li><strong>Scrittura Fantasmatica:</strong> Permetti a te stesso/a di esprimere le pulsioni più profonde e i pensieri incontrollabili. Può essere molto liberatorio.</li>
                        <li><strong>Lettera Simbolica:</strong> Rivolgiti a una persona specifica (anche se non la invierai mai) per far riemergere emozioni legate a una relazione o per dare una nuova conclusione a un evento passato.</li>
                        <li><strong>Diari Tematici:</strong> Concentrati su un tema specifico, come un diario alimentare, dei sogni, o per monitorare le tue emozioni e identificare dei pattern.</li>
                    </ul>
                </div>
            )}
            
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            {isLoading ? <LoadingSpinner /> : (
                <div className="space-y-4">
                    {entries.length > 0 ? entries.map(entry => (
                        <div key={entry.id} className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-start">
                           <div>
                                <p className="font-bold text-lg text-gray-800">{entry.date.toDate().toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <p className="text-gray-600 mt-1 italic">"{entry.section1.substring(0, 80)}{entry.section1.length > 80 ? '...' : ''}"</p>
                           </div>
                           <div className="flex space-x-2 flex-shrink-0 ml-4">
                                <button onClick={() => handleEditEntry(entry)} className="text-sky-600 hover:text-sky-800 font-semibold text-sm">Leggi/Modifica</button>
                                <button onClick={() => handleDeleteEntry(entry.id)} className="text-red-600 hover:text-red-800 font-semibold text-sm">Elimina</button>
                           </div>
                        </div>
                    )) : !showIntro && <p className="text-center text-gray-500 py-8">Non hai ancora scritto nessuna voce. Clicca su "Nuova Voce" per iniziare.</p>}
                </div>
            )}
        </>
    );

    const renderEditorView = () => (
        <>
             <div>
                <button onClick={() => setView('list')} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold mb-6 text-sm transition-colors">
                    <ArrowLeftIcon />
                    Torna all'elenco
                </button>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">{currentEntry?.id ? 'Modifica Voce del Diario' : 'Nuova Voce del Diario'}</h1>
            </div>
            <div className="space-y-6">
                {DIARY_SECTIONS.map(section => (
                    <div key={section.id}>
                        <label htmlFor={section.id} className="block text-md font-bold text-gray-700 mb-2">{section.title}</label>
                        <textarea
                            id={section.id}
                            rows={5}
                            value={currentEntry?.[section.id as keyof DiaryEntry] || ''}
                            onChange={(e) => setCurrentEntry(prev => ({ ...prev, [section.id]: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 transition shadow-sm"
                        />
                    </div>
                ))}
            </div>
            
            {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            
            <div className="mt-8 flex justify-between items-center">
                <button onClick={() => setView('list')} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-full font-semibold hover:bg-gray-300 transition-colors">Annulla</button>
                <button onClick={handleSaveEntry} disabled={isSaving} className="bg-sky-600 text-white px-8 py-3 rounded-full font-semibold transition-all hover:bg-sky-700 shadow-md hover:shadow-lg disabled:bg-gray-400">
                    {isSaving ? 'Salvataggio...' : 'Salva Voce'}
                </button>
            </div>

            {currentEntry?.id && (
                 <div className="mt-10 border-t pt-6">
                    <div className="text-center">
                        <button onClick={handleGetReflection} disabled={isFeedbackLoading} className="bg-amber-500 text-white px-6 py-2 rounded-full font-semibold transition-all hover:bg-amber-600 shadow-sm disabled:bg-gray-400">
                           {isFeedbackLoading ? 'Riflessione in corso...' : 'Chiedi una riflessione all\'AI'}
                        </button>
                         <p className="text-xs text-gray-500 mt-2">Usa questa funzione per avere uno spunto di riflessione esterno sulla tua scrittura.</p>
                    </div>
                    {isFeedbackLoading && <LoadingSpinner />}
                    {feedback && (
                        <div className="mt-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Riflessione del Coach AI</h2>
                            <div className="bg-gray-50 rounded-lg p-4 text-gray-700 prose max-w-none">
                                {renderMarkdown(feedback)}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );

    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <button onClick={onGoHome} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold mb-8 transition-colors">
                    <ArrowLeftIcon />
                    Torna al menu principale
                </button>

                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                    {!user && !isLoading ? (
                         <div className="text-center py-10">
                            <h2 className="text-xl font-bold text-gray-800">Accedi per usare il Diario</h2>
                            <p className="text-gray-600 mt-2">Il diario personale è uno spazio sicuro legato al tuo account. Per favore, accedi o registrati per iniziare a scrivere.</p>
                        </div>
                    ) : (
                        view === 'list' ? renderListView() : renderEditorView()
                    )}
                </div>

                <footer className="text-center py-8 mt-12">
                    <p className="text-gray-500">&copy; {new Date().getFullYear()} Hub Competenze Counseling. Tutti i diritti riservati.</p>
                </footer>
            </div>
        </div>
    );
};

export default PersonalDiaryTool;