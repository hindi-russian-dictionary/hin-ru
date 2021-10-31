import {Article} from 'client/lib/db';

type Term = string;
type Id = string;

export const articlesCache: Record<Id, Article> = {};
export const lookupArticleCache: Record<Term, Id[]> = {};
