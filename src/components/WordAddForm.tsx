import React from 'react';
import firebase from 'firebase/compat';

import Database, {Article} from 'db';
import {
  PARTS_OF_SPEECH,
  PARTS_OF_SPEECH_PROPERTIES,
  PartOfSpeech,
} from 'utils/parts-of-speech';
import DevanagariTextInput from 'components/Devanagari';

type Props = {
  word_id?: string;
  word?: firebase.firestore.DocumentSnapshot<Article>;
  user?: firebase.User;
  routeToView?: () => void;
};

type UploadStatus = 'not_started' | 'pending' | 'error';

type State = {
  upload_status: UploadStatus;
  word: string;
  transliteration: string;
  spellings: string;
  part_of_speech: PartOfSpeech;
  properties: Article['properties'];
  taken_from: string;
  meanings: Article['meanings'];
  control_rus: string;
  control_hin: string;
  stable_phrases_rus: string;
  stable_phrases_hin: string;
  examples_rus: string;
  examples_hin: string;
};

class WordAddForm extends React.Component<Props, State> {
  database: Database;

  constructor(props: Props) {
    super(props);
    this.database = new Database();
    this.state = this.getCleanState();
    console.log(
      this.props.word ? this.props.word.get('stable_phrases').rus : 'no word'
    );
  }

  getCleanState = (): State => ({
    upload_status: 'not_started',
    word: this.props.word ? this.props.word.get('word') : '',
    transliteration: this.props.word
      ? this.props.word.get('transliteration')
      : '',
    spellings: this.props.word
      ? this.props.word.get('spellings').join(',')
      : '',
    part_of_speech: this.props.word
      ? this.props.word.get('part_of_speech')
      : 'noun',
    properties: this.props.word ? this.props.word.get('properties') : {},
    taken_from: this.props.word
      ? this.props.word.get('taken_from')
      : 'ниоткуда',
    meanings: this.props.word
      ? this.props.word.get('meanings')
      : [
          {
            meaning: '',
            examples: '',
          },
        ],
    control_rus:
      this.props.word && this.props.word.get('control')
        ? this.props.word.get('control').rus
        : '',
    control_hin:
      this.props.word && this.props.word.get('control')
        ? this.props.word.get('control').hin
        : '',
    stable_phrases_rus:
      this.props.word && this.props.word.get('stable_phrases')
        ? this.props.word.get('stable_phrases').rus
        : '',
    stable_phrases_hin:
      this.props.word && this.props.word.get('stable_phrases')
        ? this.props.word.get('stable_phrases').hin
        : '',
    examples_rus:
      this.props.word && this.props.word.get('examples')
        ? this.props.word.get('examples').rus
        : '',
    examples_hin:
      this.props.word && this.props.word.get('examples')
        ? this.props.word.get('examples').hin
        : '',
  });

  resetState = () => this.setState(this.getCleanState());

  setUploadingWord = () => this.setState({upload_status: 'pending'});
  setSomethingWentWrong = () => this.setState({upload_status: 'error'});

