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
import {database} from 'lib/db';
import {useFirestore} from 'hooks/useFirestore';

type UserControls = {
  user: FirebaseUser | null;
  isUserAdmin: boolean;
  signIn: () => void;
  signOut: () => void;
};

export const useUserControls = (): UserControls => {
  const firebaseApp = useFirebaseApp();
  const firestore = useFirestore();
  const [auth] = React.useState(() => getAuth(firebaseApp));

  useAsyncEffect(async () => {
    await setPersistence(auth, browserLocalPersistence);
  }, [auth]);

  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [isUserAdmin, setUserAdmin] = React.useState(false);

  const signIn = React.useCallback(
    () => signInWithPopup(auth, new GoogleAuthProvider()),
    [auth]
  );
  const signOut = React.useCallback(() => firebaseSignOut(auth), [auth]);
  React.useEffect(() => onAuthStateChanged(auth, setUser), [auth, setUser]);

  useAsyncEffect(
    async (isMounted) => {
      if (user) {
        const isAdmin = await database.fetchUserAdmin(firestore, user);
        if (isMounted()) {
          setUserAdmin(isAdmin);
        }
      } else {
        setUserAdmin(false);
      }
    },
    [firestore, user, setUserAdmin]
  );

  return {user, isUserAdmin, signIn, signOut};
};
