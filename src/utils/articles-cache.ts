import {Article} from 'lib/db';

export const articlesCache: Record<string, Article> = {};
export const lookupArticleCache: Record<string, string[]> = {};
