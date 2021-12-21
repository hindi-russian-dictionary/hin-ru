import React from 'react';
import {
  browserLocalPersistence,
  GoogleAuthProvider,
  setPersistence,
  signInWithPopup,
  signOut,
} from '@firebase/auth';
import {useAsyncEffect} from 'use-async-effect';

import {useAuth} from 'client/hooks/auth/use-auth';

type UserControls = {
  signIn: () => void;
  signOut: () => void;
};

export const useUserControls = (): UserControls => {
  const auth = useAuth();

  useAsyncEffect(async () => {
    await setPersistence(auth, browserLocalPersistence);
  }, [auth]);

  return {
    signIn: React.useCallback(
      () => signInWithPopup(auth, new GoogleAuthProvider()),
      [auth]
    ),
    signOut: React.useCallback(() => signOut(auth), [auth]),
  };
};
