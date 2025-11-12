import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUserData } from '../hooks/useUserData';
import { StarIcon, ClockIcon, TrophyIcon } from './icons';

const ArrowLeftIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
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
    
    const renderContent = () => {
        if (loading) {
            return <LoadingSpinner />;
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
                    <div className="h-24 w-24 bg-sky-600 rounded-full flex items-center justify-center text-white font-bold text-4xl flex-shrink-0">
                         {user.photoURL ? (
                            <img src={user.photoURL} alt="Foto profilo" className="h-full w-full rounded-full object-cover" />
                        ) : (
                            <span>{getUserInitials(user.displayName)}</span>
                        )}
                    </div>
                    <div className="text-center sm:text-left">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{user.displayName || `${userData.firstName} ${userData.lastName}`}</h1>
                        <p className="text-gray-600 text-lg">{user.email}</p>
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
