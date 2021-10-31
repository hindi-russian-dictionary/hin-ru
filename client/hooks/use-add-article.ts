import React from 'react';

import {Article, database} from 'client/lib/db';
import {useFirestore} from 'client/hooks/use-firestore';
import {articlesCache} from 'client/utils/articles-cache';

export const useAddArticle = () => {
  const firestore = useFirestore();
  return React.useCallback(
    async (article: Omit<Article, 'id'>) => {
      const id = await database.addArticle(firestore, article);
      articlesCache[id] = {...article, id};
      return id;
    },
    [firestore]
  );
};
