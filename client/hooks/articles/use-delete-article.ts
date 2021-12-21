import React from 'react';
import {
  MutationFunction,
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from 'react-query';

import {getArticleGroupKey, GroupResult} from 'client/utils/query-utils';
import {useUser} from 'client/hooks/auth/use-user';
import {useMutateApi} from 'client/hooks/api/use-mutate-api';

type LocalUseMutationResult = UseMutationResult<
  void,
  unknown,
  string,
  GroupResult
>;
type LocalUseMutationOptions = UseMutationOptions<
  void,
  unknown,
  string,
  GroupResult
>;
type LocalMutationFunction = MutationFunction<void, string>;

export const useDeleteArticle = (word: string): LocalUseMutationResult => {
  const queryClient = useQueryClient();
  const {token} = useUser();
  const wordKey = getArticleGroupKey(word, token);
  const getUrl = React.useCallback(
    ({context: id}) => `/api/articles/remove/${id!}`,
    []
  );
  const mutationFn: LocalMutationFunction = useMutateApi<void, string>({
    token,
    url: getUrl,
    method: 'DELETE',
    skipBody: true,
  });
  const onMutate: LocalUseMutationOptions['onMutate'] = React.useCallback(
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
  const onError: LocalUseMutationOptions['onError'] = React.useCallback(
    (_err, _removedId, snapshot) => {
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
