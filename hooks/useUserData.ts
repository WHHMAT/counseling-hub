import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { db } from '../firebase';
import firebase from 'firebase/compat/app';

export interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    exerciseCount: number;
    points: number;
    practiceTime: number; // in minutes
    rank: string;
    createdAt: firebase.firestore.Timestamp;
}

export function useUserData() {
    const { user } = useAuth();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setLoading(true);
            const unsubscribe = db.collection('users').doc(user.uid)
                .onSnapshot(doc => {
                    if (doc.exists) {
                        setUserData(doc.data() as UserData);
                    } else {
                        setUserData(null);
                    }
                    setLoading(false);
                }, error => {
                    console.error("Error fetching user data:", error);
                    setUserData(null);
                    setLoading(false);
                });
            
            return () => unsubscribe();
        } else {
            setUserData(null);
            setLoading(false);
        }
    }, [user]);

    return { userData, loading };
}
