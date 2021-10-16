import {Article} from 'client/lib/db';

export const articlesCache: Record<string, Article> = {};
export const lookupArticleCache: Record<string, string[]> = {};
