
import { useEffect, useRef } from 'react';
import { db } from '../firebase';
import firebase from 'firebase/compat/app';
import { useAuth } from './useAuth';

const HUB_IDS = ['professional-hub', 'personal-hub', 'nlp-hub', 'rogerian-hub', 'pluralistic-hub', 'profile'];

export function usePracticeTimer(activeView: string | null) {
    const { user } = useAuth();
    const startTimeRef = useRef<number | null>(null);
    const currentToolRef = useRef<string | null>(null);

    useEffect(() => {
        // Funzione per salvare il tempo trascorso
        const saveSessionTime = async () => {
            if (startTimeRef.current && user && currentToolRef.current) {
                const endTime = Date.now();
                const durationInMinutes = (endTime - startTimeRef.current) / 1000 / 60;

                // Salviamo solo se la sessione è durata più di 10 secondi (per evitare click accidentali)
                // e meno di 4 ore (per evitare che il timer corra se uno lascia il pc aperto)
                if (durationInMinutes > 0.15 && durationInMinutes < 240) {
                    try {
                        const userRef = db.collection('users').doc(user.uid);
                        await userRef.update({
                            practiceTime: firebase.firestore.FieldValue.increment(Math.round(durationInMinutes))
                        });
                    } catch (error) {
                        console.error("Errore nel salvataggio del tempo di pratica:", error);
                    }
                }
            }
            // Reset
            startTimeRef.current = null;
            currentToolRef.current = null;
        };

        // Se stavamo tracciando uno strumento, salviamo il tempo prima di cambiare
        if (currentToolRef.current) {
            saveSessionTime();
        }

        // Se la nuova vista è uno strumento (non null e non un hub/profilo), iniziamo il tracciamento
        if (activeView && !HUB_IDS.includes(activeView)) {
            startTimeRef.current = Date.now();
            currentToolRef.current = activeView;
        }

        // Cleanup quando il componente viene smontato (chiusura app)
        return () => {
            if (currentToolRef.current) {
                saveSessionTime();
            }
        };
    }, [activeView, user]);
}
