import React from 'react';
import {useNavigate, useParams} from 'react-router-dom';

import {
  PARTS_OF_SPEECH,
  PARTS_OF_SPEECH_PROPERTIES,
} from 'client/utils/parts-of-speech';
import {useGetArticles} from 'client/hooks/articles/use-get-articles';
import {Article} from 'client/types/db';
import {useMutateArticle} from 'client/hooks/articles/use-mutate-article';
import {useDeleteArticle} from 'client/hooks/articles/use-delete-article';
import {useIsUserAdmin} from 'client/hooks/auth/use-is-user-admin';

export const WordPage: React.FC = () => {
  const params = useParams<'word'>();
  const word = params.word || '';
  const articleGroupQuery = useGetArticles(word);
  const articleMutation = useMutateArticle(word);
  const articleDeletion = useDeleteArticle(word);

  const navigate = useNavigate();
  const editArticle = React.useCallback(
    (article: Article) => {
      navigate(`/article/${params.word}/edit/${article.id}/`);
    },
    [navigate, params.word]
  );

  const isUserAdmin = useIsUserAdmin();

  const switchApproval = React.useCallback<(index: number) => void>(
    async (index) => {
      if (!articleGroupQuery.data) {
        return;
      }
      const article = articleGroupQuery.data[index];
      if (!article) {
        return;
      }
      void articleMutation.mutate({...article, approved: !article.approved});
    },
    [articleMutation, articleGroupQuery]
  );

  const deleteWord = React.useCallback(
    (index) => {
      if (!articleGroupQuery.data) {
        return;
      }
      const article = articleGroupQuery.data[index];
      if (!article) {
        return;
      }
      const sure = window.confirm(
        `Вы уверены что хотите удалить слово ${article.word}?`
      );
      if (!sure) {
        return;
      }
      articleDeletion.mutate(article.id);
    },
    [articleGroupQuery, articleDeletion]
  );

  if (articleGroupQuery.isIdle) {
    return <div>Пожалуйста, подождите...</div>;
  }

  if (articleGroupQuery.isLoading) {
    return <div>Слова загружаются...</div>;
  }

  if (articleGroupQuery.error) {
    return (
      <div>
        <div>Ошибка</div>
        <div>{String(articleGroupQuery.error)}</div>
      </div>
    );
  }

  const articleGroup = articleGroupQuery.data;
  if (!articleGroup || articleGroup.length === 0) {
    return <div>Таких слов не найдено</div>;
  }

  return (
    <>
      {articleGroup.length > 1 ? (
        <div className="article-length">Всего слов: {articleGroup.length}</div>
      ) : null}
      {articleGroup.map((article, index) => (
        <div className="article" key={article.id}>
          {isUserAdmin ? (
            <>
              <button
                className="btn btn-info"
                onClick={() => editArticle(article)}
              >
                Редактировать
              </button>
              &nbsp;
              <button
                className={`btn ${
                  article.approved ? 'btn-danger' : 'btn-success'
                }`}
                onClick={() => switchApproval(index)}
              >
                {article.approved ? 'Разодобрить' : 'Одобрить'}
              </button>
              &nbsp;
              <button
                className={'btn btn-danger'}
                onClick={() => deleteWord(index)}
                disabled={articleDeletion.isLoading}
              >
                {articleDeletion.isLoading ? 'Удаляем...' : 'Удалить'}
              </button>
            </>
          ) : null}
          <h1>{article.word}</h1>
          <table className="table">
            <tbody>
              <tr>
                <th>Часть речи</th>
                <td>{PARTS_OF_SPEECH[article.part_of_speech]}</td>
              </tr>
              <tr>
                <th>Транслитерация</th>
                <td>{article.transliteration}</td>
              </tr>
              {(PARTS_OF_SPEECH_PROPERTIES[article.part_of_speech] || []).map(
                (property) => (
                  <tr key={property.key}>
                    <th>{property.name}</th>
                    <td>
                      {article.properties?.[property.key]
                        ? Object.entries(article.properties?.[property.key])
                            .filter(([_, value]) => Boolean(value))
                            .map(
                              ([key]) =>
                                property.values.find(
                                  (value) => value.key === key
                                )?.name
                            )
                        : '-'}
                    </td>
                  </tr>
                )
              )}
              <tr>
                <th>Альтернативные написания</th>
                <td>{article.spellings}</td>
              </tr>
              <tr>
                <th>Значения</th>
                <td>
                  <table className="table">
                    <tbody>
                      {article.meanings.map((meaning) => (
                        <tr key={meaning.meaning}>
                          <td>{meaning.meaning}</td>
                          <td>{meaning.examples}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <th>Управление</th>
                <td>{article.control.hin}</td>
                <td>{article.control.rus}</td>
              </tr>
              <tr>
                <th>Устойчивые словосочетания</th>
                <td>{article.stable_phrases.hin}</td>
                <td>{article.stable_phrases.rus}</td>
              </tr>
              <tr>
                <th>Примеры</th>
                <td>{article.examples.hin}</td>
                <td>{article.examples.rus}</td>
              </tr>
              <tr>
                <th>Заимствовано из</th>
                <td>{article.taken_from || 'неизвестно'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </>
  );
};
