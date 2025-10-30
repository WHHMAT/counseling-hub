import React from 'react';
import type { Tool } from './types';
import { UsersIcon, ClipboardListIcon, QuestionMarkCircleIcon, BookOpenIcon, LinkIcon, PyramidIcon } from './components/icons';

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
    id: 'maslow-pyramid',
    title: 'Piramide di Maslow',
    description: "Leggi la storia di un cliente e identifica i suoi bisogni secondo la gerarchia di Maslow. Ricevi un'analisi dettagliata sulla tua valutazione.",
    icon: <PyramidIcon />,
    actionText: 'Inizia Esercizio',
    comingSoon: false,
  },
  {
    id: 'vissi-explorer',
    title: 'Scopri il VISSI',
    description: 'Impara a riconoscere le risposte trappola (Valutare, Interpretare, Soluzionare, Sostenere, Investigare) con esempi pratici e quiz interattivi.',
    icon: <QuestionMarkCircleIcon />,
    actionText: 'Inizia Esercizio',
    comingSoon: false,
  },
  {
    id: 'phenomenological-feedback',
    title: 'Feedback Fenomenologico',
    description: "Allenati a fornire un feedback basato sul 'qui e ora', senza interpretazioni o giudizi, per aumentare la consapevolezza del cliente.",
    icon: <BookOpenIcon />,
    actionText: 'Inizia Pratica',
    comingSoon: true,
  },
  {
    id: 'case-studies',
    title: 'Analisi di Casi Studio',
    description: 'Analizza scenari complessi di casi studio e sviluppa piani di trattamento efficaci. Ricevi feedback sulla tua analisi.',
    icon: <ClipboardListIcon />,
    actionText: 'Analizza un Caso',
    comingSoon: true,
  },
];