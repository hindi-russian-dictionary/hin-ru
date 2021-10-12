import React from 'react';
import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from '@firebase/auth';
import {useAsyncEffect} from 'use-async-effect';

import {useFirebaseApp} from 'hooks/useFirebaseApp';

type UserControls = {
  user: FirebaseUser | null;
  signIn: () => void;
  signOut: () => void;
};

export const useUserControls = (): UserControls => {
  const firebaseApp = useFirebaseApp();
  const [auth] = React.useState(() => getAuth(firebaseApp));

  useAsyncEffect(async () => {
    await setPersistence(auth, browserLocalPersistence);
  }, [auth]);

  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const signIn = React.useCallback(
    () => signInWithPopup(auth, new GoogleAuthProvider()),
    [auth]
  );
  const signOut = React.useCallback(() => firebaseSignOut(auth), [auth]);
  React.useEffect(() => onAuthStateChanged(auth, setUser), [auth, setUser]);

  return {user, signIn, signOut};
};
