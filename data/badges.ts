
import { UserData } from '../hooks/useUserData';
import { EXERCISE_COUNTS } from './exerciseCounts';
import { RANKS } from './rankSystem';

export interface Badge {
    id: string;
    name: string;
    description: string;
    type: 'rank' | 'achievement' | 'mastery';
    iconColor: string; // Tailwind class, es 'text-yellow-500'
    check: (userData: UserData) => boolean;
}

// Funzione helper per contare gli esercizi completati per un dato tool ID
const getCompletedCount = (userData: UserData, toolId: string): number => {
    return userData.completedExercises?.[toolId]?.length || 0;
};

// Funzione helper per verificare se un tool è stato "masterato" (tutti gli esercizi fatti)
const isToolMastered = (userData: UserData, toolId: string): boolean => {
    const required = EXERCISE_COUNTS[toolId] || 0;
    return getCompletedCount(userData, toolId) >= required;
};

export const BADGES: Badge[] = [
    // --- RANK BADGES ---
    ...RANKS.map((rank, index) => ({
        id: `rank-${index}`,
        name: rank.name,
        description: `Raggiungi il rango di ${rank.name}`,
        type: 'rank' as const,
        iconColor: 'text-amber-500',
        check: (userData: UserData) => userData.points >= rank.minPoints
    })),

    // --- TOOL MASTERY BADGES (Completamento di uno strumento specifico) ---
    {
        id: 'architetto-bisogni',
        name: 'Architetto dei Bisogni',
        description: 'Completa tutte le storie della Piramide di Maslow.',
        type: 'achievement',
        iconColor: 'text-purple-500',
        check: (data) => isToolMastered(data, 'maslow-pyramid')
    },
    {
        id: 'cacciatore-trappole',
        name: 'Rilevatore di Trappole',
        description: 'Identifica tutte le trappole del VISSI.',
        type: 'achievement',
        iconColor: 'text-red-500',
        check: (data) => isToolMastered(data, 'vissi-explorer')
    },
    {
        id: 'stratega-obiettivi',
        name: 'Stratega di Obiettivi',
        description: 'Completa tutti gli scenari degli Obiettivi SMART.',
        type: 'achievement',
        iconColor: 'text-green-500',
        check: (data) => isToolMastered(data, 'smart-goal')
    },
    {
        id: 'costruttore-ponti',
        name: 'Costruttore di Ponti',
        description: 'Completa tutti gli scenari del Metodo Gordon.',
        type: 'achievement',
        iconColor: 'text-blue-500',
        check: (data) => isToolMastered(data, 'gordon-method')
    },
    {
        id: 'osservatore-puro',
        name: 'Osservatore Puro',
        description: 'Completa tutti gli esercizi di Feedback Fenomenologico.',
        type: 'achievement',
        iconColor: 'text-indigo-500',
        check: (data) => isToolMastered(data, 'phenomenological-feedback')
    },
    {
        id: 'cartografo-mente',
        name: 'Cartografo della Mente',
        description: 'Completa tutte le analisi della Mappa del Cliente (PNL).',
        type: 'achievement',
        iconColor: 'text-pink-500',
        check: (data) => isToolMastered(data, 'nlp-client-map')
    },
    {
        id: 'diario-vivente',
        name: 'Diario Vivente',
        description: 'Scrivi almeno 5 voci nel tuo Diario Personale.',
        type: 'achievement',
        iconColor: 'text-teal-500',
        check: (data) => getCompletedCount(data, 'personal-diary') >= 5
    },
    {
        id: 'biografo-anima',
        name: 'Biografo dell\'Anima',
        description: 'Scrivi almeno 20 voci nel tuo Diario Personale.',
        type: 'achievement',
        iconColor: 'text-teal-600',
        check: (data) => getCompletedCount(data, 'personal-diary') >= 20
    },
    {
        id: 'analista-transazionale',
        name: 'Analista Transazionale',
        description: 'Completa l\'analisi di almeno 5 scenari sugli Stati dell\'Io.',
        type: 'achievement',
        iconColor: 'text-indigo-600',
        check: (data) => getCompletedCount(data, 'ego-states') >= 5
    },
    {
        id: 'architetto-sistemico',
        name: 'Architetto di Sistemi',
        description: 'Crea e salva il tuo primo Diagramma Relazionale.',
        type: 'achievement',
        iconColor: 'text-cyan-600',
        check: (data) => getCompletedCount(data, 'relational-diagram') >= 1
    },
    
    // --- HUB MASTERY (Badge Speciali per Aree) ---
    {
        id: 'erede-rogers',
        name: 'Erede di Rogers',
        description: 'Completa tutti gli esercizi dell\'approccio Centrato sulla Persona (Riformulazione, VISSI, Feedback).',
        type: 'mastery',
        iconColor: 'text-sky-600',
        check: (data) => {
            // Controlla tutti i tipi di riformulazione + vissi + feedback
            const reformulationTypes = ['general', 'simple', 'echo', 'paraphrase', 'elucidation', 'summary'];
            const allReformulationsDone = reformulationTypes.every(type => 
                isToolMastered(data, `rogerian-reformulation-${type}`)
            );
            return allReformulationsDone && 
                   isToolMastered(data, 'vissi-explorer') && 
                   isToolMastered(data, 'phenomenological-feedback');
        }
    },
    {
        id: 'master-pnl',
        name: 'Master Practitioner',
        description: 'Completa tutti gli strumenti di PNL (Rapport e Mappa del Cliente).',
        type: 'mastery',
        iconColor: 'text-violet-600',
        check: (data) => isToolMastered(data, 'rapport-pacing') && isToolMastered(data, 'nlp-client-map')
    },
    {
        id: 'visionario',
        name: 'Visionario',
        description: 'Completa la Ruota della Vita, la Matrice di Eisenhower e definisci la tua Vision.',
        type: 'mastery',
        iconColor: 'text-yellow-500',
        check: (data) => isToolMastered(data, 'wheel-of-life') && isToolMastered(data, 'eisenhower-matrix') && isToolMastered(data, 'vision-crafting')
    }
];
