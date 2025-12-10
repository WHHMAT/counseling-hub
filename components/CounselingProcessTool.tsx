
import React, { useState, useEffect } from 'react';
import { DROP_ZONES, DRAGGABLE_ITEMS, DropZone as DropZoneType, DraggableItem as DraggableItemType } from '../data/counselingProcessData';

const ArrowLeftIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


// Funzione per mescolare un array
const shuffle = <T,>(array: T[]): T[] => [...array].sort(() => Math.random() - 0.5);

type PlacedItems = Record<string, DraggableItemType[]>;

interface CounselingProcessToolProps {
  onGoHome: () => void;
  onExerciseComplete: () => void;
}

const CounselingProcessTool: React.FC<CounselingProcessToolProps> = ({ onGoHome, onExerciseComplete }) => {
    const [unplacedItems, setUnplacedItems] = useState<DraggableItemType[]>([]);
    const [placedItems, setPlacedItems] = useState<PlacedItems>({});
    const [feedbackMode, setFeedbackMode] = useState(false);
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
    const [score, setScore] = useState({ correct: 0, total: 0 });

    const initializeState = () => {
        setUnplacedItems(shuffle(DRAGGABLE_ITEMS));
        setPlacedItems(DROP_ZONES.reduce((acc, zone) => ({ ...acc, [zone.id]: [] }), {}));
        setFeedbackMode(false);
        setScore({ correct: 0, total: 0 });
    };

    useEffect(() => {
        initializeState();
    }, []);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, itemId: string) => {
        setDraggedItemId(itemId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', itemId);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, zoneId: string) => {
        e.preventDefault();
        const itemId = e.dataTransfer.getData('text/plain');
        const itemToMove = unplacedItems.find(item => item.id === itemId);

        if (itemToMove) {
            setUnplacedItems(prev => prev.filter(item => item.id !== itemId));
            setPlacedItems(prev => ({
                ...prev,
                [zoneId]: [...prev[zoneId], itemToMove]
            }));
        }
    };
    
    const handleCheckAnswers = () => {
        let correctCount = 0;
        Object.keys(placedItems).forEach(zoneId => {
            placedItems[zoneId].forEach(item => {
                if (item.correctZone === zoneId) {
                    correctCount++;
                }
            });
        });
        setScore({ correct: correctCount, total: DRAGGABLE_ITEMS.length });
        setFeedbackMode(true);
        if(correctCount === DRAGGABLE_ITEMS.length) {
            onExerciseComplete();
        }
    };
    
    const isAllPlaced = unplacedItems.length === 0;

    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <button onClick={onGoHome} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold mb-8 transition-colors">
                    <ArrowLeftIcon />
                    Torna al menu principale
                </button>

                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Esercizio: Il Processo di Counseling</h1>
                        <p className="text-gray-600 max-w-3xl mx-auto">Trascina ogni elemento dalla lista a sinistra e posizionalo nella fase corretta del processo a destra.</p>
                    </div>

                    {feedbackMode && (
                        <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-r-lg text-center">
                            <h2 className="font-bold text-xl">Risultato</h2>
                            <p className="text-lg">Hai posizionato correttamente <strong>{score.correct}</strong> su <strong>{score.total}</strong> elementi.</p>
                            {score.correct === score.total && <p className="mt-2 font-semibold">Congratulazioni, ottimo lavoro!</p>}
                            <button onClick={initializeState} className="mt-4 bg-sky-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-sky-700 transition-colors">
                                Riprova
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Item Bank - Scrollable */}
                        <div className="lg:col-span-1 bg-gray-100 p-4 rounded-lg border-2 border-dashed border-gray-300 h-[600px] overflow-y-auto sticky top-4">
                             <h2 className="font-bold text-lg text-gray-700 text-center mb-4 sticky top-0 bg-gray-100 py-2 z-10">Elementi da Posizionare ({unplacedItems.length})</h2>
                             <div className="space-y-2">
                                {unplacedItems.map(item => (
                                    <div
                                        key={item.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, item.id)}
                                        className={`bg-white p-3 rounded-md shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing transition-opacity text-sm font-medium text-gray-900 hover:shadow-md ${draggedItemId === item.id ? 'opacity-50' : 'opacity-100'}`}
                                    >
                                        {item.text}
                                    </div>
                                ))}
                                {unplacedItems.length === 0 && (
                                    <p className="text-center text-gray-500 italic mt-10">Hai posizionato tutti gli elementi!</p>
                                )}
                             </div>
                        </div>

                        {/* Drop Zones */}
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {DROP_ZONES.map(zone => {
                                const borderStyle = `border-2 border-dashed ${zone.colorClasses.split(' ')[1]}`;
                                return (
                                    <div
                                        key={zone.id}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, zone.id)}
                                        className={`${zone.colorClasses.split(' ')[0]} p-4 rounded-lg ${borderStyle} min-h-[300px] flex flex-col transition-colors hover:bg-opacity-80`}
                                    >
                                        <div className="text-center mb-4">
                                            <h3 className="font-bold text-xl text-gray-800">{zone.title}</h3>
                                            <p className="font-semibold text-gray-600">{zone.subtitle}</p>
                                        </div>
                                        <div className="space-y-2 flex-grow">
                                            {placedItems[zone.id]?.map(item => {
                                                const isCorrect = item.correctZone === zone.id;
                                                const feedbackClass = feedbackMode ? (isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : 'border-gray-200';
                                                return (
                                                    <div
                                                        key={item.id}
                                                        className={`bg-white p-2 rounded-md shadow-sm border-2 flex items-start text-sm text-gray-900 ${feedbackClass}`}
                                                    >
                                                        {feedbackMode && (
                                                            isCorrect 
                                                                ? <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" /> 
                                                                : <XCircleIcon className="h-4 w-4 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                                                        )}
                                                        <span className="flex-grow">{item.text}</span>
                                                    </div>
                                                );
                                            })}
                                            {placedItems[zone.id]?.length === 0 && (
                                                <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                                                    Trascina qui
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                     {isAllPlaced && !feedbackMode && (
                        <div className="mt-8 text-center">
                            <button onClick={handleCheckAnswers} className="bg-green-600 text-white px-8 py-3 rounded-full font-semibold transition-all hover:bg-green-700 shadow-md hover:shadow-lg">
                                Verifica le mie risposte
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CounselingProcessTool;
