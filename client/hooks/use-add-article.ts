import {database, NewArticle} from 'client/lib/db';
import {useFirestore} from 'client/hooks/use-firestore';
import {useMutation, UseMutationResult, useQueryClient} from 'react-query';
import {getArticleGroupKey, GroupResult} from 'client/utils/query-utils';

export const useAddArticle = (): UseMutationResult<
  { id: string },
  unknown,
  NewArticle,
  { prevGroup: GroupResult; id: string }
> => {
  const queryClient = useQueryClient();
  const firestore = useFirestore();
  return useMutation(
    async (article) => {
      const id = await database.addArticle(firestore, article);
      return {id};
    },
    {
      onMutate: async (nextArticle) => {
        const wordKey = getArticleGroupKey(nextArticle.word);
        await queryClient.cancelQueries(wordKey);
        const snapshot = queryClient.getQueryData<GroupResult>(wordKey);
        const tempId = `temp-${nextArticle.word}`;
        queryClient.setQueryData<GroupResult>(wordKey, (prevGroup = []) => [
          ...prevGroup,
          {id: tempId, ...nextArticle},
        ]);
        return {prevGroup: snapshot, id: tempId};
      },
      onError: (_err, nextArticle, context) => {
        if (!context) {
          return;
        }
        const wordKey = getArticleGroupKey(nextArticle.word);
        queryClient.setQueryData<GroupResult>(wordKey, context.prevGroup);
      },
      onSuccess: (data, nextArticle, context) => {
        if (!context) {
          return;
        }
        const wordKey = getArticleGroupKey(nextArticle.word);
        queryClient.setQueryData<GroupResult>(wordKey, (prevGroup = []) => {
          const index = prevGroup.findIndex(
            (article) => article.id === context.id
          );
          if (index === -1) {
            return prevGroup;
          }
          return [
            ...prevGroup.slice(0, index),
            {...prevGroup[index], id: data.id},
            ...prevGroup.slice(index + 1),
          ];
        });
      },
      onSettled: (_data, _error, nextArticle) => {
        const wordKey = getArticleGroupKey(nextArticle.word);
        queryClient.invalidateQueries(wordKey);
      },
    }
  );
};
