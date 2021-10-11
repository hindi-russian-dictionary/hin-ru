import React from 'react';

import {
  PARTS_OF_SPEECH,
  PARTS_OF_SPEECH_PROPERTIES,
} from 'utils/parts-of-speech';
import {Article} from 'lib/db';

type Props = {
  article: Article;
  isAdmin: boolean;
  routeToEdit: () => void;
  updateWord: (article: Article) => Promise<void>;
};

export const WordPage: React.FC<Props> = (props) => {
  const [wordApproved, setWordApproved] = React.useState(() =>
    Boolean(props.article?.approved)
  );

  const switchApproval = React.useCallback<() => void>(async () => {
    const nextApproval = !wordApproved;
    await props.updateWord({...props.article, approved: nextApproval});
    setWordApproved(nextApproval);
  }, [props.updateWord, setWordApproved, props.article, wordApproved]);

  return (
    <>
      {props.isAdmin ? (
        <button className="btn btn-info" onClick={props.routeToEdit}>
          Редактировать (осторожно, вы админ)
        </button>
      ) : null}
      &nbsp;
      {props.isAdmin ? (
        <button
          className={`btn ${wordApproved ? 'btn-danger' : 'btn-success'}`}
          onClick={switchApproval}
        >
          {wordApproved ? 'Разодобрить :(' : 'Одобрить!'}
        </button>
      ) : null}
      <h1>{props.article.word}</h1>
      <table className="table">
        <tbody>
          <tr>
            <th>Часть речи</th>
            <td>{PARTS_OF_SPEECH[props.article.part_of_speech]}</td>
          </tr>
          <tr>
            <th>Транслитерация</th>
            <td>{props.article.transliteration}</td>
          </tr>
          {(PARTS_OF_SPEECH_PROPERTIES[props.article.part_of_speech] || []).map(
            (property) => (
              <tr key={property.key}>
                <th>{property.name}</th>
                <td>
                  {props.article.properties?.[property.key]
                    ? Object.entries(props.article.properties?.[property.key])
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
            <td>{props.article.spellings}</td>
          </tr>
          <tr>
            <th>Значения</th>
            <td>
              <table className="table">
                <tbody>
                  {props.article.meanings.map((meaning) => (
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
            <td>{props.article.control.hin}</td>
            <td>{props.article.control.rus}</td>
          </tr>
          <tr>
            <th>Устойчивые словосочетания</th>
            <td>{props.article.stable_phrases.hin}</td>
            <td>{props.article.stable_phrases.rus}</td>
          </tr>
          <tr>
            <th>Примеры</th>
            <td>{props.article.examples.hin}</td>
            <td>{props.article.examples.rus}</td>
          </tr>
          <tr>
            <th>Заимствовано из</th>
            <td>{props.article.taken_from}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
};
