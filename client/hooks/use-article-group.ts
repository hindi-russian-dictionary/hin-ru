import React from 'react';
import {useAsyncEffect} from 'use-async-effect';

import {Article, database} from 'client/lib/db';
import {useFirestore} from 'client/hooks/use-firestore';
import {articlesCache} from 'client/utils/articles-cache';

export const useArticleGroup = (
  word: string
): [Article[] | null, () => void] => {
  const [articleGroup, setArticleGroup] = React.useState<Article[] | null>(
    null
  );
  const [count, setCount] = React.useState(0);
  const firestore = useFirestore();
  useAsyncEffect(
    async (isMounted) => {
      if (!word) {
        return;
      }
      let cachedArticles = Object.values(articlesCache).filter(
        (article) => article.word === word
      );
      if (cachedArticles.length === 0) {
        const fetchedArticles = await database.getArticle(firestore, word);
        if (fetchedArticles) {
          fetchedArticles.forEach((fetchedArticle) => {
            articlesCache[fetchedArticle.id] = fetchedArticle;
          });
          cachedArticles = fetchedArticles;
        }
      }
      if (!isMounted()) {
        return;
      }
      setArticleGroup(cachedArticles || null);
    },
    [firestore, setArticleGroup, word, count]
  );
  const forceUpdate = React.useCallback(
    () => setCount((x) => x + 1),
    [setCount]
  );
  return [articleGroup, forceUpdate];
};
