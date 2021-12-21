import React from 'react';
import {
  MutationFunction,
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from 'react-query';

import {PartialArticle} from 'client/types/db';
import {getArticleGroupKey, GroupResult} from 'client/utils/query-utils';
import {useUser} from 'client/hooks/auth/use-user';
import {useMutateApi} from 'client/hooks/api/use-mutate-api';

type LocalUseMutationResult = UseMutationResult<
  void,
  unknown,
  PartialArticle,
  GroupResult
>;
type LocalUseMutationOptions = UseMutationOptions<
  void,
  unknown,
  PartialArticle,
  GroupResult
>;
type LocalMutationFunction = MutationFunction<void, PartialArticle>;

export const useMutateArticle = (word: string): LocalUseMutationResult => {
  const queryClient = useQueryClient();
  const {token} = useUser();
  const wordKey = getArticleGroupKey(word, token);
  const mutationFn: LocalMutationFunction = useMutateApi<void, PartialArticle>({
    token,
    url: '/api/articles/update/',
  });
  const onMutate: LocalUseMutationOptions['onMutate'] = React.useCallback(
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
  const onError: LocalUseMutationOptions['onError'] = React.useCallback(
    (_err, _article, snapshot) => {
      queryClient.setQueryData<GroupResult>(wordKey, snapshot);
    },
    [queryClient, wordKey]
  );
  const onSettled: LocalUseMutationOptions['onSettled'] =
    React.useCallback(() => {
      void queryClient.invalidateQueries(wordKey);
    }, [queryClient, wordKey]);

  return useMutation(mutationFn, {onMutate, onError, onSettled});
};
