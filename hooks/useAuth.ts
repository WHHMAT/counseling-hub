import { useState, useEffect } from 'react';
// FIX: Updated Firebase imports to v8 compat syntax for auth state.
import firebase from 'firebase/compat/app';
import { auth } from '../firebase';

export function useAuth() {
  // FIX: Use User type from firebase/compat/app.
  const [user, setUser] = useState<firebase.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // FIX: Use v8 compat syntax for onAuthStateChanged.
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
}
