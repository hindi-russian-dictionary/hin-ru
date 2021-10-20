import React from 'react';
import {Article, database} from 'client/lib/db';
import {useFirestore} from 'client/hooks/useFirestore';
import {useAsyncEffect} from 'use-async-effect';
import {articlesCache} from 'client/utils/articles-cache';

export const useArticleGroup = (word: string) => {
  const [articleGroup, setArticleGroup] = React.useState<Article[] | null>(
    null
  );
  const firestore = useFirestore();
  useAsyncEffect(
    async (isMounted) => {
      if (!word) {
        return;
      }
      let cachedArticles = Object.values(articlesCache).filter(
        (article) => article.word === word
      );
      if (!cachedArticles) {
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
    [firestore, setArticleGroup, word]
  );
  return articleGroup;
};
