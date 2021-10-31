import React from 'react';
import {useAsyncEffect} from 'use-async-effect';

import {Article, database} from 'client/lib/db';
import {useFirestore} from 'client/hooks/use-firestore';
import {useUserControls} from 'client/hooks/use-user-controls';
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
          articlesCache[article.id] = article;
        });
        lookupArticleCache[term] = fetchedArticles.map((article) => article.id);
      }
      if (!isMounted()) {
        return;
      }
      setArticles(
        groupByWord(lookupArticleCache[term].map((id) => articlesCache[id]))
      );
    },
    [firestore, setArticles, isUserAdmin, term]
  );
  return articles;
};

function groupByWord(articles: Article[]): Article[][] {
  return Object.values(
    articles.reduce<Record<string, Article[]>>((acc, article) => {
      if (!acc[article.word]) {
        acc[article.word] = [];
      }
      acc[article.word].push(article);
      return acc;
    }, {})
  );
}