  editWord = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    this.setUploadingWord();
    this.database
      .updateWord(this.props.word_id!, {
        word: this.state.word,
        transliteration: this.state.transliteration,
        spellings: this.state.spellings.split(','),
        part_of_speech: this.state.part_of_speech,
        meanings: this.state.meanings,
        properties: this.state.properties ? this.state.properties : {},
        taken_from: this.state.taken_from,
        control: {
          rus: this.state.control_rus,
          hin: this.state.control_hin,
        },
        stable_phrases: {
          rus: this.state.stable_phrases_rus,
          hin: this.state.stable_phrases_hin,
        },
        examples: {
          rus: this.state.examples_rus,
          hin: this.state.examples_hin,
        },
        status: 'draft',
      })
      .then(this.props.routeToView)
      .catch(this.setSomethingWentWrong);
  };

  addWord = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    this.setUploadingWord();
    this.database
      .saveWord({
        word: this.state.word,
        transliteration: this.state.transliteration,
        spellings: this.state.spellings.split(','),
        part_of_speech: this.state.part_of_speech,
        meanings: this.state.meanings,
        properties: this.state.properties ? this.state.properties : {},
        taken_from: this.state.taken_from,
        control: {
          rus: this.state.control_rus,
          hin: this.state.control_hin,
        },
        stable_phrases: {
          rus: this.state.stable_phrases_rus,
          hin: this.state.stable_phrases_hin,
        },
        examples: {
          rus: this.state.examples_rus,
          hin: this.state.examples_hin,
        },
        status: 'draft',
        author: this.props.user
          ? this.props.user.email || undefined
          : undefined,
      })
      .then(this.resetState)
      .catch(this.setSomethingWentWrong);
  };

  updateInput<T extends keyof State, V extends State[T]>(id: T, value: V) {
    this.setState((prev) => ({
      ...prev,
      [id]: value,
    }));
  }

  addMeaning = () => {
    this.setState({
      meanings: [
        ...this.state.meanings,
        {
          meaning: '',
          examples: '',
        },
      ],
    });
  };

  updateMeaning = (idx: number, value: string) => {
    let meanings = this.state.meanings;
    meanings[idx].meaning = value;
    this.setState({
      meanings: meanings,
    });
  };

  updateMeaningExamples = (idx: number, value: string) => {
    let meanings = this.state.meanings;
    meanings[idx].examples = value;
    this.setState({
      meanings: meanings,
    });
  };

  updateProperty = (propName: string, valueName: string, value: boolean) => {
    this.setState({
      properties: {
        ...(this.state.properties ? this.state.properties : {}),
        [propName]: {
          ...(this.state.properties && propName in this.state.properties
            ? this.state.properties[propName]
            : {}),
          [valueName]: value,
        },
      },
    });
  };

  render() {
    return (
      <div className="row my-4">
        <div className="col-12">
          {this.props.word && this.props.word.get('author')
            ? 'Автор - ' + this.props.word.get('author')
            : 'Автор неизвестен'}
          <form onSubmit={this.props.word_id ? this.editWord : this.addWord}>
            <div className="form-group">
              <label htmlFor="word">Слово</label>
              <DevanagariTextInput
                placeholder="हिंदी"
                setValue={(value) => this.updateInput('word', value)}
                defaultValue={this.state.word}
              />
            </div>
            <div className="form-group">
              <label htmlFor="transliteration">Транслитерация</label>
              <DevanagariTextInput
                placeholder="hindi"
                setValue={(value) => this.updateInput('transliteration', value)}
                defaultValue={this.state.transliteration}
              />
            </div>
            <div className="form-group">
              <label htmlFor="spellings">Альтернативные написания</label>
              <DevanagariTextInput
                placeholder="हिंदी, हिन्दी"
                setValue={(value) => this.updateInput('spellings', value)}
                defaultValue={this.state.spellings}
              />
            </div>
            <div className="form-group">
              <label htmlFor="part_of_speech">Часть речи</label>
              <select
                className="form-control"
                id="part_of_speech"
                onChange={(e) =>
                  this.updateInput(
                    'part_of_speech',
                    e.currentTarget.value as PartOfSpeech
                  )
                }
                value={this.state.part_of_speech}
              >
                {Object.entries(PARTS_OF_SPEECH).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <hr />
            <label htmlFor="properties">Свойства</label>
            {(PARTS_OF_SPEECH_PROPERTIES[this.state.part_of_speech] || []).map(
              (prop) => (
                <div className="form-group" key={'prop-' + prop.key}>
                  <label htmlFor={prop.key}>{prop.name}</label>
                  <br />
                  <div className="form-check form-check-inline">
                    {prop.values.map((value) => {
                      let valueId = 'prop-' + prop.key + '-value-' + value.key;
                      return (
                        <React.Fragment key={valueId}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={valueId}
                            value={value.key}
                            onChange={(event) =>
                              this.updateProperty(
                                prop.key,
                                value.key,
                                event.target.checked
                              )
                            }
                            checked={
                              this.state.properties &&
                              prop.key in this.state.properties &&
                              value.key in this.state.properties[prop.key]
                                ? this.state.properties[prop.key][value.key]
                                : false
                            }
                          />
                          <label
                            className="form-check-label pr-2"
                            htmlFor={valueId}
                          >
                            {value.name}
                          </label>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              )
            )}
            <hr />
            <div className="form-group">
              <label>Значения</label>
              {this.state.meanings.map((value, index) => {
                return (
                  <div
                    className="input-group"
                    key={'meaning-input-group-' + index}
                  >
                    <textarea
                      className="form-control"
                      id={'meanings-' + index}
                      placeholder="хинди (язык)"
                      rows={3}
                      required={true}
                      value={value.meaning}
                      onChange={(event) =>
                        this.updateMeaning(index, event.target.value)
                      }
                    />
                    <textarea
                      className="form-control"
                      id={'meanings_example' + index}
                      placeholder="हम हिंदी बोलते हैं। Мы говорим на хинди."
                      rows={3}
                      value={value.examples}
                      onChange={(event) =>
                        this.updateMeaningExamples(index, event.target.value)
                      }
                    />
                    <div className="input-group-append">
                      {index === this.state.meanings.length - 1 ? (
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={this.addMeaning}
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      ) : (
                        ''
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="form-group">
              <label htmlFor="control_rus">Управление</label>
              <div className="input-group">
                <textarea
                  className="form-control"
                  id="control_hin"
                  rows={3}
                  placeholder="на хинди"
                  onChange={(e) =>
                    this.updateInput('control_hin', e.currentTarget.value)
                  }
                  defaultValue={this.state.control_hin}
                />
                <textarea
                  className="form-control"
                  id="control_rus"
                  rows={3}
                  placeholder="на русском"
                  required={true}
                  onChange={(e) =>
                    this.updateInput('control_rus', e.currentTarget.value)
                  }
                  defaultValue={this.state.control_rus}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="stable_phrases_rus">
                Устойчивые словосочетания
              </label>
              <div className="input-group">
                <textarea
                  className="form-control"
                  id="stable_phrases_hin"
                  rows={3}
                  placeholder="на хинди"
                  onChange={(e) =>
                    this.updateInput(
                      'stable_phrases_hin',
                      e.currentTarget.value
                    )
                  }
                  defaultValue={this.state.stable_phrases_hin}
                />
                <textarea
                  className="form-control"
                  id="stable_phrases_rus"
                  rows={3}
                  placeholder="на русском"
                  required={true}
                  onChange={(e) =>
                    this.updateInput(
                      'stable_phrases_rus',
                      e.currentTarget.value
                    )
                  }
                  defaultValue={this.state.stable_phrases_rus}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="examples_rus">Примеры</label>
              <div className="input-group">
                <textarea
                  className="form-control"
                  id="examples_hin"
                  rows={3}
                  placeholder="на хинди"
                  onChange={(e) =>
                    this.updateInput('examples_hin', e.currentTarget.value)
                  }
                  defaultValue={this.state.examples_hin}
                />
                <textarea
                  className="form-control"
                  id="examples_rus"
                  rows={3}
                  placeholder="на русском"
                  required={true}
                  onChange={(e) =>
                    this.updateInput('examples_rus', e.currentTarget.value)
                  }
                  defaultValue={this.state.examples_rus}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="taken_from">Откуда заимствовано</label>
              <select
                className="form-control"
                id="taken_from"
                onChange={(e) =>
                  this.updateInput('taken_from', e.currentTarget.value)
                }
                value={this.state.taken_from}
              >
                <option value="ниоткуда">ниоткуда</option>
                <option value="санскрит">санскрит</option>
                <option value="персидский">персидский</option>
                <option value="арабский">арабский</option>
                <option value="английский">английский</option>
                <option value="португальский">португальский</option>
              </select>
            </div>
            <div className="col-12 my-3 text-center">
              <button
                className={
                  'btn btn-outline-primary' +
                  (this.state.upload_status !== 'not_started'
                    ? ' disabled'
                    : '')
                }
                type="submit"
              >
                {this.state.upload_status === 'error'
                  ? 'Что-то пошло не так. Нажмите F12, сделайте скриншот и покажите его Диме.'
                  : 'Отправить'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default WordAddForm;
