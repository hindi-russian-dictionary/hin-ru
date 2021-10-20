import React from 'react';

import {
  PARTS_OF_SPEECH,
  PARTS_OF_SPEECH_PROPERTIES,
} from 'client/utils/parts-of-speech';
import {useNavigate, useParams} from 'react-router-dom';
import {useUserControls} from 'client/hooks/useUserControls';
import {useArticleGroup} from 'client/hooks/useArticleGroup';
import {useUpdateArticle} from 'client/hooks/useUpdateArticle';
import {Article} from 'client/lib/db';

export const WordPage: React.FC = () => {
  const params = useParams<'word'>();
  const [articleGroup, forceUpdateArticleGroup] = useArticleGroup(
    params.word || ''
  );

  const navigate = useNavigate();
  const editArticle = React.useCallback(
    (article: Article) => {
      navigate(`/article/${params.word}/edit/${article.id}/`);
    },
    [navigate, params.word, articleGroup]
  );

  const updateArticle = useUpdateArticle();

  const {isUserAdmin} = useUserControls();

  const switchApproval = React.useCallback<(index: number) => void>(
    async (index) => {
      const article = articleGroup?.[index];
      if (!article) {
        return;
      }
      await updateArticle({...article, approved: !article.approved});
      forceUpdateArticleGroup();
    },
    [updateArticle, articleGroup]
  );

  if (!articleGroup || articleGroup.length === 0) {
    return <div>404</div>;
  }

  return (
    <>
      {articleGroup.length > 1 ? (
        <div className="article-length">Всего слов: {articleGroup.length}</div>
      ) : null}
      {articleGroup.map((article, index) => (
        <div className="article" key={article.id}>
          {isUserAdmin ? (
            <button
              className="btn btn-info"
              onClick={() => editArticle(article)}
            >
              Редактировать (осторожно, вы админ)
            </button>
          ) : null}
          &nbsp;
          {isUserAdmin ? (
            <button
              className={`btn ${
                article.approved ? 'btn-danger' : 'btn-success'
              }`}
              onClick={() => switchApproval(index)}
            >
              {article.approved ? 'Разодобрить :(' : 'Одобрить!'}
            </button>
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
                <td>{article.taken_from}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </>
  );
};
