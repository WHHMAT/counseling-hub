import React, { useState } from 'react';
import { auth, db } from '../firebase';

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

interface VisionData {
  purpose: string;
  values: string;
  strengths: string;
  passions: string;
  impact: string;
  idealSelf: string;
}

const VISION_STEPS = [
    { id: 'purpose', title: 'Il tuo Scopo', question: 'Cosa ti spinge ad alzarti la mattina? Qual è il tuo "perché" più profondo che dà un senso alle tue giornate?' },
    { id: 'values', title: 'I tuoi Valori Fondamentali', question: 'Cosa è veramente importante per te nella vita? Elenca 3-5 valori non negoziabili (es. onestà, creatività, famiglia, crescita).' },
    { id: 'strengths', title: 'I tuoi Punti di Forza', question: 'In cosa sei naturalmente bravo/a? Quali sono i talenti o le abilità che gli altri ti riconoscono?' },
    { id: 'passions', title: 'Le tue Passioni', question: 'Cosa ami fare al punto da perdere la cognizione del tempo? Quali attività ti riempiono di energia e gioia?' },
    { id: 'impact', title: 'L\'Impatto che Vuoi Avere', question: 'Che differenza vuoi fare nel mondo, nella tua comunità o nella vita delle persone che ti circondano? Come vuoi che gli altri ti ricordino?' },
    { id: 'idealSelf', title: 'Il tuo Sé Ideale', question: 'Chi vuoi essere come persona? Quali qualità e virtù vuoi incarnare ogni giorno (es. coraggioso, compassionevole, saggio)?' },
];

interface VisionToolProps {
  onGoHome: () => void;
  onExerciseComplete: () => void;
}

