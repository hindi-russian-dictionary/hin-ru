import {QueryKey} from 'react-query';
import {Article} from 'client/types/db';

export type GroupResult = Article[] | undefined;

export const getArticleGroupKey = (
  word: string,
  token?: string | null
): QueryKey => {
  return ['articleGroup', word, token || null];
};

export const getLookupArticleGroupKey = (
  term: string,
  token?: string | null
): QueryKey => {
  return ['lookupArticles', term, token || null];
};

export const getUserAdminKey = (token?: string | null): QueryKey => {
  return ['isUserAdmin', token || null];
};
