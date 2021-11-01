import React from 'react';
import {useQuery, UseQueryResult} from 'react-query';

import {database} from 'client/lib/db';
import {useFirestore} from 'client/hooks/use-firestore';
import {getArticleGroupKey, GroupResult} from 'client/utils/query-utils';

export const useArticleGroup = (word: string): UseQueryResult<GroupResult> => {
  const firestore = useFirestore();
  const wordKey = getArticleGroupKey(word);
  const fetchArticle = React.useCallback(
    () => database.getArticle(firestore, word),
    [word, firestore]
  );
  return useQuery(wordKey, fetchArticle, {
    enabled: word.length !== 0,
  });
};
