
import React, { useState, useRef, useEffect } from 'react';

const ArrowLeftIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const XIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// Icone per i controlli di Zoom/Pan
const PlusIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
const MinusIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>;
const ChevronUpIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>;
const ChevronDownIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>;
const ChevronLeftIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;
const ChevronRightIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>;
const CenterIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>;


type NodeType = 'male' | 'female';
type ConnectionType = 'strong' | 'conflict' | 'strong-conflict';

interface DiagramNode {
    id: string;
    x: number;
    y: number;
    type: NodeType;
    name: string;
    description?: string;
}

interface DiagramConnection {
    id: string;
    from: string;
    to: string;
    type: ConnectionType;
    label?: string;
}

type Selection = { type: 'node', id: string } | { type: 'connection', id: string } | null;

interface RelationalDiagramToolProps {
    onGoHome: () => void;
    onExerciseComplete: (points: number, toolId: string, exerciseId: number) => void;
}

const RelationalDiagramTool: React.FC<RelationalDiagramToolProps> = ({ onGoHome, onExerciseComplete }) => {
    const [nodes, setNodes] = useState<DiagramNode[]>([]);
    const [connections, setConnections] = useState<DiagramConnection[]>([]);
    
    // Selection state
    const [selection, setSelection] = useState<Selection>(null);
    
    // Interaction states
    const [connectionMode, setConnectionMode] = useState<ConnectionType | null>(null);
    const [draggedNode, setDraggedNode] = useState<string | null>(null);
    
    // Viewport states
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

    const svgRef = useRef<SVGSVGElement>(null);

    // --- VIEWPORT CONTROLS ---

    const handleZoom = (delta: number) => {
        setZoom(prev => {
            const newZoom = prev + delta;
            return Math.min(Math.max(newZoom, 0.2), 3); // Limit zoom between 0.2x and 3x
        });
    };

    const handlePanButton = (dx: number, dy: number) => {
        setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    };

    const handleResetView = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    // --- LOGICA DI GESTIONE DATI ---

    const addNode = (type: NodeType) => {
        // Calcola il centro visibile attuale per posizionare il nuovo nodo
        const visibleCenterX = (svgRef.current?.clientWidth || 800) / 2;
        const visibleCenterY = (svgRef.current?.clientHeight || 600) / 2;
        
        // Converti coordinate schermo in coordinate mondo (tenendo conto di pan e zoom)
        const worldX = (visibleCenterX - pan.x) / zoom;
        const worldY = (visibleCenterY - pan.y) / zoom;

        const newNode: DiagramNode = {
            id: `node-${Date.now()}`,
            x: worldX + (Math.random() * 40 - 20), // Piccolo offset casuale per non sovrapporre
            y: worldY + (Math.random() * 40 - 20),
            type,
            name: type === 'male' ? 'Nuovo' : 'Nuova',
            description: ''
        };
        setNodes([...nodes, newNode]);
        setSelection({ type: 'node', id: newNode.id });
        setConnectionMode(null);
    };

    const updateNode = (id: string, field: keyof DiagramNode, value: string) => {
        setNodes(nodes.map(n => n.id === id ? { ...n, [field]: value } : n));
    };

    const updateConnection = (id: string, label: string) => {
        setConnections(connections.map(c => c.id === id ? { ...c, label } : c));
    };

    const deleteSelection = () => {
        if (!selection) return;

        if (selection.type === 'node') {
            setNodes(nodes.filter(n => n.id !== selection.id));
            setConnections(connections.filter(c => c.from !== selection.id && c.to !== selection.id));
        } else if (selection.type === 'connection') {
            setConnections(connections.filter(c => c.id !== selection.id));
        }
        setSelection(null);
    };

    // --- INTERAZIONI MOUSE (GLOBAL CANVAS) ---

    const handleCanvasMouseDown = (e: React.MouseEvent) => {
        // Se stiamo cliccando lo sfondo (non un nodo), iniziamo il pan
        if (!draggedNode && !connectionMode) {
            setIsPanning(true);
            setLastMousePos({ x: e.clientX, y: e.clientY });
        }
    };

    const handleCanvasMouseMove = (e: React.MouseEvent) => {
        const deltaX = e.clientX - lastMousePos.x;
        const deltaY = e.clientY - lastMousePos.y;
        setLastMousePos({ x: e.clientX, y: e.clientY });

        if (draggedNode) {
            // Se trasciniamo un nodo, aggiorniamo la sua posizione
            // Importante: dividiamo delta per lo zoom per mantenere il movimento sincronizzato col mouse
            setNodes(nodes.map(n => n.id === draggedNode ? { 
                ...n, 
                x: n.x + (deltaX / zoom), 
                y: n.y + (deltaY / zoom) 
            } : n));
        } else if (isPanning) {
            // Se stiamo facendo panning, aggiorniamo l'offset globale
            setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
        }
    };

    const handleCanvasMouseUp = () => {
        setDraggedNode(null);
        setIsPanning(false);
    };

    // --- INTERAZIONI MOUSE (NODI/CONNESSIONI) ---

    const handleNodeMouseDown = (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Evita che parta il pan del canvas
        if (connectionMode) return;
        setDraggedNode(id);
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleNodeClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        
        if (connectionMode) {
            if (selection?.type === 'node' && selection.id !== id) {
                const exists = connections.some(c => 
                    (c.from === selection.id && c.to === id) || (c.from === id && c.to === selection.id)
                );
                
                if (!exists) {
                    const newConnection: DiagramConnection = {
                        id: `conn-${Date.now()}`,
                        from: selection.id,
                        to: id,
                        type: connectionMode,
                        label: ''
                    };
                    setConnections([...connections, newConnection]);
                }
                setSelection(null); 
            } else {
                setSelection({ type: 'node', id });
            }
        } else {
            setSelection({ type: 'node', id });
        }
    };

    const handleConnectionClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!connectionMode) {
            setSelection({ type: 'connection', id });
        }
    };

    // --- HELPERS GRAFICI ---

    const getZigZagPath = (x1: number, y1: number, x2: number, y2: number) => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.floor(distance / 12); 
        
        let path = `M ${x1} ${y1}`;
        const stepX = dx / steps;
        const stepY = dy / steps;
        const perpX = -dy / distance * 6;
        const perpY = dx / distance * 6;

        for (let i = 1; i <= steps; i++) {
            const midX = x1 + stepX * i - (stepX / 2);
            const midY = y1 + stepY * i - (stepY / 2);
            const direction = i % 2 === 0 ? 1 : -1;
            path += ` L ${midX + perpX * direction} ${midY + perpY * direction}`;
        }
        path += ` L ${x2} ${y2}`;
        return path;
    };

    // --- RENDERERS ---

    const renderConnection = (conn: DiagramConnection) => {
        const start = nodes.find(n => n.id === conn.from);
        const end = nodes.find(n => n.id === conn.to);
        if (!start || !end) return null;

        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const offsetX = (-dy / dist) * 3;
        const offsetY = (dx / dist) * 3;
        
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;

        const isSelected = selection?.type === 'connection' && selection.id === conn.id;
        const strokeColor = isSelected ? '#ef4444' : 'black';

        let graphic;
        if (conn.type === 'strong') {
            graphic = (
                <g>
                    <line x1={start.x + offsetX} y1={start.y + offsetY} x2={end.x + offsetX} y2={end.y + offsetY} stroke={strokeColor} strokeWidth="2" />
                    <line x1={start.x - offsetX} y1={start.y - offsetY} x2={end.x - offsetX} y2={end.y - offsetY} stroke={strokeColor} strokeWidth="2" />
                </g>
            );
        } else if (conn.type === 'conflict') {
            graphic = <path d={getZigZagPath(start.x, start.y, end.x, end.y)} stroke={strokeColor} strokeWidth="2" fill="none" />;
        } else if (conn.type === 'strong-conflict') {
            graphic = (
                <g>
                    <line x1={start.x + offsetX*2} y1={start.y + offsetY*2} x2={end.x + offsetX*2} y2={end.y + offsetY*2} stroke={strokeColor} strokeWidth="1" />
                    <line x1={start.x - offsetX*2} y1={start.y - offsetY*2} x2={end.x - offsetX*2} y2={end.y - offsetY*2} stroke={strokeColor} strokeWidth="1" />
                    <path d={getZigZagPath(start.x, start.y, end.x, end.y)} stroke={strokeColor} strokeWidth="2" fill="none" />
                </g>
            );
        }

        return (
            <g key={conn.id} onClick={(e) => handleConnectionClick(conn.id, e)} className="cursor-pointer group">
                <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="transparent" strokeWidth="15" />
                {graphic}
                {conn.label && (
                    <g>
                        <rect x={midX - (conn.label.length * 3.5) - 4} y={midY - 10} width={(conn.label.length * 7) + 8} height="20" fill="white" rx="4" stroke={strokeColor} strokeWidth="1" opacity="0.9" />
                        <text x={midX} y={midY} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="black" fontWeight="bold">{conn.label}</text>
                    </g>
                )}
            </g>
        );
    };

    const finishExercise = () => {
        if(nodes.length > 2 && connections.length > 0) {
            onExerciseComplete(20, 'relational-diagram', 1);
            alert("Diagramma salvato! Hai guadagnato 20 punti.");
        } else {
            alert("Disegna almeno qualche nodo e connessione prima di salvare.");
        }
    };

    const renderSidebarContent = () => {
        if (selection?.type === 'node') {
            const node = nodes.find(n => n.id === selection.id);
            if (!node) return null;
            return (
                <div className="space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h3 className="font-bold text-gray-800">Modifica Persona</h3>
                        <button onClick={() => setSelection(null)} className="text-gray-400 hover:text-gray-600"><XIcon /></button>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase">Nome</label>
                        <input type="text" value={node.name} onChange={(e) => updateNode(node.id, 'name', e.target.value)} className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-sky-500"/>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase">Descrizione / Note</label>
                        <textarea value={node.description || ''} onChange={(e) => updateNode(node.id, 'description', e.target.value)} rows={3} className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-sky-500 text-sm" placeholder="Età, ruolo, info..."/>
                    </div>
                    <button onClick={deleteSelection} className="w-full flex items-center justify-center gap-2 p-2 text-red-600 border border-red-200 bg-red-50 rounded hover:bg-red-100 mt-4"><TrashIcon /> Elimina Persona</button>
                </div>
            );
        }
        if (selection?.type === 'connection') {
            const conn = connections.find(c => c.id === selection.id);
            if (!conn) return null;
            return (
                <div className="space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h3 className="font-bold text-gray-800">Modifica Legame</h3>
                        <button onClick={() => setSelection(null)} className="text-gray-400 hover:text-gray-600"><XIcon /></button>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase">Tipo</label>
                        <p className="text-sm font-medium text-gray-700 capitalize">{conn.type.replace('-', ' ')}</p>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase">Descrizione Legame</label>
                        <input type="text" value={conn.label || ''} onChange={(e) => updateConnection(conn.id, e.target.value)} className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-sky-500" placeholder="Es. Sposati, Conflitto..."/>
                        <p className="text-xs text-gray-400 mt-1">Apparirà sul diagramma.</p>
                    </div>
                    <button onClick={deleteSelection} className="w-full flex items-center justify-center gap-2 p-2 text-red-600 border border-red-200 bg-red-50 rounded hover:bg-red-100 mt-4"><TrashIcon /> Elimina Legame</button>
                </div>
            );
        }
        return (
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Aggiungi Persone</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => addNode('male')} className="flex flex-col items-center justify-center p-3 border rounded hover:bg-gray-50 transition bg-white shadow-sm"><div className="w-6 h-6 border-2 border-black mb-1"></div><span className="text-xs font-medium">Maschio</span></button>
                        <button onClick={() => addNode('female')} className="flex flex-col items-center justify-center p-3 border rounded hover:bg-gray-50 transition bg-white shadow-sm"><div className="w-6 h-6 border-2 border-black rounded-full mb-1"></div><span className="text-xs font-medium">Femmina</span></button>
                    </div>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Crea Legami</h3>
                    <p className="text-xs text-gray-400 mb-2">Seleziona uno strumento, poi clicca su due persone per collegarle.</p>
                    <div className="space-y-2">
                        <button onClick={() => { setConnectionMode(connectionMode === 'strong' ? null : 'strong'); setSelection(null); }} className={`w-full p-2 border rounded flex items-center gap-3 transition ${connectionMode === 'strong' ? 'bg-sky-100 border-sky-500 ring-1 ring-sky-500' : 'bg-white hover:bg-gray-50'}`}><div className="w-8 h-3 border-t-2 border-b-2 border-black"></div><span className="text-sm">Legame Forte</span></button>
                        <button onClick={() => { setConnectionMode(connectionMode === 'conflict' ? null : 'conflict'); setSelection(null); }} className={`w-full p-2 border rounded flex items-center gap-3 transition ${connectionMode === 'conflict' ? 'bg-sky-100 border-sky-500 ring-1 ring-sky-500' : 'bg-white hover:bg-gray-50'}`}><svg width="32" height="10" viewBox="0 0 32 10"><path d="M0 5 L4 0 L8 10 L12 0 L16 10 L20 0 L24 10 L28 0 L32 5" stroke="black" strokeWidth="2" fill="none" /></svg><span className="text-sm">Conflittuale</span></button>
                        <button onClick={() => { setConnectionMode(connectionMode === 'strong-conflict' ? null : 'strong-conflict'); setSelection(null); }} className={`w-full p-2 border rounded flex items-center gap-3 transition ${connectionMode === 'strong-conflict' ? 'bg-sky-100 border-sky-500 ring-1 ring-sky-500' : 'bg-white hover:bg-gray-50'}`}><div className="relative w-8 h-4 flex items-center"><div className="absolute top-0 w-full border-t border-black"></div><div className="absolute bottom-0 w-full border-b border-black"></div><svg width="32" height="10" viewBox="0 0 32 10" className="absolute top-0 left-0 h-full w-full"><path d="M0 5 L4 2 L8 8 L12 2 L16 8 L20 2 L24 8 L28 2 L32 5" stroke="black" strokeWidth="1.5" fill="none" /></svg></div><span className="text-sm leading-tight">Forte ma Conflittuale</span></button>
                    </div>
                </div>
                <div className="pt-4 border-t">
                    <button onClick={() => {setNodes([]); setConnections([]); setSelection(null); setPan({x:0, y:0}); setZoom(1);}} className="text-gray-400 text-xs hover:text-red-500 underline w-full text-center">Reset Diagramma</button>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gray-50 min-h-screen py-8 px-4 flex flex-col">
            <div className="max-w-6xl mx-auto w-full flex-grow flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={onGoHome} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold transition-colors">
                        <ArrowLeftIcon />
                        Torna al menu
                    </button>
                    <button onClick={finishExercise} className="bg-green-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-700 shadow-md">
                        Salva Diagramma
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-lg flex flex-col md:flex-row flex-grow h-[80vh] overflow-hidden border border-gray-200">
                    <div className="w-full md:w-72 flex flex-col border-r bg-gray-50 p-4 overflow-y-auto">
                        {renderSidebarContent()}
                    </div>

                    <div className="flex-grow bg-white relative overflow-hidden">
                        {/* Help Text */}
                        <div className="absolute top-2 left-2 bg-white/90 p-2 rounded text-gray-500 text-xs pointer-events-none z-10 border border-gray-200 shadow-sm">
                            {connectionMode 
                                ? `MODALITÀ CONNESSIONE: ${connectionMode.toUpperCase()}. Clicca su due persone.` 
                                : `Clicca su un elemento per modificarlo. Trascina lo sfondo per muoverti.`}
                        </div>

                        {/* Zoom & Pan Controls */}
                        <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20 bg-white p-2 rounded-lg shadow-md border border-gray-200">
                            <div className="flex items-center justify-between gap-1 mb-1">
                                <button onClick={() => handleZoom(0.1)} className="p-1.5 hover:bg-gray-100 rounded text-gray-600" title="Zoom In"><PlusIcon /></button>
                                <span className="text-xs text-gray-500 w-8 text-center">{Math.round(zoom * 100)}%</span>
                                <button onClick={() => handleZoom(-0.1)} className="p-1.5 hover:bg-gray-100 rounded text-gray-600" title="Zoom Out"><MinusIcon /></button>
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                                <div></div>
                                <button onClick={() => handlePanButton(0, 50)} className="p-1 hover:bg-gray-100 rounded text-gray-600 flex justify-center"><ChevronUpIcon /></button>
                                <div></div>
                                <button onClick={() => handlePanButton(50, 0)} className="p-1 hover:bg-gray-100 rounded text-gray-600 flex justify-center"><ChevronLeftIcon /></button>
                                <button onClick={handleResetView} className="p-1 hover:bg-gray-100 rounded text-gray-600 flex justify-center" title="Reset Vista"><CenterIcon /></button>
                                <button onClick={() => handlePanButton(-50, 0)} className="p-1 hover:bg-gray-100 rounded text-gray-600 flex justify-center"><ChevronRightIcon /></button>
                                <div></div>
                                <button onClick={() => handlePanButton(0, -50)} className="p-1 hover:bg-gray-100 rounded text-gray-600 flex justify-center"><ChevronDownIcon /></button>
                                <div></div>
                            </div>
                        </div>
                        
                        <svg 
                            ref={svgRef}
                            className={`w-full h-full ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
                            onMouseDown={handleCanvasMouseDown}
                            onMouseMove={handleCanvasMouseMove}
                            onMouseUp={handleCanvasMouseUp}
                            onMouseLeave={handleCanvasMouseUp}
                        >
                            <defs>
                                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="gray" strokeWidth="0.5" opacity="0.1"/>
                                </pattern>
                            </defs>
                            
                            {/* Sfondo statico (opzionale, se vogliamo che la griglia si muova mettiamola dentro il g trasformato) */}
                            {/* Mettiamo la griglia DENTRO il gruppo trasformato così si muove con gli oggetti */}
                            
                            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                                {/* Grid molto grande per coprire l'area scrollabile virtuale */}
                                <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#grid)" />

                                {connections.map(conn => renderConnection(conn))}

                                {nodes.map(node => {
                                    const isSelected = selection?.type === 'node' && selection.id === node.id;
                                    return (
                                        <g 
                                            key={node.id} 
                                            transform={`translate(${node.x}, ${node.y})`}
                                            onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                                            onClick={(e) => handleNodeClick(node.id, e)}
                                            className="cursor-move group"
                                            style={{ transition: draggedNode === node.id ? 'none' : 'transform 0.1s' }}
                                        >
                                            {node.type === 'male' ? (
                                                <rect x="-20" y="-20" width="40" height="40" fill={isSelected ? "#eff6ff" : "white"} stroke={isSelected ? "#3b82f6" : "black"} strokeWidth={isSelected ? "3" : "2"} />
                                            ) : (
                                                <circle r="20" fill={isSelected ? "#eff6ff" : "white"} stroke={isSelected ? "#3b82f6" : "black"} strokeWidth={isSelected ? "3" : "2"} />
                                            )}
                                            <text y="35" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1f2937" className="pointer-events-none select-none">{node.name}</text>
                                            {node.description && (
                                                <text y="48" textAnchor="middle" fontSize="9" fill="#6b7280" className="pointer-events-none select-none">{node.description.substring(0, 10)}{node.description.length > 10 ? '...' : ''}</text>
                                            )}
                                        </g>
                                    );
                                })}

                                {connectionMode && selection?.type === 'node' && nodes.find(n => n.id === selection.id) && (
                                    <circle cx={nodes.find(n => n.id === selection.id)!.x} cy={nodes.find(n => n.id === selection.id)!.y} r="5" fill="#3b82f6" opacity="0.5" className="pointer-events-none" />
                                )}
                            </g>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RelationalDiagramTool;
