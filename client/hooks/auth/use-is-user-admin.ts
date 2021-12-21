import {useQuery} from 'react-query';

import {getUserAdminKey} from 'client/utils/query-utils';
import {useUser} from 'client/hooks/auth/use-user';
import {useQueryApi} from 'client/hooks/api/use-query-api';

type IsAdmin = boolean | undefined;

export const useIsUserAdmin = (): IsAdmin => {
  const {token} = useUser();
  const wordKey = getUserAdminKey(token);

  const api = useQueryApi<{isAdmin: boolean}>({token, url: '/api/is-admin'});
  const result = useQuery(wordKey, api, {
    enabled: token !== undefined,
  });
  return result.isSuccess ? result.data.isAdmin : undefined;
};
