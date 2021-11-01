import React from 'react';
import {
  MutationFunction,
  MutationOptions,
  useMutation,
  UseMutationResult,
  useQueryClient,
} from 'react-query';

import {database, PartialArticle} from 'client/lib/db';
import {getArticleGroupKey, GroupResult} from 'client/utils/query-utils';
import {useFirestore} from 'client/hooks/use-firestore';

type LocalMutationResult = UseMutationResult<
  void,
  unknown,
  PartialArticle,
  GroupResult
>;
type LocalMutationOptions = MutationOptions<
  void,
  unknown,
  PartialArticle,
  GroupResult
>;
type LocalMutationFunction = MutationFunction<void, PartialArticle>;

export const useMutateArticle = (word: string): LocalMutationResult => {
  const queryClient = useQueryClient();
  const firestore = useFirestore();
  const wordKey = getArticleGroupKey(word);
  const mutateArticle = React.useCallback<LocalMutationFunction>(
    async (article) => {
      await database.updateArticle(firestore, article);
    },
    [firestore]
  );
  const onMutate = React.useCallback<
    NonNullable<LocalMutationOptions['onMutate']>
  >(
    async (updatedArticle) => {
      await queryClient.cancelQueries(wordKey);
      const snapshot = queryClient.getQueryData<GroupResult>(wordKey);
      queryClient.setQueryData<GroupResult>(wordKey, (prevGroup) => {
        if (!prevGroup) {
          return prevGroup;
        }
        const articleIndex = prevGroup.findIndex(
          (lookupArticle) => updatedArticle.id === lookupArticle.id
        );
        if (articleIndex === -1) {
          return prevGroup;
        }
        return [
          ...prevGroup.slice(0, articleIndex),
          {
            ...prevGroup[articleIndex],
            ...updatedArticle,
          },
          ...prevGroup.slice(articleIndex + 1),
        ];
      });
      return snapshot;
    },
    [queryClient, wordKey]
  );
  const onError = React.useCallback<
    NonNullable<LocalMutationOptions['onError']>
  >(
    (_err, _article, snapshot) => {
      queryClient.setQueryData<GroupResult>(wordKey, snapshot);
    },
    [queryClient, wordKey]
  );
  const onSettled = React.useCallback<
    NonNullable<LocalMutationOptions['onSettled']>
  >(() => {
    queryClient.invalidateQueries(wordKey);
  }, [queryClient, wordKey]);

  return useMutation(mutateArticle, {onMutate, onError, onSettled});
};
