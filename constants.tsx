import React from 'react';
import type { Tool } from './types';
import { UsersIcon, ClipboardListIcon, QuestionMarkCircleIcon, BookOpenIcon, LinkIcon, PyramidIcon, TargetIcon, ClipboardCheckIcon, ScaleIcon, GridIcon, LightBulbIcon, WheelIcon, PencilAltIcon, HandshakeIcon } from './components/icons';

export const PROFESSIONAL_TOOLS: Tool[] = [
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
];

export const PERSONAL_TOOLS: Tool[] = [
  {
    id: 'gordon-method',
    title: 'Metodo Gordon per Conflitti',
    description: 'Impara a risolvere i conflitti in modo costruttivo attraverso un role-play guidato in 6 fasi. Sviluppa l\'ascolto attivo e la negoziazione.',
    icon: <HandshakeIcon />,
    actionText: 'Inizia Esercizio',
    comingSoon: false,
  },
  {
    id: 'personal-diary',
    title: 'Diario Personale',
    description: 'Uno spazio guidato e sicuro per la scrittura riflessiva. Trasforma gli eventi quotidiani in consapevolezza e crescita personale.',
    icon: <PencilAltIcon />,
    actionText: 'Apri il Diario',
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
    id: 'smart-goal',
    title: 'Obiettivo SMART',
    description: 'Impara a definire obiettivi ben formati con il cliente utilizzando il modello S.M.A.R.T. (Specifico, Misurabile, Raggiungibile, Rilevante, Temporizzato).',
    icon: <TargetIcon />,
    actionText: 'Definisci un Obiettivo',
    comingSoon: false,
  },
  {
    id: 'wheel-of-life',
    title: 'La Ruota della Vita',
    description: 'Visualizza l\'equilibrio della tua vita. Valuta la tua soddisfazione in 8 aree chiave e ottieni spunti per la tua crescita personale.',
    icon: <WheelIcon />,
    actionText: 'Inizia Valutazione',
    comingSoon: false,
  },
  {
    id: 'eisenhower-matrix',
    title: 'Pianificare con la matrice di Eisenhower',
    description: 'Inserisci i tuoi impegni e, attraverso domande mirate, impara a dare le giuste priorità inserendoli nei quattro quadranti della matrice.',
    icon: <GridIcon />,
    actionText: 'Inizia a Pianificare',
    comingSoon: false,
  },
  {
    id: 'vision-crafting',
    title: 'Definisci la tua Vision',
    description: 'Un percorso guidato per esplorare valori e passioni e creare una vision statement personale che ti ispiri e ti guidi nel tuo percorso.',
    icon: <LightBulbIcon />,
    actionText: 'Inizia il Percorso',
    comingSoon: false,
  },
  {
    id: 'self-assessment-hub',
    title: 'Test di Autovalutazione',
    description: 'Esplora diverse aree di te stesso con i nostri test di auto-riflessione, come autostima, giudice interiore e altro.',
    icon: <ClipboardCheckIcon />,
    actionText: 'Scegli un Test',
    comingSoon: false,
  },
];