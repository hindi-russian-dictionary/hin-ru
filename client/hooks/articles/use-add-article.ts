import React from 'react';
import {NewArticle} from 'client/types/db';
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
  {id: string},
  unknown,
  NewArticle,
  {prevGroup: GroupResult; id: string}
>;

type LocalUseMutationOptions = UseMutationOptions<
  {id: string},
  unknown,
  NewArticle,
  {prevGroup: GroupResult; id: string}
>;

type LocalMutationFunction = MutationFunction<{id: string}, NewArticle>;

export const useAddArticle = (): LocalUseMutationResult => {
  const queryClient = useQueryClient();
  const {token} = useUser();
  const api = useMutateApi<string, NewArticle>({
    token,
    url: '/api/articles/add/',
  });
  const mutationFn: LocalMutationFunction = React.useCallback(
    async (article) => ({id: await api(article)}),
    [api]
  );
  const onMutate: LocalUseMutationOptions['onMutate'] = React.useCallback(
    async (nextArticle) => {
      const wordKey = getArticleGroupKey(nextArticle.word, token);
      await queryClient.cancelQueries(wordKey);
      const snapshot = queryClient.getQueryData<GroupResult>(wordKey);
      const tempId = `temp-${nextArticle.word}`;
      queryClient.setQueryData<GroupResult>(wordKey, (prevGroup = []) => [
        ...prevGroup,
        {id: tempId, ...nextArticle},
      ]);
      return {prevGroup: snapshot, id: tempId};
    },
    [queryClient, token]
  );
  const onError: LocalUseMutationOptions['onError'] = React.useCallback(
    (_err, nextArticle, context) => {
      if (!context) {
        return;
      }
      const wordKey = getArticleGroupKey(nextArticle.word, token);
      queryClient.setQueryData<GroupResult>(wordKey, context.prevGroup);
    },
    [queryClient, token]
  );
  const onSuccess: LocalUseMutationOptions['onSuccess'] = React.useCallback(
    (data, nextArticle, context) => {
      if (!context) {
        return;
      }
      const wordKey = getArticleGroupKey(nextArticle.word, token);
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
    [queryClient, token]
  );
  const onSettled: LocalUseMutationOptions['onSettled'] = React.useCallback(
    (_data, _error, nextArticle) => {
      const wordKey = getArticleGroupKey(nextArticle.word, token);
      void queryClient.invalidateQueries(wordKey);
    },
    [queryClient, token]
  );
  return useMutation(mutationFn, {onMutate, onError, onSuccess, onSettled});
};
