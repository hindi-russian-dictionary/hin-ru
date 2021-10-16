import React from 'react';

import {
  PARTS_OF_SPEECH,
  PARTS_OF_SPEECH_PROPERTIES,
} from 'client/utils/parts-of-speech';
import {useNavigate, useParams} from 'react-router-dom';
import {useUserControls} from 'client/hooks/useUserControls';
import {useArticle} from 'client/hooks/useArticle';
import {useUpdateArticle} from 'client/hooks/useUpdateArticle';

export const WordPage: React.FC = () => {
  const params = useParams<'word'>();
  const article = useArticle(params.word || '');

  const navigate = useNavigate();
  const editArticle = React.useCallback(() => {
    navigate(`/article/${params.word}/edit`);
  }, [navigate, params.word]);

  const updateArticle = useUpdateArticle();

  const {isUserAdmin} = useUserControls();

  const [wordApproved, setWordApproved] = React.useState(() =>
    Boolean(article?.approved)
  );

  const switchApproval = React.useCallback<() => void>(async () => {
    if (!article) {
      return;
    }
    const nextApproval = !wordApproved;
    await updateArticle({...article, approved: nextApproval});
    setWordApproved(nextApproval);
  }, [updateArticle, setWordApproved, article, wordApproved]);

  if (!article) {
    return <div>404</div>;
  }

  return (
    <>
      {isUserAdmin ? (
        <button className="btn btn-info" onClick={editArticle}>
          Редактировать (осторожно, вы админ)
        </button>
      ) : null}
      &nbsp;
      {isUserAdmin ? (
        <button
          className={`btn ${wordApproved ? 'btn-danger' : 'btn-success'}`}
          onClick={switchApproval}
        >
          {wordApproved ? 'Разодобрить :(' : 'Одобрить!'}
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
                            property.values.find((value) => value.key === key)
                              ?.name
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
    </>
  );
};
