import {useQuery, UseQueryResult} from 'react-query';

import {Article} from 'client/types/db';
import {getArticleGroupKey, GroupResult} from 'client/utils/query-utils';
import {useUser} from 'client/hooks/auth/use-user';
import {useQueryApi} from 'client/hooks/api/use-query-api';

export const useGetArticles = (word: string): UseQueryResult<GroupResult> => {
  const {token} = useUser();
  const wordKey = getArticleGroupKey(word, token);

  const api = useQueryApi<Article[]>({token, url: `/api/articles/get/${word}`});
  return useQuery(wordKey, api, {
    enabled: word.length !== 0 && token !== undefined,
  });
};
