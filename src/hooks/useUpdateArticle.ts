import React from 'react';
import {Article, database} from 'lib/db';
import {useFirestore} from 'hooks/useFirestore';
import {articlesCache} from 'utils/articles-cache';

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
