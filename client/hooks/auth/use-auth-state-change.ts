import {onAuthStateChanged, User} from '@firebase/auth';
import {useAsyncEffect} from 'use-async-effect';

import {useAuth} from 'client/hooks/auth/use-auth';

type AuthStateChangeCallback = (
  user: User | null,
  isMounted: () => boolean
) => void | Promise<void>;

export const useAuthStateChange = (callback: AuthStateChangeCallback) => {
  const auth = useAuth();
  useAsyncEffect(
    (isMounted) =>
      onAuthStateChanged(auth, (user) => callback(user, isMounted)),
    [auth, callback]
  );
};
