import React, { useState, useMemo } from 'react';

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

const WHEEL_AREAS = [
    { id: 'fisico', label: 'Fisico', color: '#84cc16' }, // lime-500
    { id: 'finanze', label: 'Finanze', color: '#facc15' }, // yellow-400
    { id: 'spirituale', label: 'Spirituale', color: '#f97316' }, // orange-500
    { id: 'crescita', label: 'Crescita Personale', color: '#ef4444' }, // red-500
    { id: 'ambiente', label: 'Ambiente', color: '#ec4899' }, // pink-500
    { id: 'lavoro', label: 'Lavoro', color: '#8b5cf6' }, // violet-500
    { id: 'pari', label: 'Gruppo dei Pari', color: '#3b82f6' }, // blue-500
    { id: 'famiglia', label: 'Famiglia', color: '#0ea5e9' }, // sky-500
];

type AreaData = { score: number; text: string };
type WheelData = Record<string, AreaData>;

interface RadarChartProps {
    data: { id: string; label: string; color: string; score: number }[];
}

const RadarChart: React.FC<RadarChartProps> = ({ data }) => {
    const size = 300;
    const center = size / 2;
    const radius = size * 0.4;

    const points = useMemo(() => {
        return data.map((area, i) => {
            const angle = (Math.PI / 4) * i - (Math.PI / 2); // Start at top
            const x = center + radius * (area.score / 100) * Math.cos(angle);
            const y = center + radius * (area.score / 100) * Math.sin(angle);
            return `${x},${y}`;
        }).join(' ');
    }, [data, center, radius]);

    return (
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto max-w-sm mx-auto">
            <g>
                {[...Array(5)].map((_, i) => (
                    <polygon
                        key={i}
                        points={WHEEL_AREAS.map((_, j) => {
                            const r = radius * ((i + 1) / 5);
                            const angle = (Math.PI / 4) * j - (Math.PI / 2);
                            return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#d1d5db"
                        strokeWidth="1"
                    />
                ))}
            </g>
            <g>
                {WHEEL_AREAS.map((area, i) => {
                    const angle = (Math.PI / 4) * i - (Math.PI / 2);
                    const x1 = center;
                    const y1 = center;
                    const x2 = center + radius * Math.cos(angle);
                    const y2 = center + radius * Math.sin(angle);
                    const labelX = center + (radius + 20) * Math.cos(angle);
                    const labelY = center + (radius + 20) * Math.sin(angle);
                    return (
                        <g key={area.id}>
                            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e5e7eb" strokeWidth="1" />
                            <text
                                x={labelX}
                                y={labelY}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill={area.color}
                                fontWeight="bold"
                                fontSize="12"
                            >
                                {area.label}
                            </text>
                        </g>
                    );
                })}
            </g>
            <polygon points={points} fill="#3b82f6" fillOpacity="0.4" stroke="#3b82f6" strokeWidth="2" />
        </svg>
    );
};

interface WheelOfLifeToolProps {
  onGoHome: () => void;
  onExerciseComplete: () => void;
}

const WheelOfLifeTool: React.FC<WheelOfLifeToolProps> = ({ onGoHome, onExerciseComplete }) => {
    const [wheelData, setWheelData] = useState<WheelData>(
        WHEEL_AREAS.reduce((acc, area) => ({ ...acc, [area.id]: { score: 50, text: '' } }), {})
    );
    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const handleUpdate = (id: string, score: number, text: string) => {
        setWheelData(prev => ({ ...prev, [id]: { score, text } }));
    };

    const getSliderColor = (score: number) => `hsl(${240 - score * 2.4}, 80%, 60%)`;

    const handleGenerateFeedback = async () => {
        setIsLoading(true);
        setFeedback('');
        setError('');

        const promptData = WHEEL_AREAS.map(area => 
            `- ${area.label}: ${wheelData[area.id].score}, Motivazione: "${wheelData[area.id].text || 'Nessuna'}"`
        ).join('\n');

        const prompt = `Sei un life coach esperto e compassionevole. Il tuo compito è analizzare la "Ruota della Vita" di un utente e offrire spunti di riflessione.

Ecco i dati dell'utente (punteggio da 0 a 100 e una breve motivazione):
${promptData}

Fornisci un feedback in formato Markdown, strutturato così (usa ** per i titoli):

**Analisi Generale della tua Ruota:**
Commenta l'equilibrio generale. La ruota è "liscia" o "sbilanciata"? Sottolinea che uno sbilanciamento è normale e offre un'opportunità di crescita.

**Le tue Aree di Forza:**
Identifica 1-2 aree con il punteggio più alto. Usa le motivazioni dell'utente per celebrare questi successi. (Es: "È fantastico vedere il tuo punteggio alto in 'Famiglia'. Dalle tue parole, si capisce quanto sia importante per te...").

**Aree di Opportunità:**
Identifica 1-2 aree con il punteggio più basso. Approccia l'argomento con delicatezza, usando le motivazioni dell'utente per mostrare comprensione.

**Riflessioni e Connessioni:**
Poni 1-2 domande aperte e potenti che colleghino le aree. (Es: "Noto che il 'Lavoro' ha un punteggio basso, mentre la 'Crescita Personale' è alta. In che modo la tua passione per la crescita potrebbe essere una risorsa per trovare più soddisfazione nel tuo lavoro?").

**Un Piccolo Passo:**
Concludi suggerendo un'azione piccolissima e concreta che l'utente potrebbe fare in una delle aree a basso punteggio, basandoti sulle sue motivazioni. (Es: "Dato che ti senti insoddisfatto dell' 'Ambiente' perché disordinato, quale piccolo angolo della tua casa potresti sistemare in 15 minuti questa settimana per sentirti meglio?").

**Punteggio:**
Assegna un punteggio di 15 per aver completato l'esercizio.`;

        try {
            const res = await fetch('/.netlify/functions/generateFeedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Errore del server.');

            setFeedback(data.feedback);
            onExerciseComplete();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Si è verificato un errore sconosciuto.');
        } finally {
            setIsLoading(false);
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

    const chartData = useMemo(() => {
        return WHEEL_AREAS.map(area => ({ ...area, score: wheelData[area.id].score }));
    }, [wheelData]);

    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <button onClick={onGoHome} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold mb-8 transition-colors">
                    <ArrowLeftIcon />
                    Torna al menu principale
                </button>
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">La Ruota della Vita</h1>
                        <p className="text-gray-600 max-w-3xl mx-auto">Valuta la tua soddisfazione attuale in ogni area da 0 (per niente soddisfatto) a 100 (completamente soddisfatto). Osserva come la tua ruota prende forma.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div className="order-2 lg:order-1 space-y-4">
                            {WHEEL_AREAS.map(area => (
                                <div key={area.id} className="bg-gray-50 p-4 rounded-lg border">
                                    <div className="flex justify-between items-center mb-2">
                                        <label htmlFor={`${area.id}-score`} className="font-bold text-lg" style={{ color: area.color }}>{area.label}</label>
                                        <span className="font-bold text-xl" style={{ color: getSliderColor(wheelData[area.id].score) }}>
                                            {wheelData[area.id].score}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        id={`${area.id}-score`}
                                        min="0"
                                        max="100"
                                        value={wheelData[area.id].score}
                                        onChange={(e) => handleUpdate(area.id, parseInt(e.target.value), wheelData[area.id].text)}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        style={{ accentColor: getSliderColor(wheelData[area.id].score) }}
                                    />
                                    <textarea
                                        rows={2}
                                        value={wheelData[area.id].text}
                                        onChange={(e) => handleUpdate(area.id, wheelData[area.id].score, e.target.value)}
                                        placeholder={`Perché hai dato questo punteggio a "${area.label}"?`}
                                        className="w-full p-2 mt-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-sky-500"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="order-1 lg:order-2">
                            <RadarChart data={chartData} />
                        </div>
                    </div>
                    
                    <div className="mt-10 text-center">
                        <button onClick={handleGenerateFeedback} disabled={isLoading} className="bg-amber-500 text-white px-8 py-3 rounded-full font-semibold transition-all hover:bg-amber-600 shadow-md hover:shadow-lg disabled:bg-gray-400">
                            {isLoading ? 'Analisi in corso...' : 'Analizza la mia Ruota'}
                        </button>
                    </div>

                    {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
                    
                    {feedback && (
                         <div className="mt-8 border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Analisi del tuo Coach AI</h2>
                            <div className="bg-gray-50 rounded-lg p-6 text-gray-700 prose max-w-none mx-auto">
                                {renderMarkdown(feedback)}
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

export default WheelOfLifeTool;