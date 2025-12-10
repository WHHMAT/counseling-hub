
import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUserData } from '../hooks/useUserData';
import { StarIcon, ClockIcon, TrophyIcon, CameraIcon } from './icons';
import { storage, db } from '../firebase';
import { PROFESSIONAL_TOOLS, PERSONAL_TOOLS } from '../constants';
import { EXERCISE_COUNTS } from '../data/exerciseCounts';


const ArrowLeftIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const LoadingSpinner: React.FC<{ size?: string }> = ({ size = "h-12 w-12" }) => (
    <div className="flex justify-center items-center">
        <div className={`animate-spin rounded-full border-b-2 border-sky-600 ${size}`}></div>
    </div>
);

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string }> = ({ icon, label, value, color }) => (
    <div className="bg-gray-50 rounded-xl p-5 flex items-center space-x-4 border">
        <div className={`rounded-full p-3 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-gray-500 text-sm font-medium">{label}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

interface ProfilePageProps {
    onGoHome: () => void;
}

const TOOLS = [...PROFESSIONAL_TOOLS, ...PERSONAL_TOOLS];

const ProfilePage: React.FC<ProfilePageProps> = ({ onGoHome }) => {
    const { user } = useAuth();
    const { userData, loading: userDataLoading } = useUserData();
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;
        
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            setError("L'immagine è troppo grande. Il limite è 2MB.");
            return;
        }

        setUploading(true);
        setError('');

        try {
            const storageRef = storage.ref(`avatars/${user.uid}/${file.name}`);
            const uploadTask = await storageRef.put(file);
            const photoURL = await uploadTask.ref.getDownloadURL();
            
            await user.updateProfile({ photoURL });
            await db.collection('users').doc(user.uid).update({ photoURL });

        } catch (err) {
            console.error("Error uploading image:", err);
            setError("Errore durante il caricamento dell'immagine. Riprova.");
        } finally {
            setUploading(false);
        }
    };
    
    const getTotalCompletedExercises = () => {
        if (!userData?.completedExercises) return 0;
        const exercisesValues = Object.values(userData.completedExercises) as (string | number)[][];
        return exercisesValues.reduce((total: number, exercises) => total + new Set(exercises).size, 0);
    };

    const getTotalPossibleExercises = () => {
        return Object.values(EXERCISE_COUNTS).reduce((total, count) => total + count, 0);
    };

    if (userDataLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (!user || !userData) {
        return (
            <div className="text-center py-20">
                <p>Per favore, accedi per vedere il tuo profilo.</p>
            </div>
        )
    }

    const totalCompleted = getTotalCompletedExercises();
    const totalPossible = getTotalPossibleExercises();
    const overallProgress = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
    
    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <button onClick={onGoHome} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold mb-8 transition-colors">
                    <ArrowLeftIcon />
                    Torna al menu principale
                </button>
                
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                        <div className="relative">
                            <button onClick={handleAvatarClick} className="h-24 w-24 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-bold text-3xl hover:bg-sky-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500" title="Cambia foto profilo">
                                {uploading ? (
                                    <LoadingSpinner size="h-8 w-8" />
                                ) : user.photoURL ? (
                                    <img src={user.photoURL} alt="Foto profilo" className="h-full w-full rounded-full object-cover" />
                                ) : (
                                    <span>{userData.firstName?.[0]}{userData.lastName?.[0]}</span>
                                )}
                                <div className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-md">
                                    <CameraIcon className="h-5 w-5 text-gray-600" />
                                </div>
                            </button>
                            <input type="file" accept="image/png, image/jpeg" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                        </div>
                         <div>
                            <h1 className="text-3xl font-bold text-gray-900 text-center sm:text-left">{userData.firstName} {userData.lastName}</h1>
                            <p className="text-gray-500 text-center sm:text-left">{userData.email}</p>
                        </div>
                    </div>
                     {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                    
                    <div className="mt-8 border-t pt-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Le tue Statistiche</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <StatCard icon={<StarIcon />} label="Punti Esperienza" value={userData.points} color="bg-yellow-100 text-yellow-600" />
                            <StatCard icon={<TrophyIcon />} label="Rank" value={userData.rank} color="bg-amber-100 text-amber-600" />
                            <StatCard icon={<ClockIcon />} label="Esercizi Completati" value={userData.exerciseCount} color="bg-sky-100 text-sky-600" />
                        </div>
                    </div>

                    <div className="mt-8 border-t pt-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Progresso Generale</h2>
                         <div className="w-full bg-gray-200 rounded-full h-4">
                            <div className="bg-green-500 h-4 rounded-full text-center text-white text-xs font-bold" style={{ width: `${overallProgress}%` }}>
                                {overallProgress > 10 && `${overallProgress}%`}
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 text-right mt-1">{totalCompleted} / {totalPossible} esercizi unici completati</p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
