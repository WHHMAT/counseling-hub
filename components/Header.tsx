import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { auth } from '../firebase';
// FIX: Removed modular signOut import for v8 compat syntax.

interface HeaderProps {
    onGoHome: () => void;
    onShowAuth: (mode: 'login' | 'register') => void;
    onShowProfile: () => void;
}

const Header: React.FC<HeaderProps> = ({ onGoHome, onShowAuth, onShowProfile }) => {
    const { user, loading } = useAuth();

    const handleLogout = async () => {
        try {
            // FIX: Use v8 compat syntax for signOut.
            await auth.signOut();
            onGoHome();
        } catch (error) {
            console.error("Errore durante il logout:", error);
        }
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
    
    return (
        <header className="bg-white shadow-md sticky top-0 z-40">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <button onClick={onGoHome} className="flex-shrink-0 text-sky-600 font-bold text-xl hover:text-sky-800 transition-colors">
                            Hub Competenze Counseling
                        </button>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <button 
                            onClick={onGoHome} 
                            className="text-gray-600 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Hub
                        </button>
                        
                        {loading ? (
                            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded-md"></div>
                        ) : user ? (
                            <>
                                <button
                                    onClick={onShowProfile}
                                    className="h-10 w-10 bg-sky-600 rounded-full flex items-center justify-center text-white font-bold text-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                                    title="Vai al profilo"
                                >
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt="Foto profilo" className="h-full w-full rounded-full object-cover" />
                                    ) : (
                                        <span>{getUserInitials(user.displayName)}</span>
                                    )}
                                </button>
                                <button 
                                    onClick={handleLogout}
                                    className="text-gray-600 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Esci
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    onClick={() => onShowAuth('login')}
                                    className="text-gray-600 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Accedi
                                </button>
                                <button 
                                    onClick={() => onShowAuth('register')}
                                    className="bg-sky-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-sky-700 transition-all"
                                >
                                    Registrati
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;