const VisionTool: React.FC<VisionToolProps> = ({ onGoHome, onExerciseComplete }) => {
    const [step, setStep] = useState(0); // 0: intro, 1-6: questions, 7: synthesis, 8: result
    const [visionData, setVisionData] = useState<VisionData>({
        purpose: '', values: '', strengths: '', passions: '', impact: '', idealSelf: ''
    });
    const [finalVision, setFinalVision] = useState('');
    const [drafts, setDrafts] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);


    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleUpdateData = (field: keyof VisionData, value: string) => {
        setVisionData(prev => ({ ...prev, [field]: value }));
    };
    
    const handleGenerateDrafts = async () => {
        setIsLoading(true);
        setError('');
        setDrafts([]);
        
        const prompt = `Sei un copywriter esperto e un coach di sviluppo personale. Il tuo compito è aiutare un utente a creare una vision statement personale, basandoti sulle sue riflessioni. La vision deve essere concisa (1-2 frasi), in prima persona, ispiratrice e orientata all'azione.

Usa questa formula come guida, ma sentiti libero di variarla per un risultato più potente:
\`[Verbo di azione che descrive il contributo] per [Destinatari/Causa] in modo da [Impatto desiderato], guidato/a da [Valore/Forza chiave].\`

Ecco le riflessioni dell'utente:
- Il mio Scopo (perché): "${visionData.purpose}"
- I miei Valori (cosa è importante): "${visionData.values}"
- I miei Punti di Forza (in cosa sono bravo): "${visionData.strengths}"
- Le mie Passioni (cosa amo fare): "${visionData.passions}"
- L'Impatto che voglio avere (il risultato): "${visionData.impact}"
- Il mio Sé Ideale (chi voglio essere): "${visionData.idealSelf}"

Crea 3 bozze di vision statement in formato Markdown, come elenco numerato.`;

        try {
            const res = await fetch('/.netlify/functions/generateFeedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Errore del server.');
            
            const rawDrafts = data.feedback.split('\n').filter((line: string) => line.match(/^\d+\.\s/));
            const formattedDrafts = rawDrafts.map((d: string) => d.replace(/^\d+\.\s/, '').trim());
            setDrafts(formattedDrafts);
            handleNext();

        } catch (e) {
            setError(e instanceof Error ? e.message : 'Si è verificato un errore sconosciuto.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFinish = async () => {
        if (!finalVision.trim()) {
            setError("Per favore, definisci la tua vision prima di concludere.");
            return;
        }
        setIsSaving(true);
        setError('');
        
        try {
            const user = auth.currentUser;
            if (user) {
                const userRef = db.collection('users').doc(user.uid);
                await userRef.set({
                    personalVision: finalVision
                }, { merge: true });
            }
            onExerciseComplete();
            alert("Congratulazioni! La tua vision è stata salvata nel tuo profilo. Ricorda di rivederla periodicamente per assicurarti che sia sempre allineata con te.");
            onGoHome();
        } catch (err) {
            console.error("Error saving vision:", err);
            setError("Si è verificato un errore durante il salvataggio della tua vision. Riprova.");
        } finally {
            setIsSaving(false);
        }
    };

    const SummaryComponent = () => (
         <div className="space-y-4 bg-gray-50 p-4 rounded-lg border">
            {VISION_STEPS.map(s => (
                <div key={s.id}>
                    <h3 className="font-bold text-sky-800">{s.title}</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{visionData[s.id as keyof VisionData] || "Nessuna riflessione inserita."}</p>
                </div>
            ))}
        </div>
    );

    const renderIntro = () => (
        <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Definisci la tua Vision Personale</h1>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">Questo strumento ti guiderà attraverso 6 passi di riflessione per aiutarti a creare una vision statement: una frase chiara e ispiratrice che rappresenta la direzione che vuoi dare alla tua vita.</p>
            <button onClick={handleNext} className="bg-sky-600 text-white px-8 py-3 rounded-full font-semibold transition-all hover:bg-sky-700 shadow-md hover:shadow-lg">
                Inizia il Percorso
            </button>
        </div>
    );
    
    const renderQuestionStep = () => {
        const currentStep = VISION_STEPS[step - 1];
        const currentField = currentStep.id as keyof VisionData;
        const progress = ((step -1) / VISION_STEPS.length) * 100;

        return (
            <div>
                 <div className="mb-6">
                    <p className="text-sm font-semibold text-sky-600 text-center">PASSO {step} DI {VISION_STEPS.length}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div className="bg-sky-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">{currentStep.title}</h2>
                <p className="text-gray-600 mb-6 text-center">{currentStep.question}</p>
                <textarea
                    value={visionData[currentField]}
                    onChange={(e) => handleUpdateData(currentField, e.target.value)}
                    rows={8}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 transition shadow-sm"
                    placeholder="Scrivi qui le tue riflessioni..."
                />
                <div className="flex justify-between mt-6">
                    <button onClick={handleBack} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-full font-semibold hover:bg-gray-300 transition-colors">
                        Indietro
                    </button>
                    <button onClick={handleNext} className="bg-sky-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-sky-700 transition-colors">
                        Avanti
                    </button>
                </div>
            </div>
        );
    };

    const renderSynthesisStep = () => (
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center">Sintesi delle tue Riflessioni</h1>
            <p className="text-gray-600 mb-6 text-center">Ottimo lavoro! Ecco un riepilogo di ciò che hai esplorato. Ora useremo queste intuizioni per creare la tua vision.</p>
            <SummaryComponent />
            <div className="flex justify-between mt-6">
                 <button onClick={handleBack} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-full font-semibold hover:bg-gray-300 transition-colors">
                    Modifica
                </button>
                 <button onClick={handleGenerateDrafts} disabled={isLoading} className="bg-amber-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-amber-600 transition-colors disabled:bg-gray-400">
                    {isLoading ? 'Creazione in corso...' : "Crea bozze con l'AI"}
                </button>
            </div>
            {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
        </div>
    );
    
     const renderResultStep = () => (
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center">Crea la tua Vision Statement</h1>
            <p className="text-gray-600 mb-6 text-center">Ecco alcune bozze create dall'AI. Usale come ispirazione per scrivere la tua vision finale nel box qui sotto.</p>
            
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-8">
                <h3 className="font-bold text-amber-900 mb-2">Bozze dall'AI:</h3>
                <ul className="space-y-2">
                    {drafts.map((draft, index) => (
                        <li key={index} className="p-3 bg-white rounded-md shadow-sm border text-gray-700 cursor-pointer hover:bg-sky-50" onClick={() => setFinalVision(draft)}>
                            {draft}
                        </li>
                    ))}
                </ul>
            </div>

            <details className="bg-gray-50 rounded-lg border mb-8">
                <summary className="p-4 font-semibold cursor-pointer text-sky-800">Mostra/Nascondi le mie riflessioni</summary>
                <div className="p-4 border-t">
                    <SummaryComponent />
                </div>
            </details>

            <div className="mt-8">
                <label htmlFor="final-vision" className="block text-xl font-bold text-gray-700 mb-2 text-center">La mia Vision Personale:</label>
                <textarea
                    id="final-vision"
                    value={finalVision}
                    onChange={(e) => setFinalVision(e.target.value)}
                    rows={4}
                    className="w-full p-4 border-2 border-sky-300 rounded-lg focus:ring-2 focus:ring-sky-500 transition shadow-lg text-lg text-center"
                    placeholder="Scrivi o incolla qui la tua vision finale..."
                />
            </div>
            {error && <p className="text-red-600 mt-2 text-center">{error}</p>}
            <div className="flex justify-between items-center mt-8">
                <button onClick={handleBack} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-full font-semibold hover:bg-gray-300 transition-colors">
                    Indietro
                </button>
                 <button onClick={handleFinish} disabled={isSaving} className="bg-green-600 text-white px-8 py-3 rounded-full font-semibold transition-all hover:bg-green-700 shadow-md hover:shadow-lg disabled:bg-gray-400">
                    {isSaving ? 'Salvataggio...' : 'Salva la mia Vision!'}
                </button>
            </div>
        </div>
    );

    const renderCurrentStep = () => {
        switch (step) {
            case 0: return renderIntro();
            case 1: case 2: case 3: case 4: case 5: case 6: return renderQuestionStep();
            case 7: return renderSynthesisStep();
            case 8: return renderResultStep();
            default: return renderIntro();
        }
    };
    
    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <button onClick={onGoHome} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold mb-8 transition-colors">
                    <ArrowLeftIcon />
                    Torna al menu principale
                </button>

                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                    {isLoading && step !== 7 ? <LoadingSpinner/> : renderCurrentStep()}
                </div>

                <footer className="text-center py-8 mt-12">
                    <p className="text-gray-500">&copy; {new Date().getFullYear()} Hub Competenze Counseling. Tutti i diritti riservati.</p>
                </footer>
            </div>
        </div>
    );
};

export default VisionTool;