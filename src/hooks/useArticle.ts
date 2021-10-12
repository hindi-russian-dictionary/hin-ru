import React from 'react';
import {Article, database} from 'lib/db';
import {useFirestore} from 'hooks/useFirestore';
import {useAsyncEffect} from 'use-async-effect';
import {articlesCache} from 'utils/articles-cache';

export const useArticle = (word: string) => {
  const [article, setArticle] = React.useState<Article | null>(null);
  const firestore = useFirestore();
  useAsyncEffect(
    async (isMounted) => {
      if (!word) {
        return;
      }
      if (!articlesCache[word]) {
        const fetchedArticle = await database.getArticle(firestore, word);
        if (fetchedArticle) {
          articlesCache[word] = fetchedArticle;
        }
      }
      if (!isMounted()) {
        return;
      }
      setArticle(articlesCache[word] || null);
    },
    [firestore, setArticle, word]
  );
  return article;
};
