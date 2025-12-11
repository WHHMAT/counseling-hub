
export interface Rank {
  name: string;
  minPoints: number;
  message: string;
}

export const RANKS: Rank[] = [
  { name: 'Novizio', minPoints: 0, message: 'Benvenuto all\'inizio del tuo viaggio.' },
  { name: 'Apprendista', minPoints: 50, message: 'Stai iniziando a costruire le tue basi.' },
  { name: 'Praticante', minPoints: 150, message: 'La tua costanza sta dando frutti.' },
  { name: 'Ascoltatore Esperto', minPoints: 300, message: 'Sai cogliere le sfumature della comunicazione.' },
  { name: 'Facilitatore', minPoints: 500, message: 'Guidi il cliente con sicurezza.' },
  { name: 'Counselor Senior', minPoints: 800, message: 'Hai acquisito una solida competenza.' },
  { name: 'Maestro di Relazione', minPoints: 1200, message: 'Hai raggiunto un livello di eccellenza e saggezza.' },
];

export const getRankForPoints = (points: number): Rank => {
    // Trova il rank più alto che l'utente ha raggiunto
    return RANKS.slice().reverse().find(r => points >= r.minPoints) || RANKS[0];
};

export const getNextRank = (points: number): Rank | null => {
    return RANKS.find(r => r.minPoints > points) || null;
};
