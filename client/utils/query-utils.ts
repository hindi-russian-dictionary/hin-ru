import {QueryKey} from 'react-query';
import {Article} from 'client/lib/db';

export type GroupResult = Article[] | undefined;

export const getArticleGroupKey = (word: string): QueryKey => {
  return ['articleGroup', word];
};

export const getLookupArticleGroupKey = (
  term: string,
  isUserAdmin: boolean
): QueryKey => {
  return ['lookupArticles', term, isUserAdmin];
};
