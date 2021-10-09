import React from 'react';
import firebase from 'firebase/compat';

import {PartOfSpeech, PARTS_OF_SPEECH, PARTS_OF_SPEECH_PROPERTIES} from 'utils/parts-of-speech';
import Database, {Article} from 'db';

type Props = {
  word: firebase.firestore.DocumentSnapshot<Article>;
  isAdmin: boolean;
  routeToEdit: () => void;
};

type State = {
  isWordApproved: boolean;
};

class WordPage extends React.Component<Props, State> {
  database: Database;

  constructor(props: Props) {
    super(props);
    this.database = new Database();
    this.state = {isWordApproved: props.word.get('approved')};
  }

  render() {
    let word = this.props.word;
    return (
      <React.Fragment>
        {this.props.isAdmin ? (
          <button className="btn btn-info" onClick={this.props.routeToEdit}>
            Редактировать (осторожно, вы админ)
          </button>
        ) : (
          ''
        )}
        &nbsp;
        {this.props.isAdmin ? (
          !this.state.isWordApproved ? (
            <button
              className="btn btn-success"
              onClick={() =>
                this.database
                  .updateWord(word.id, {approved: true})
                  .then(() => this.setState({isWordApproved: true}))
              }
            >
              Одобрить!
            </button>
          ) : (
            <button
              className="btn btn-danger"
              onClick={() =>
                this.database
                  .updateWord(word.id, {approved: false})
                  .then(() => this.setState({isWordApproved: false}))
              }
            >
              Разодобрить :(
            </button>
          )
        ) : (
          ''
        )}
        <h1>{word.get('word')}</h1>
        <table className="table">
          <tbody>
            <tr>
              <th>Часть речи</th>
              <td>
                {
                  PARTS_OF_SPEECH[
                    word.get('part_of_speech') as Article['part_of_speech']
                  ]
                }
              </td>
            </tr>
            <tr>
              <th>Транслитерация</th>
              <td>{word.get('transliteration')}</td>
            </tr>
            {(PARTS_OF_SPEECH_PROPERTIES[word.get('part_of_speech') as PartOfSpeech] || []).map(
              (property) => (
                <tr key={word.get('word') + '-' + property.key}>
                  <th>{property.name}</th>
                  <td>
                    {word.get('properties') &&
                    property.key in word.get('properties')
                      ? Object.entries(word.get('properties')[property.key])
                          .filter(([_, value]) => value)
                          .map(
                            ([key, _]) =>
                              property.values.filter(
                                (value) => value.key === key
                              )[0].name
                          )
                      : '-'}
                  </td>
                </tr>
              )
            )}
            <tr>
              <th>Альтернативные написания</th>
              <td>{word.get('spellings')}</td>
            </tr>
            <tr>
              <th>Значения</th>
              <td>
                <table className="table">
                  <tbody>
                    {(word.get('meanings') as Article['meanings']).map(
                      (meaning) => (
                        <tr key={meaning.meaning}>
                          <td>{meaning.meaning}</td>
                          <td>{meaning.examples}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </td>
            </tr>
            <tr>
              <th>Управление</th>
              <td>{word.get('control') ? word.get('control')['hin'] : ''}</td>
              <td>{word.get('control') ? word.get('control')['rus'] : ''}</td>
            </tr>
            <tr>
              <th>Устойчивые словосочетания</th>
              <td>
                {word.get('stable_phrases')
                  ? word.get('stable_phrases')['hin']
                  : ''}
              </td>
              <td>
                {word.get('stable_phrases')
                  ? word.get('stable_phrases')['rus']
                  : ''}
              </td>
            </tr>
            <tr>
              <th>Примеры</th>
              <td>{word.get('examples') ? word.get('examples')['hin'] : ''}</td>
              <td>{word.get('examples') ? word.get('examples')['rus'] : ''}</td>
            </tr>
            <tr>
              <th>Заимствовано из</th>
              <td>{word.get('taken_from')}</td>
            </tr>
          </tbody>
        </table>
      </React.Fragment>
    );
  }
}

export default WordPage;
