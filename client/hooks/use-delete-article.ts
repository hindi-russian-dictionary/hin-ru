import React from 'react';
import {
  MutationFunction,
  MutationOptions,
  useMutation,
  UseMutationResult,
  useQueryClient,
} from 'react-query';

import {database} from 'client/lib/db';
import {getArticleGroupKey, GroupResult} from 'client/utils/query-utils';
import {useFirestore} from 'client/hooks/use-firestore';

type LocalMutationResult = UseMutationResult<
  void,
  unknown,
  string,
  GroupResult
>;
type LocalMutationOptions = MutationOptions<void, unknown, string, GroupResult>;
type LocalMutationFunction = MutationFunction<void, string>;

export const useDeleteArticle = (word: string): LocalMutationResult => {
  const queryClient = useQueryClient();
  const firestore = useFirestore();
  const wordKey = getArticleGroupKey(word);
  const removeArticle = React.useCallback<LocalMutationFunction>(
    async (id) => {
      await database.removeArticle(firestore, id);
    },
    [firestore]
  );
  const onMutate = React.useCallback<
    NonNullable<LocalMutationOptions['onMutate']>
  >(
    async (removedId) => {
      await queryClient.cancelQueries(wordKey);
      const snapshot = queryClient.getQueryData<GroupResult>(wordKey);
      queryClient.setQueryData<GroupResult>(wordKey, (prevGroup) => {
        if (!prevGroup) {
          return prevGroup;
        }
        const articleIndex = prevGroup.findIndex(
          (lookupArticle) => removedId === lookupArticle.id
        );
        if (articleIndex === -1) {
          return prevGroup;
        }
        return [
          ...prevGroup.slice(0, articleIndex),
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
    (_err, _removedId, snapshot) => {
      queryClient.setQueryData<GroupResult>(wordKey, snapshot);
    },
    [queryClient, wordKey]
  );
  const onSettled = React.useCallback<
    NonNullable<LocalMutationOptions['onSettled']>
  >(() => {
    queryClient.invalidateQueries(wordKey);
  }, [queryClient, wordKey]);

  return useMutation(removeArticle, {onMutate, onError, onSettled});
};
