import React from 'react';

import {useAuthStateChange} from 'client/hooks/auth/use-auth-state-change';

type UserControls = {
  userName: string | null;
  // undefined - неизвестно, есть ли токен, null - известно что токена нет
  token: string | undefined | null;
};

export const useUser = (): UserControls => {
  const [token, setToken] = React.useState<string | undefined | null>(
    undefined
  );
  useAuthStateChange(
    React.useCallback(
      async (user, isMounted) => {
        if (user) {
          const token = await user.getIdToken();
          if (!isMounted()) {
            return;
          }
          setToken(token);
        } else {
          setToken(null);
        }
      },
      [setToken]
    )
  );

  const [userName, setUserName] = React.useState<string | null>(null);
  useAuthStateChange(
    React.useCallback(
      (user) => setUserName(user ? user.displayName : null),
      [setUserName]
    )
  );

  return {userName, token};
};
