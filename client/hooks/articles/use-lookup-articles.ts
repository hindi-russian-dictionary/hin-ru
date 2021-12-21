import React from 'react';
import {useQuery, UseQueryResult} from 'react-query';

import {Article} from 'client/types/db';
import {useUser} from 'client/hooks/auth/use-user';
import {getLookupArticleGroupKey} from 'client/utils/query-utils';
import {useQueryApi} from 'client/hooks/api/use-query-api';

export const useLookupArticles = (
  term: string
): UseQueryResult<Article[][]> => {
  const {token} = useUser();
  const termKey = getLookupArticleGroupKey(term, token);
  const api = useQueryApi<Article[]>({
    token,
    url: `/api/articles/query?term=${term}`,
  });
  const queryFn = React.useCallback(
    async (context) => groupByWord(await api(context)),
    [api]
  );
  return useQuery<Article[][]>(termKey, queryFn, {
    enabled: term.length !== 0 && token !== undefined,
    retry: false,
  });
};

function groupByWord(articles: Article[]): Article[][] {
  return Object.values(
    articles.reduce<Record<string, Article[]>>((acc, article) => {
      if (!acc[article.word]) {
        acc[article.word] = [];
      }
      acc[article.word].push(article);
      return acc;
    }, {})
  );
}
