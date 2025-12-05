import React, { useState, useEffect } from 'react';
// FIX: Switched to Firebase v8 compat syntax.
import firebase from 'firebase/compat/app';
import { auth, db } from '../firebase';
import { BookOpenIcon, OfficeBuildingIcon, BriefcaseIcon, UserIcon } from './icons';


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

type UserType = 'counselor-in-training' | 'school-manager' | 'professional-counselor' | 'client';

const ROLES = [
    { id: 'counselor-in-training', title: 'Counselor in formazione', icon: <BookOpenIcon className="h-8 w-8 text-sky-600" /> },
    { id: 'school-manager', title: 'Gestore account scuola', icon: <OfficeBuildingIcon className="h-8 w-8 text-sky-600" /> },
    { id: 'professional-counselor', title: 'Counselor professionista', icon: <BriefcaseIcon className="h-8 w-8 text-sky-600" /> },
    { id: 'client', title: 'Cliente del counselor professionista', icon: <UserIcon className="h-8 w-8 text-sky-600" /> }
];


const AuthPage: React.FC<AuthPageProps> = ({ isOpen, onClose, initialMode }) => {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [registrationStep, setRegistrationStep] = useState(1);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [referralCode, setReferralCode] = useState('');
  const [schoolAffiliation, setSchoolAffiliation] = useState('');

  const resetState = () => {
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setError('');
      setLoading(false);
      setRegistrationStep(1);
      setUserType(null);
      setReferralCode('');
      setSchoolAffiliation('');
  };

  const handleClose = () => {
      resetState();
      onClose();
  };


  useEffect(() => {
    setMode(initialMode);
    resetState();
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleFirebaseError = (err: any) => {
      console.error("Firebase Auth Error:", err.code); // Per debugging
      switch (err.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
              return 'Credenziali non valide. Controlla email e password.';
          case 'auth/email-already-in-use': return 'Questa email è già registrata. Prova ad accedere.';
          case 'auth/weak-password': return 'La password deve essere di almeno 6 caratteri.';
          case 'auth/invalid-email': return 'Inserisci un indirizzo email valido.';
          case 'auth/too-many-requests': return 'Troppi tentativi di accesso falliti. Riprova più tardi.';
          default: return 'Si è verificato un errore. Riprova.';
      }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName) {
        setError("Nome e cognome sono richiesti.");
        return;
    }
     if (userType === 'client' && !referralCode) {
        setError("Il codice di riferimento è obbligatorio per i clienti.");
        return;
    }
    if ((userType === 'counselor-in-training' || userType === 'school-manager') && !schoolAffiliation) {
        setError("La scuola di appartenenza è obbligatoria per questo ruolo.");
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

        const userDataToSet: any = {
          firstName,
          lastName,
          email: user.email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          exerciseCount: 0,
          points: 0,
          practiceTime: 0,
          rank: 'Novizio',
          userType,
        };

        if (userType === 'client') {
            userDataToSet.referralCode = referralCode;
        }

        if (userType === 'counselor-in-training' || userType === 'school-manager') {
            userDataToSet.schoolAffiliation = schoolAffiliation;
        }

        await db.collection('users').doc(user.uid).set(userDataToSet);
        handleClose();
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
          handleClose();
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
          // Nota: l'utente Google non ha un userType predefinito
        });
      }
      handleClose();
    } catch (err) {
      setError(handleFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (type: UserType) => {
      setUserType(type);
      setRegistrationStep(2);
  };

  const renderRegistrationContent = () => {
      if (registrationStep === 1) {
          return (
              <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Scegli il tuo ruolo</h3>
                  <div className="space-y-3">
                      {ROLES.map(role => (
                          <button
                              key={role.id}
                              type="button"
                              onClick={() => handleRoleSelect(role.id as UserType)}
                              className="w-full flex items-center p-4 rounded-lg border-2 border-gray-200 hover:border-sky-500 hover:bg-sky-50 transition-all text-left"
                          >
                              {role.icon}
                              <span className="ml-4 font-semibold text-gray-700">{role.title}</span>
                          </button>
                      ))}
                  </div>
              </div>
          );
      }

      if (registrationStep === 2) {
          return (
               <form onSubmit={handleRegister} className="space-y-4 text-left">
                  <button type="button" onClick={() => setRegistrationStep(1)} className="text-sm text-sky-600 font-semibold mb-2">&larr; Torna alla scelta del ruolo</button>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"/>
                </div>
                {(userType === 'counselor-in-training' || userType === 'school-manager') && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Scuola di Appartenenza</label>
                        <input 
                            type="text" 
                            value={schoolAffiliation} 
                            onChange={(e) => setSchoolAffiliation(e.target.value)} 
                            required 
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" 
                            placeholder="Nome della tua scuola di counseling"
                        />
                    </div>
                )}
                {userType === 'client' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Codice di Riferimento del Counselor</label>
                        <input type="text" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" placeholder="Inserisci il codice..."/>
                    </div>
                )}
                 {error && <p className="text-red-500 text-sm text-center pt-2">{error}</p>}
                <div className="pt-2">
                  <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-gray-400">
                    {loading ? 'Caricamento...' : 'Crea Account'}
                  </button>
                </div>
              </form>
          );
      }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={handleClose}>
      <div className="relative bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center transform transition-all" onClick={(e) => e.stopPropagation()}>
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{mode === 'register' ? 'Crea un Account' : 'Accedi al tuo Account'}</h2>
        <p className="text-gray-600 mb-6">
          {mode === 'register' ? 'Per salvare i tuoi progressi e accedere a tutte le funzionalità.' : 'Bentornato/a! Accedi per continuare.'}
        </p>

        <div className="flex justify-center bg-gray-100 rounded-full p-1 mb-6">
            <button onClick={() => { setMode('register'); setError(''); setRegistrationStep(1); }} className={`w-1/2 py-2 rounded-full text-sm font-semibold transition-colors ${mode === 'register' ? 'bg-white text-sky-600 shadow' : 'text-gray-600'}`}>Registrati</button>
            <button onClick={() => { setMode('login'); setError(''); }} className={`w-1/2 py-2 rounded-full text-sm font-semibold transition-colors ${mode === 'login' ? 'bg-white text-sky-600 shadow' : 'text-gray-600'}`}>Accedi</button>
        </div>
        
        {mode === 'login' && (
             <form onSubmit={handleLogin} className="space-y-4 text-left">
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
                  {loading ? 'Caricamento...' : 'Accedi'}
                </button>
              </div>
            </form>
        )}
        
        {mode === 'register' && renderRegistrationContent()}
        
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