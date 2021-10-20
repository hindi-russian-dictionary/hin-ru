import React from 'react';
import {useAsyncEffect} from 'use-async-effect';

import {Article, database} from 'client/lib/db';
import {useFirestore} from 'client/hooks/useFirestore';
import {useUserControls} from 'client/hooks/useUserControls';
import {lookupArticleCache, articlesCache} from 'client/utils/articles-cache';

export const useLookupArticles = (term: string): Article[][] => {
  const [articles, setArticles] = React.useState<Article[][]>([]);
  const firestore = useFirestore();
  const {isUserAdmin} = useUserControls();
  useAsyncEffect(
    async (isMounted) => {
      if (!term) {
        return;
      }
      if (!lookupArticleCache[term]) {
        const fetchedArticles = await database.lookupArticles(
          firestore,
          term,
          isUserAdmin
        );
        fetchedArticles.forEach((article) => {
          if (!articlesCache[article.word]) {
            articlesCache[article.word] = [];
          }
          articlesCache[article.word].push(article);
        });
        lookupArticleCache[term] = fetchedArticles.map(
          (article) => article.word
        );
      }
      if (!isMounted()) {
        return;
      }
      setArticles(lookupArticleCache[term].map((word) => articlesCache[word]));
    },
    [firestore, setArticles, isUserAdmin, term]
  );
  return articles;
};
