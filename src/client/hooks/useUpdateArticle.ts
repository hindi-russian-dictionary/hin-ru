import React from 'react';
import {Article, database} from 'client/lib/db';
import {useFirestore} from 'client/hooks/useFirestore';
import {articlesCache} from 'client/utils/articles-cache';

export const useUpdateArticle = () => {
  const firestore = useFirestore();
  return React.useCallback(
    async (article: Article) => {
      await database.updateArticle(firestore, article);
      articlesCache[article.word] = article;
    },
    [firestore]
  );
};
