import React, { useState, useEffect } from 'react';
// FIX: Switched to Firebase v8 compat syntax.
import firebase from 'firebase/compat/app';
import { auth, db } from '../firebase';

const GoogleIcon: React.FC = () => (
    <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
);

interface AuthPageProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'login' | 'register';
}

const AuthPage: React.FC<AuthPageProps> = ({ isOpen, onClose, initialMode }) => {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  if (!isOpen) return null;

  const handleFirebaseError = (err: any) => {
      switch (err.code) {
          case 'auth/user-not-found': return 'Nessun utente trovato con questa email.';
          case 'auth/wrong-password': return 'Password errata. Riprova.';
          case 'auth/email-already-in-use': return 'Questa email è già registrata. Prova ad accedere.';
          case 'auth/weak-password': return 'La password deve essere di almeno 6 caratteri.';
          case 'auth/invalid-email': return 'Inserisci un indirizzo email valido.';
          default: return 'Si è verificato un errore. Riprova.';
      }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName) {
        setError("Nome e cognome sono richiesti.");
        return;
    }
    setLoading(true);
    setError('');
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      if (user) {
        await user.updateProfile({
          displayName: `${firstName} ${lastName}`
        });
        await db.collection('users').doc(user.uid).set({
          firstName,
          lastName,
          email: user.email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          exerciseCount: 0,
          points: 0,
          practiceTime: 0,
          rank: 'Novizio'
        });
        onClose();
      }
    } catch (err) {
      setError(handleFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      try {
          await auth.signInWithEmailAndPassword(email, password);
          onClose();
      } catch (err) {
          setError(handleFirebaseError(err));
      } finally {
          setLoading(false);
      }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      const result = await auth.signInWithPopup(provider);
      const user = result.user;
      if (user && result.additionalUserInfo?.isNewUser) {
        const nameParts = user.displayName?.split(' ') || ['',''];
        await db.collection('users').doc(user.uid).set({
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(' '),
          email: user.email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          exerciseCount: 0,
          points: 0,
          practiceTime: 0,
          rank: 'Novizio'
        });
      }
      onClose();
    } catch (err) {
      setError(handleFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="relative bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center transform transition-all" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{mode === 'register' ? 'Crea un Account' : 'Accedi al tuo Account'}</h2>
        <p className="text-gray-600 mb-6">
          {mode === 'register' ? 'Per salvare i tuoi progressi e accedere a tutte le funzionalità.' : 'Bentornato/a! Accedi per continuare.'}
        </p>

        <div className="flex justify-center bg-gray-100 rounded-full p-1 mb-6">
            <button onClick={() => { setMode('register'); setError(''); }} className={`w-1/2 py-2 rounded-full text-sm font-semibold transition-colors ${mode === 'register' ? 'bg-white text-sky-600 shadow' : 'text-gray-600'}`}>Registrati</button>
            <button onClick={() => { setMode('login'); setError(''); }} className={`w-1/2 py-2 rounded-full text-sm font-semibold transition-colors ${mode === 'login' ? 'bg-white text-sky-600 shadow' : 'text-gray-600'}`}>Accedi</button>
        </div>

        <form onSubmit={mode === 'register' ? handleRegister : handleLogin} className="space-y-4 text-left">
          {mode === 'register' && (
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cognome</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"/>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"/>
          </div>

          {error && <p className="text-red-500 text-sm text-center pt-2">{error}</p>}

          <div className="pt-2">
            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-gray-400">
              {loading ? 'Caricamento...' : (mode === 'register' ? 'Registrati' : 'Accedi')}
            </button>
          </div>
        </form>
        
        <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-sm">oppure</span>
            <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <button onClick={handleGoogleSignIn} disabled={loading} className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-gray-200">
          <GoogleIcon />
          {mode === 'register' ? 'Registrati con Google' : 'Accedi con Google'}
        </button>

      </div>
    </div>
  );
};

export default AuthPage;
