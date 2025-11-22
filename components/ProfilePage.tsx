import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUserData } from '../hooks/useUserData';
import { StarIcon, ClockIcon, TrophyIcon, CameraIcon } from './icons';
import { storage, db } from '../firebase';
import { TOOLS } from '../constants';
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

const ProfilePage: React.FC<ProfilePageProps> = ({ onGoHome }) => {
    const { user } = useAuth();
    const { userData, loading } = useUserData();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [isHovering, setIsHovering] = useState(false);

    const reformulationSubtypeTitles: Record<string, string> = {
        'general': 'Riformulazione Generale',
        'simple': 'Riflessione Semplice',
        'echo': 'Riformulazione Eco',
        'paraphrase': 'Parafrasi',
        'elucidation': 'Delucidazione',
        'summary': 'Riepilogo'
    };

    const getToolTitle = (id: string): string => {
        if (id.startsWith('rogerian-reformulation-')) {
            const subtype = id.replace('rogerian-reformulation-', '');
            return `Riformulazione: ${reformulationSubtypeTitles[subtype] || subtype}`;
        }
        const tool = TOOLS.find(t => t.id === id);
        return tool ? tool.title : id;
    };


    const getUserInitials = (name: string | null | undefined): string => {
        if (!name) {
            const email = user?.email;
            return email ? email[0].toUpperCase() : 'U';
        }
        const parts = name.split(' ').filter(p => p);
        if (parts.length > 1) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            setUploadError('Per favore, seleziona un file immagine.');
            return;
        }
        
        setIsUploading(true);
        setUploadError('');

        const filePath = `profile_pictures/${user.uid}/${file.name}`;
        const storageRef = storage.ref(filePath);
        const uploadTask = storageRef.put(file);

        uploadTask.on(
            'state_changed',
            null,
            (error) => {
                console.error("Upload error:", error);
                setUploadError('Errore durante il caricamento. Riprova.');
                setIsUploading(false);
            },
            async () => {
                try {
                    const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                    await user.updateProfile({ photoURL: downloadURL });
                    await db.collection('users').doc(user.uid).update({ photoURL: downloadURL });
                } catch (error) {
                    console.error("Error updating profile:", error);
                    setUploadError('Errore durante l\'aggiornamento del profilo.');
                } finally {
                    setIsUploading(false);
                }
            }
        );
    };
    
    const renderContent = () => {
        if (loading) {
            return <LoadingSpinner size="h-12 w-12 py-10" />;
        }

        if (!user || !userData) {
            return (
                <div className="text-center py-10">
                    <p className="text-gray-600">Impossibile caricare i dati del profilo.</p>
                </div>
            );
        }

        return (
             <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
                    <div 
                        className="relative h-24 w-24 flex-shrink-0 cursor-pointer"
                        onClick={handleAvatarClick}
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                    >
                        <div className="h-full w-full bg-sky-600 rounded-full flex items-center justify-center text-white font-bold text-4xl">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="Foto profilo" className="h-full w-full rounded-full object-cover" />
                            ) : (
                                <span>{getUserInitials(user.displayName)}</span>
                            )}
                        </div>
                        <div className={`absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center transition-opacity ${isHovering || isUploading ? 'opacity-100' : 'opacity-0'}`}>
                            {isUploading ? <LoadingSpinner size="h-8 w-8" /> : <CameraIcon className="h-8 w-8 text-white" />}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/png, image/jpeg"
                            hidden
                        />
                    </div>
                    <div className="text-center sm:text-left">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{user.displayName || `${userData.firstName} ${userData.lastName}`}</h1>
                        <p className="text-gray-600 text-lg">{user.email}</p>
                        {uploadError && <p className="text-red-500 text-sm mt-2">{uploadError}</p>}
                    </div>
                </div>
                
                <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-6">Le tue Statistiche</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard 
                        icon={<StarIcon className="h-6 w-6 text-yellow-600" />}
                        label="Punti Esperienza"
                        value={userData.points}
                        color="bg-yellow-100"
                    />
                    <StatCard 
                        icon={<ClockIcon className="h-6 w-6 text-indigo-600" />}
                        label="Tempo di Pratica"
                        value={`${userData.practiceTime} min`}
                        color="bg-indigo-100"
                    />
                    <StatCard 
                        icon={<TrophyIcon className="h-6 w-6 text-green-600" />}
                        label="Rank Attuale"
                        value={userData.rank}
                        color="bg-green-100"
                    />
                </div>

                <div className="mt-10">
                    <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-6">Progresso per Strumento</h2>
                    <div className="space-y-5">
                       {Object.keys(EXERCISE_COUNTS).sort().map(toolId => {
                            const completedCount = userData.completedExercises?.[toolId]?.length || 0;
                            const totalCount = EXERCISE_COUNTS[toolId];
                            const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
                            const title = getToolTitle(toolId);

                            return (
                                <div key={toolId}>
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="text-md font-medium text-gray-700">{title}</h3>
                                        <span className="text-sm font-semibold text-gray-600">{completedCount} / {totalCount}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div 
                                            className="bg-sky-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <button onClick={onGoHome} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold mb-8 transition-colors">
                    <ArrowLeftIcon />
                    Torna al menu principale
                </button>

                {renderContent()}

                 <footer className="text-center py-8 mt-12">
                    <p className="text-gray-500">&copy; {new Date().getFullYear()} Hub Competenze Counseling. Tutti i diritti riservati.</p>
                </footer>
            </div>
        </div>
    );
};

export default ProfilePage;