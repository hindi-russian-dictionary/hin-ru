import React from 'react';
import {Article, database} from 'lib/db';
import {useFirestore} from 'hooks/useFirestore';
import {articlesCache} from 'utils/articles-cache';

export const useAddArticle = () => {
  const firestore = useFirestore();
  return React.useCallback(
    async (article: Omit<Article, 'id'>) => {
      const id = await database.addArticle(firestore, article);
      articlesCache[article.word] = {...article, id};
      return id;
    },
    [firestore]
  );
};
