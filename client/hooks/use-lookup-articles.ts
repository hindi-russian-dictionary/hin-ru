import {Article, database} from 'client/lib/db';
import {useFirestore} from 'client/hooks/use-firestore';
import {useUserControls} from 'client/hooks/use-user-controls';
import {getLookupArticleGroupKey} from 'client/utils/query-utils';
import {useQuery, UseQueryResult} from 'react-query';

export const useLookupArticles = (
  term: string
): UseQueryResult<Article[][]> => {
  const firestore = useFirestore();
  const {isUserAdmin} = useUserControls();

  const termKey = getLookupArticleGroupKey(term, isUserAdmin);
  return useQuery<Article[][]>(
    termKey,
    async () => {
      if (!term) {
        return [];
      }
      const fetchedArticles = await database.lookupArticles(
        firestore,
        term,
        isUserAdmin
      );
      return groupByWord(fetchedArticles);
    },
    {
      enabled: term.length !== 0,
    }
  );
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
