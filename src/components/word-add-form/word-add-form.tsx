import React from 'react';
import {User as FirebaseUser} from '@firebase/auth';

import {Article} from 'lib/db';
import {PARTS_OF_SPEECH, PartOfSpeech} from 'utils/parts-of-speech';
import {DevanagariTextInput} from 'components/devangari-text-input/devangari-text-input';
import {PropertiesForm} from 'components/properties-form/properties-form';
import {MeaningsForm} from 'components/meanings-form/meanings-form';

type Props = {
  article?: Article;
  user: FirebaseUser | null;
  addArticle: (article: Article) => Promise<string>;
  updateArticle: (article: Article) => Promise<void>;
  routeToView: () => void;
};

type UploadStatus = 'not_started' | 'pending' | 'success' | 'error';

export const WordAddForm: React.FC<Props> = (props) => {
  const [uploadStatus, setUploadStatus] =
    React.useState<UploadStatus>('not_started');

  const [word, setWord] = React.useState(() =>
    props.article ? props.article.word : ''
  );
  const [transliteration, setTransliteration] = React.useState(() =>
    props.article ? props.article.transliteration : ''
  );
  const [spellings, setSpellings] = React.useState(() =>
    props.article ? props.article.spellings.join(',') : ''
  );
  const [partOfSpeech, setPartOfSpeech] = React.useState<PartOfSpeech>(() =>
    props.article ? props.article.part_of_speech : 'noun'
  );
  const [properties, setProperties] = React.useState<Article['properties']>(
    () => (props.article ? props.article.properties : {})
  );
  const [meanings, setMeanings] = React.useState(() =>
    props.article ? props.article.meanings : []
  );
  const [controlHindi, setControlHindi] = React.useState(() =>
    props.article ? props.article.control.hin : ''
  );
  const [controlRussian, setControlRussian] = React.useState(() =>
    props.article ? props.article.control.rus : ''
  );
  const [stablePhrasesHindi, setStablePhrasesHindi] = React.useState(() =>
    props.article ? props.article.stable_phrases.hin : ''
  );
  const [stablePhrasesRussian, setStablePhrasesRussian] = React.useState(() =>
    props.article ? props.article.stable_phrases.rus : ''
  );
  const [examplesHindi, setExamplesHindi] = React.useState(() =>
    props.article ? props.article.examples.hin : ''
  );
  const [examplesRussian, setExamplesRussian] = React.useState(() =>
    props.article ? props.article.examples.rus : ''
  );
  const [takenFrom, setTakenFrom] = React.useState(() =>
    props.article ? props.article.taken_from : 'ниоткуда'
  );

  const getUpdatedWord = React.useCallback<() => Article>(
    () => ({
      id: props.article?.id ?? '',
      word,
      transliteration,
      spellings: spellings.split(','),
      part_of_speech: partOfSpeech,
      meanings,
      properties,
      taken_from: takenFrom,
      control: {
        rus: controlRussian,
        hin: controlHindi,
      },
      stable_phrases: {
        rus: stablePhrasesRussian,
        hin: stablePhrasesHindi,
      },
      examples: {
        rus: examplesRussian,
        hin: examplesHindi,
      },
      status: 'draft',
      author: props.user?.email || undefined,
    }),
    [
      props.article,
      props.user,
      word,
      transliteration,
      spellings,
      partOfSpeech,
      meanings,
      properties,
      controlHindi,
      controlRussian,
      stablePhrasesRussian,
      stablePhrasesHindi,
      examplesHindi,
      examplesRussian,
      takenFrom,
    ]
  );

  const addWord = React.useCallback<React.FormEventHandler<HTMLFormElement>>(
    async (e) => {
      e.preventDefault();
      setUploadStatus('pending');
      try {
        await props.addArticle(getUpdatedWord());
        setUploadStatus('success');
        props.routeToView();
      } catch (e) {
        setUploadStatus('error');
      }
    },
    [setUploadStatus, props.addArticle, getUpdatedWord, props.routeToView]
  );

  const editWord = React.useCallback<React.FormEventHandler<HTMLFormElement>>(
    async (e) => {
      e.preventDefault();
      if (!props.article) {
        return;
      }
      setUploadStatus('pending');
      try {
        await props.updateArticle(getUpdatedWord());
        setUploadStatus('success');
        props.routeToView();
      } catch (e) {
        setUploadStatus('error');
      }
    },
    [setUploadStatus, props.updateArticle, getUpdatedWord, props.routeToView]
  );

  return (
    <div className="row my-4">
      <div className="col-12">
        {`Автор ${
          props.article?.author ? `- ${props.article.author}` : 'неизвестен'
        }`}
        <form onSubmit={props.article ? editWord : addWord}>
          <div className="form-group">
            <label htmlFor="word">Слово</label>
            <DevanagariTextInput
              placeholder="हिंदी"
              value={word}
              setValue={setWord}
            />
          </div>
          <div className="form-group">
            <label htmlFor="transliteration">Транслитерация</label>
            <DevanagariTextInput
              placeholder="hindi"
              value={transliteration}
              setValue={setTransliteration}
            />
          </div>
          <div className="form-group">
            <label htmlFor="spellings">Альтернативные написания</label>
            <DevanagariTextInput
              placeholder="हिंदी, हिन्दी"
              value={spellings}
              setValue={setSpellings}
            />
          </div>
          <div className="form-group">
            <label htmlFor="part_of_speech">Часть речи</label>
            <select
              className="form-control"
              id="part_of_speech"
              onChange={(e) =>
                setPartOfSpeech(e.currentTarget.value as PartOfSpeech)
              }
              value={partOfSpeech}
            >
              {Object.entries(PARTS_OF_SPEECH).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <hr />
          <PropertiesForm
            partOfSpeech={partOfSpeech}
            properties={properties}
            setProperties={setProperties}
          />
          <hr />
          <div className="form-group">
            <MeaningsForm meanings={meanings} setMeanings={setMeanings} />
          </div>
          <div className="form-group">
            <label htmlFor="control_rus">Управление</label>
            <div className="input-group">
              <textarea
                className="form-control"
                id="control_hin"
                rows={3}
                placeholder="на хинди"
                onChange={(e) => setControlHindi(e.currentTarget.value)}
                value={controlHindi}
              />
              <textarea
                className="form-control"
                id="control_rus"
                rows={3}
                placeholder="на русском"
                required
                onChange={(e) => setControlRussian(e.currentTarget.value)}
                value={controlRussian}
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
                onChange={(e) => setStablePhrasesHindi(e.currentTarget.value)}
                value={stablePhrasesHindi}
              />
              <textarea
                className="form-control"
                id="stable_phrases_rus"
                rows={3}
                placeholder="на русском"
                required
                onChange={(e) => setStablePhrasesRussian(e.currentTarget.value)}
                value={stablePhrasesRussian}
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
                onChange={(e) => setExamplesHindi(e.currentTarget.value)}
                value={examplesHindi}
              />
              <textarea
                className="form-control"
                id="examples_rus"
                rows={3}
                placeholder="на русском"
                required
                onChange={(e) => setExamplesRussian(e.currentTarget.value)}
                value={examplesRussian}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="taken_from">Откуда заимствовано</label>
            <select
              className="form-control"
              id="taken_from"
              onChange={(e) => setTakenFrom(e.currentTarget.value)}
              value={takenFrom}
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
                (uploadStatus !== 'not_started' ? ' disabled' : '')
              }
              type="submit"
            >
              {uploadStatus === 'error'
                ? 'Что-то пошло не так. Нажмите F12, сделайте скриншот и покажите его Диме.'
                : 'Отправить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
