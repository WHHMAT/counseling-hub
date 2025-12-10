
export interface DropZone {
  id: string;
  title: string;
  subtitle: string;
  colorClasses: string;
}

export interface DraggableItem {
  id: string;
  text: string;
  correctZone: string;
}

export const DROP_ZONES: DropZone[] = [
  { id: 'pre-contatto', title: 'Pre Contatto', subtitle: 'Sensazione', colorClasses: 'bg-rose-50 border-rose-300' },
  { id: 'avvio-contatto', title: 'Avvio Contatto', subtitle: 'Consapevolezza', colorClasses: 'bg-amber-50 border-amber-300' },
  { id: 'contatto-pieno', title: 'Contatto Pieno', subtitle: 'Azione', colorClasses: 'bg-indigo-50 border-indigo-300' },
  { id: 'post-contatto', title: 'Post Contatto', subtitle: 'Integrazione', colorClasses: 'bg-sky-50 border-sky-300' },
];

export const DRAGGABLE_ITEMS: DraggableItem[] = [
  // --- PRE CONTATTO (Sensazione) ---
  // Descrizione Cerchio
  { id: 'pc_desc', text: "Accoglienza del cliente, conoscenza del suo mondo e creazione delle condizioni per l'autosvelamento.", correctZone: 'pre-contatto' },
  // Finalità
  { id: 'pc_f1', text: "Valutazione adattabilità del cliente al percorso", correctZone: 'pre-contatto' },
  { id: 'pc_f2', text: "Avvio dell'alleanza operativa (empatica e collaborativa)", correctZone: 'pre-contatto' },
  { id: 'pc_f3', text: "Stabilire fiducia e speranza", correctZone: 'pre-contatto' },
  { id: 'pc_f4', text: "Facilitare l'avvio dell'autosvelamento", correctZone: 'pre-contatto' },
  // Cosa Comprende
  { id: 'pc_c1', text: "Primo contatto telefonico", correctZone: 'pre-contatto' },
  { id: 'pc_c2', text: "Cura dello spazio di lavoro (privacy)", correctZone: 'pre-contatto' },
  { id: 'pc_c3', text: "Consegna del contratto", correctZone: 'pre-contatto' },
  { id: 'pc_c4', text: "Osservazione del non verbale", correctZone: 'pre-contatto' },
  { id: 'pc_c5', text: "Raccolta primi dati (storiografica)", correctZone: 'pre-contatto' },
  // Tecniche
  { id: 'pc_t1', text: "Osservazione Fenomenologica", correctZone: 'pre-contatto' },
  { id: 'pc_t2', text: "PNL (Sintonizzazione / Sistema rappr.)", correctZone: 'pre-contatto' },
  { id: 'pc_t3', text: "Ricalco semplice", correctZone: 'pre-contatto' },
  { id: 'pc_t4', text: "Ascolto Attivo (riformulazione)", correctZone: 'pre-contatto' },
  // Attitudini
  { id: 'pc_a1', text: "Atteggiamento non direttivo (ma supportivo)", correctZone: 'pre-contatto' },
  { id: 'pc_a2', text: "Congruenza e Autenticità", correctZone: 'pre-contatto' },
  // Ostacoli
  { id: 'pc_o1', text: "Contratto impossibile (aspettative irrealistiche)", correctZone: 'pre-contatto' },
  { id: 'pc_o2', text: "Voler cambiare l'altro o se stessi", correctZone: 'pre-contatto' },
  { id: 'pc_o3', text: "Contratti 'truffa' (solo tu mi puoi aiutare)", correctZone: 'pre-contatto' },
  { id: 'pc_o4', text: "Contratti basati sul 'devo'", correctZone: 'pre-contatto' },
  { id: 'pc_o5', text: "Difficoltà espressiva del cliente", correctZone: 'pre-contatto' },
  { id: 'pc_o6', text: "Difficoltà a creare fiducia", correctZone: 'pre-contatto' },

  // --- AVVIO CONTATTO (Consapevolezza) ---
  // Descrizione Cerchio
  { id: 'ac_desc', text: "Cliente prende consapevolezza della problematica e delinea l'obiettivo assieme al counselor.", correctZone: 'avvio-contatto' },
  // Finalità
  { id: 'ac_f1', text: "Nuova comprensione del problema e ridefinizione in termini di risorse", correctZone: 'avvio-contatto' },
  { id: 'ac_f2', text: "Definizione chiara dell'obiettivo SMART", correctZone: 'avvio-contatto' },
  { id: 'ac_f3', text: "Consolidamento alleanza operativa", correctZone: 'avvio-contatto' },
  // Definizione Richiesta
  { id: 'ac_dr1', text: "Individuare la tematica cruciale", correctZone: 'avvio-contatto' },
  { id: 'ac_dr2', text: "Individuare soluzioni tentate ed eccezioni", correctZone: 'avvio-contatto' },
  { id: 'ac_dr3', text: "Individuare livello di motivazione", correctZone: 'avvio-contatto' },
  // Esplorazione
  { id: 'ac_e1', text: "Esplorazione del problema da più punti di vista", correctZone: 'avvio-contatto' },
  { id: 'ac_e2', text: "Sviluppo consapevolezza sensoriale", correctZone: 'avvio-contatto' },
  // Tecniche
  { id: 'ac_t1', text: "Domande aperte", correctZone: 'avvio-contatto' },
  { id: 'ac_t2', text: "Metafore (esplorazione)", correctZone: 'avvio-contatto' },
  { id: 'ac_t3', text: "PNL (Confutazione pensieri irrazionali)", correctZone: 'avvio-contatto' },
  { id: 'ac_t4', text: "Strategia Disney / Domanda miracolosa", correctZone: 'avvio-contatto' },
  { id: 'ac_t5', text: "Continuum di consapevolezza", correctZone: 'avvio-contatto' },
  { id: 'ac_t6', text: "Linguaggio responsabilità (messaggio IO)", correctZone: 'avvio-contatto' },
  { id: 'ac_t7', text: "Osservazione del Non Verbale", correctZone: 'avvio-contatto' },
  // Attitudini
  { id: 'ac_a1', text: "Semi-direttività", correctZone: 'avvio-contatto' },
  { id: 'ac_a2', text: "Orientamento alla relazione e all'obiettivo", correctZone: 'avvio-contatto' },
  { id: 'ac_a3', text: "Consapevolezza dei confini / Centratura", correctZone: 'avvio-contatto' },
  // Ostacoli
  { id: 'ac_o1', text: "Difficoltà a stare col punto di vista del cliente", correctZone: 'avvio-contatto' },
  { id: 'ac_o2', text: "Resistenze alla consapevolezza (proiezione, deflessione)", correctZone: 'avvio-contatto' },
  { id: 'ac_o3', text: "Difficoltà gestione confini", correctZone: 'avvio-contatto' },
  { id: 'ac_o4', text: "Timore o aspettative nel ponte relazionale", correctZone: 'avvio-contatto' },

  // --- CONTATTO PIENO (Azione) ---
  // Descrizione Cerchio
  { id: 'cp_desc', text: "Fase centrale: mobilizzazione delle energie per agire il cambiamento.", correctZone: 'contatto-pieno' },
  // Finalità
  { id: 'cp_f1', text: "Esperienza di sé nuova e differente", correctZone: 'contatto-pieno' },
  { id: 'cp_f2', text: "Riacquisizione potere personale e autodeterminazione", correctZone: 'contatto-pieno' },
  { id: 'cp_f3', text: "Esplorazione del meccanismo di resistenza", correctZone: 'contatto-pieno' },
  // Passaggi Chiave
  { id: 'cp_pk1', text: "Personalizzazione: passaggio a locus of control interno", correctZone: 'contatto-pieno' },
  { id: 'cp_pk2', text: "Azione: sperimentare strategie nel 'qui e ora'", correctZone: 'contatto-pieno' },
  { id: 'cp_pk3', text: "Valutazione in itinere delle strategie", correctZone: 'contatto-pieno' },
  // Tecniche
  { id: 'cp_t1', text: "Analisi Transazionale (egogramma)", correctZone: 'contatto-pieno' },
  { id: 'cp_t2', text: "Gestalt e tecniche espressive", correctZone: 'contatto-pieno' },
  { id: 'cp_t3', text: "Role play", correctZone: 'contatto-pieno' },
  { id: 'cp_t4', text: "Brainstorming", correctZone: 'contatto-pieno' },
  { id: 'cp_t5', text: "Compiti a casa", correctZone: 'contatto-pieno' },
  // Attitudini
  { id: 'cp_a1', text: "Direttività", correctZone: 'contatto-pieno' },
  { id: 'cp_a2', text: "Orientamento al compito", correctZone: 'contatto-pieno' },
  // Ostacoli
  { id: 'cp_o1', text: "Meccanismi di interruzione del contatto", correctZone: 'contatto-pieno' },
  { id: 'cp_o2', text: "Evitamento o Drop out", correctZone: 'contatto-pieno' },
  { id: 'cp_o3', text: "Eccesso di razionalità (pensare invece di sentire)", correctZone: 'contatto-pieno' },

  // --- POST CONTATTO (Integrazione) ---
  // Descrizione Cerchio
  { id: 'pc2_desc', text: "Fase finale: assimilazione dell'esperienza, bilancio e scioglimento del contratto.", correctZone: 'post-contatto' },
  // Finalità
  { id: 'pc2_f1', text: "Assimilazione dell'esperienza", correctZone: 'post-contatto' },
  { id: 'pc2_f2', text: "Graduale scioglimento del contratto", correctZone: 'post-contatto' },
  { id: 'pc2_f3', text: "Elaborazione della separazione", correctZone: 'post-contatto' },
  { id: 'pc2_f4', text: "Investimento sul futuro in autonomia", correctZone: 'post-contatto' },
  // Tecniche
  { id: 'pc2_t1', text: "Riepilogo", correctZone: 'post-contatto' },
  { id: 'pc2_t2', text: "Tecniche di automonitoraggio (diario)", correctZone: 'post-contatto' },
  { id: 'pc2_t3', text: "Rinforzo dell'Io adulto", correctZone: 'post-contatto' },
  { id: 'pc2_t4', text: "Scala di valutazione", correctZone: 'post-contatto' },
  { id: 'pc2_t5', text: "Feedback fenomenologico finale", correctZone: 'post-contatto' },
  { id: 'pc2_t6', text: "Saluto del vecchio sé (foto/lettera/sedia vuota)", correctZone: 'post-contatto' },
  // Attitudini
  { id: 'pc2_a1', text: "Semi-direttività (fase conclusiva)", correctZone: 'post-contatto' },
  // Ostacoli
  { id: 'pc2_o1', text: "Autocoscienza eccessiva", correctZone: 'post-contatto' },
  { id: 'pc2_o2', text: "Eccesso di zelo o Perfezionismo", correctZone: 'post-contatto' },
  { id: 'pc2_o3', text: "Riluttanza o bramosia nel chiudere", correctZone: 'post-contatto' },
  { id: 'pc2_o4', text: "Problemi di attaccamento / Apparente regressione", correctZone: 'post-contatto' },
];
