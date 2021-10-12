import React from 'react';
import {useAsyncEffect} from 'use-async-effect';

import {Article, database} from 'lib/db';
import {useFirestore} from 'hooks/useFirestore';
import {useUserControls} from 'hooks/useUserControls';
import {lookupArticleCache, articlesCache} from 'utils/articles-cache';

export const useLookupArticles = (term: string): Article[] => {
  const [articles, setArticles] = React.useState<Article[]>([]);
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
          articlesCache[article.word] = article;
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
