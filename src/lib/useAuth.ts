import { useState, useEffect } from 'react';
import { User as FirebaseUser, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from './firebase';

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (u && u.email !== 'federicodamodio@gmail.com') {
        await signOut(auth);
        console.error("Accesso negato. Solo federicodamodio@gmail.com può effettuare l'accesso.");
        setUser(null);
        setLoading(false);
        return;
      }
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error(e);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return { user, loading, loginWithGoogle, logout };
}
