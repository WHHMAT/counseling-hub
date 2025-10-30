import React from 'react';
import type { Tool } from './types';
import { UsersIcon, ClipboardListIcon, QuestionMarkCircleIcon, BookOpenIcon, LinkIcon } from './components/icons';

export const TOOLS: Tool[] = [
  {
    id: 'rogerian-reformulation',
    title: 'Partner di Riformulazione',
    description: 'Affina la tua abilità di ascolto attivo. Riformula la frase di un cliente evitando le trappole del VISSI e ricevi un feedback immediato dal supervisore AI.',
    icon: <UsersIcon />,
    actionText: 'Inizia Esercizio',
    comingSoon: false,
  },
  {
    id: 'rapport-pacing',
    title: 'Pratica del Rapport',
    description: 'Allenati a costruire il rapport con il cliente attraverso la tecnica del ricalco. Esplora diverse modalità di mirroring per creare una connessione empatica.',
    icon: <LinkIcon />,
    actionText: 'Inizia Esercizio',
    comingSoon: false,
  },
  {
    id: 'case-studies',
    title: 'Analisi di Casi Studio',
    description: 'Analizza scenari complessi di casi studio e sviluppa piani di trattamento efficaci. Ricevi feedback sulla tua analisi.',
    icon: <ClipboardListIcon />,
    actionText: 'Analizza un Caso',
    comingSoon: true,
  },
  {
    id: 'question-generator',
    title: 'Generatore di Domande',
    description: 'Ottieni una varietà di domande aperte, riflessive e potenti da utilizzare nelle tue sessioni per stimolare il dialogo.',
    icon: <QuestionMarkCircleIcon />,
    actionText: 'Genera Domande',
    comingSoon: true,
  },
  {
    id: 'reflection-journal',
    title: 'Diario di Riflessione Guidata',
    description: 'Utilizza prompt guidati per riflettere sulle tue sessioni, identificare punti di forza e aree di miglioramento personale.',
    icon: <BookOpenIcon />,
    actionText: 'Scrivi nel Diario',
    comingSoon: true,
  },
];
