
import React from 'react';
import type { Tool } from './types';
import { UsersIcon, ClipboardListIcon, QuestionMarkCircleIcon, BookOpenIcon, LinkIcon, PyramidIcon, TargetIcon, ClipboardCheckIcon, ScaleIcon, GridIcon, LightBulbIcon, WheelIcon, PencilAltIcon, HandshakeIcon, MapIcon, BrainIcon, UserCircleIcon, ChatBubbleLeftRightIcon, GestaltIcon, SparklesIcon, ClockIcon, BriefcaseIcon, UserIcon } from './components/icons';

export const PNL_TOOLS: Tool[] = [
  {
    id: 'rapport-pacing',
    title: 'Pratica del Rapport',
    description: 'Allenati a costruire il rapport con il cliente attraverso la tecnica del ricalco. Esplora diverse modalità di mirroring per creare una connessione empatica.',
    icon: <LinkIcon />,
    actionText: 'Inizia Esercizio',
  },
  {
    id: 'nlp-client-map',
    title: 'PNL - La Mappa del Cliente',
    description: 'Analizza il discorso di un cliente per identificare Cancellazioni, Generalizzazioni e Deformazioni (Metamodello PNL) e ricevi un feedback dall\'AI.',
    icon: <MapIcon />,
    actionText: 'Inizia Analisi',
  },
];

export const ROGERIAN_TOOLS: Tool[] = [
  {
    id: 'rogerian-reformulation',
    title: 'Partner di Riformulazione',
    description: 'Affina la tua abilità di ascolto attivo. Riformula la frase di un cliente evitando le trappole del VISSI e ricevi un feedback immediato dal supervisore AI.',
    icon: <UsersIcon />,
    actionText: 'Inizia Esercizio',
  },
  {
    id: 'vissi-explorer',
    title: 'Scopri il VISSI',
    description: 'Impara a riconoscere le risposte trappola (Valutare, Interpretare, Soluzionare, Sostenere, Investigare) con esempi pratici e quiz interattivi.',
    icon: <QuestionMarkCircleIcon />,
    actionText: 'Inizia Esercizio',
  },
  {
    id: 'phenomenological-feedback',
    title: 'Feedback Fenomenologico',
    description: "Allenati a fornire un feedback basato sul 'qui e ora', senza interpretazioni o giudizi, per aumentare la consapevolezza del cliente.",
    icon: <BookOpenIcon />,
    actionText: 'Inizia Pratica',
  },
];

export const TRANSACTIONAL_TOOLS: Tool[] = [
    {
        id: 'ego-states',
        title: "Riconoscere gli Stati dell'Io",
        description: "Impara a distinguere tra Genitore (Normativo/Affettivo), Adulto e Bambino (Libero/Adattato). Analizza frasi e comportamenti per identificare lo stato attivo.",
        icon: <UserIcon />,
        actionText: 'Inizia Analisi',
    }
];

export const PROFESSIONAL_TOOLS: Tool[] = [
  {
    id: 'rogerian-hub',
    title: 'Rogers - Approccio centrato sulla persona',
    description: "Esercitati sui pilastri dell'approccio Rogersiano: ascolto attivo, empatia e feedback non giudicante.",
    icon: <UserCircleIcon />,
    actionText: 'Apri Sezione',
  },
  {
    id: 'transactional-hub',
    title: 'Strumenti di Analisi Transazionale',
    description: 'Esplora i concetti di Genitore, Adulto e Bambino, i giochi psicologici e gli script di vita per una maggiore consapevolezza relazionale.',
    icon: <ChatBubbleLeftRightIcon />,
    actionText: 'Apri Sezione',
    comingSoon: false,
  },
  {
    id: 'nlp-hub',
    title: 'Strumenti di PNL',
    description: 'Esplora le tecniche della Programmazione Neuro-Linguistica per comprendere la mappa del mondo del cliente e costruire un rapport efficace.',
    icon: <BrainIcon />,
    actionText: 'Apri Sezione',
  },
  {
    id: 'pluralistic-hub',
    title: 'Metodo Pluralistico Integrato',
    description: 'Impara ad integrare diversi approcci di counseling per creare un intervento su misura per ogni cliente. Esplora come combinare tecniche rogersiane, PNL, sistemiche e altre in modo coerente ed efficace.',
    icon: <BriefcaseIcon />,
    actionText: 'Apri Sezione',
    comingSoon: false,
  },
  {
    id: 'gestalt-tools',
    title: 'Strumenti di Gestalt',
    description: "Pratica le tecniche della Gestalt come la sedia vuota e il dialogo con le parti per integrare le polarità e vivere nel 'qui e ora'.",
    icon: <GestaltIcon />,
    actionText: 'Inizia Pratica',
    comingSoon: true,
  },
  {
    id: 'systemic-relational',
    title: 'Strumenti di approccio sistemico relazionale',
    description: 'Esplora le dinamiche relazionali e familiari. Allenati su strumenti come il genogramma e le domande circolari per comprendere i sistemi in cui vive il cliente.',
    icon: <UsersIcon />,
    actionText: 'Esplora Strumenti',
    comingSoon: true,
  },
  {
    id: 'brief-counseling',
    title: 'Strumenti di counseling breve',
    description: 'Apprendi tecniche focalizzate sulla soluzione (Solution-Focused Brief Therapy) per aiutare i clienti a raggiungere obiettivi specifici in un numero limitato di sessioni.',
    icon: <ClockIcon className="h-10 w-10" />,
    actionText: 'Inizia Esercizi',
    comingSoon: true,
  },
  {
    id: 'attachment-theory',
    title: "Strumenti legati alla teoria dell'Attaccamento",
    description: 'Approfondisci gli stili di attaccamento (sicuro, insicuro-evitante, insicuro-ambivalente) e impara a riconoscere il loro impatto sulle relazioni adulte del cliente.',
    icon: <LinkIcon />,
    actionText: 'Inizia Studio',
    comingSoon: true,
  },
  {
    id: 'mindfulness-tools',
    title: 'Strumenti di Mindfulness',
    description: 'Sviluppa strumenti basati sulla consapevolezza per te e per i tuoi clienti, per gestire lo stress e aumentare la presenza mentale.',
    icon: <SparklesIcon />,
    actionText: 'Inizia Esercizi',
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

export const PLURALISTIC_TOOLS: Tool[] = [
  {
    id: 'counseling-process',
    title: 'Processo di Counseling',
    description: "Esplora e pratica le fasi chiave del processo di counseling, dalla creazione dell'alleanza terapeutica alla conclusione del percorso.",
    icon: <ClipboardListIcon />,
    actionText: 'Inizia Esercizio',
    comingSoon: false,
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