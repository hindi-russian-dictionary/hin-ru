import React from 'react';

import {Article} from 'client/lib/db';
import {PARTS_OF_SPEECH, PartOfSpeech} from 'client/utils/parts-of-speech';
import {DevanagariTextInput} from 'client/components/devangari-text-input/devangari-text-input';
import {PropertiesForm} from 'client/components/properties-form/properties-form';
import {MeaningsForm} from 'client/components/meanings-form/meanings-form';
import {useUserControls} from 'client/hooks/useUserControls';
import {useArticleGroup} from 'client/hooks/useArticleGroup';
import {useNavigate, useParams} from 'react-router-dom';
import {useUpdateArticle} from 'client/hooks/useUpdateArticle';
import {useAddArticle} from 'client/hooks/useAddArticle';
import {getNextValue} from 'client/utils/react-utils';

type UploadStatus = 'not_started' | 'pending' | 'success' | 'error';

const getEmptyArticle = (): Article => ({
  id: 'temporary',
  status: 'draft',
  word: '',
  transliteration: '',
  spellings: [],
  part_of_speech: 'noun',
  properties: {},
  meanings: [],
  control: {
    hin: '',
    rus: '',
  },
  stable_phrases: {
    hin: '',
    rus: '',
  },
  examples: {
    hin: '',
    rus: '',
  },
  taken_from: 'ниоткуда',
});

export const WordAddForm: React.FC = () => {
  const navigate = useNavigate();
  const openArticlePage = React.useCallback(
    (word: string) => navigate(`/article/${word}`),
    [navigate]
  );

  const params = useParams<'word' | 'id'>();
  const [articleGroup] = useArticleGroup(params.word || '');
  const selectedArticle = articleGroup?.find(
    (article) => article.id === params.id
  );
  const addArticle = useAddArticle();
  const updateArticle = useUpdateArticle();

  const {user} = useUserControls();

  const [uploadStatus, setUploadStatus] =
    React.useState<UploadStatus>('not_started');

  const [localArticle, setLocalArticle] = React.useState<Article>(
    selectedArticle || getEmptyArticle()
  );
  React.useEffect(() => {
    if (selectedArticle) {
      setLocalArticle(selectedArticle);
    }
  }, [selectedArticle, setLocalArticle]);

  const addWord = React.useCallback<React.FormEventHandler<HTMLFormElement>>(
    async (e) => {
      e.preventDefault();
      setUploadStatus('pending');
      try {
        const id = await addArticle({
          ...localArticle,
          author: user?.email || undefined,
        });
        setLocalArticle((prev) => ({...prev, id}));
        setUploadStatus('success');
        openArticlePage(localArticle.word);
      } catch (e) {
        setUploadStatus('error');
      }
    },
    [
      setUploadStatus,
      addArticle,
      localArticle,
      setLocalArticle,
      openArticlePage,
      user,
    ]
  );

  const editWord = React.useCallback<React.FormEventHandler<HTMLFormElement>>(
    async (e) => {
      e.preventDefault();
      setUploadStatus('pending');
      try {
        await updateArticle(localArticle);
        setUploadStatus('success');
        openArticlePage(localArticle.word);
      } catch (e) {
        setUploadStatus('error');
      }
    },
    [setUploadStatus, updateArticle, localArticle, openArticlePage]
  );

  const updateLocalArticle = React.useCallback(
    function <K extends keyof Article>(
      key: K,
      action: React.SetStateAction<Article[K]>
    ) {
      setLocalArticle((prev) => ({
        ...prev,
        [key]: getNextValue(prev[key], action),
      }));
    },
    [setLocalArticle]
  );

  const setProperties = React.useCallback<
    React.Dispatch<React.SetStateAction<Article['properties']>>
  >((props) => updateLocalArticle('properties', props), [updateLocalArticle]);
  const setMeanings = React.useCallback<
    React.Dispatch<React.SetStateAction<Article['meanings']>>
  >(
    (meanings) => updateLocalArticle('meanings', meanings),
    [updateLocalArticle]
  );
  const setWord = React.useCallback<
    React.Dispatch<React.SetStateAction<Article['word']>>
  >((value) => updateLocalArticle('word', value), [updateLocalArticle]);
  const setTransliteration = React.useCallback<
    React.Dispatch<React.SetStateAction<Article['transliteration']>>
  >(
    (value) => updateLocalArticle('transliteration', value),
    [updateLocalArticle]
  );
  const setSpellings = React.useCallback<
    React.Dispatch<React.SetStateAction<string>>
  >(
    (value) =>
      updateLocalArticle('spellings', (prev) =>
        (typeof value === 'function' ? value(prev.join(',')) : value).split(',')
      ),
    [updateLocalArticle]
  );

  return (
    <div className="row my-4">
      <div className="col-12">
        {`Автор ${
          selectedArticle?.author ? `- ${selectedArticle.author}` : 'неизвестен'
        }`}
        <form onSubmit={selectedArticle ? editWord : addWord}>
          <div className="form-group">
            <label htmlFor="word">Слово</label>
            <DevanagariTextInput
              placeholder="हिंदी"
              value={localArticle.word}
              setValue={setWord}
            />
          </div>
          <div className="form-group">
            <label htmlFor="transliteration">Транслитерация</label>
            <DevanagariTextInput
              placeholder="hindi"
              value={localArticle.transliteration}
              setValue={setTransliteration}
            />
          </div>
          <div className="form-group">
            <label htmlFor="spellings">Альтернативные написания</label>
            <DevanagariTextInput
              placeholder="हिंदी, हिन्दी"
              value={localArticle.spellings.join(',')}
              setValue={setSpellings}
            />
          </div>
          <div className="form-group">
            <label htmlFor="part_of_speech">Часть речи</label>
            <select
              className="form-control"
              id="part_of_speech"
              value={localArticle.part_of_speech}
              onChange={(e) =>
                updateLocalArticle(
                  'part_of_speech',
                  e.currentTarget.value as PartOfSpeech
                )
              }
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
            partOfSpeech={localArticle.part_of_speech}
            properties={localArticle.properties}
            setProperties={setProperties}
          />
          <hr />
          <div className="form-group">
            <MeaningsForm
              meanings={localArticle.meanings}
              setMeanings={setMeanings}
            />
          </div>
          <div className="form-group">
            <label htmlFor="control_rus">Управление</label>
            <div className="input-group">
              <textarea
                className="form-control"
                id="control_hin"
                rows={3}
                placeholder="на хинди"
                value={localArticle.control.hin}
                onChange={(e) => {
                  const nextValue = e.currentTarget.value;
                  updateLocalArticle('control', (prev) => ({
                    ...prev,
                    hin: nextValue,
                  }));
                }}
              />
              <textarea
                className="form-control"
                id="control_rus"
                rows={3}
                placeholder="на русском"
                required
                value={localArticle.control.rus}
                onChange={(e) => {
                  const nextValue = e.currentTarget.value;
                  updateLocalArticle('control', (prev) => ({
                    ...prev,
                    rus: nextValue,
                  }));
                }}
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
                value={localArticle.stable_phrases.hin}
                onChange={(e) => {
                  const nextValue = e.currentTarget.value;
                  updateLocalArticle('stable_phrases', (prev) => ({
                    ...prev,
                    hin: nextValue,
                  }));
                }}
              />
              <textarea
                className="form-control"
                id="stable_phrases_rus"
                rows={3}
                placeholder="на русском"
                required
                value={localArticle.stable_phrases.rus}
                onChange={(e) => {
                  const nextValue = e.currentTarget.value;
                  updateLocalArticle('stable_phrases', (prev) => ({
                    ...prev,
                    rus: nextValue,
                  }));
                }}
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
                value={localArticle.examples.hin}
                onChange={(e) => {
                  const nextValue = e.currentTarget.value;
                  updateLocalArticle('examples', (prev) => ({
                    ...prev,
                    hin: nextValue,
                  }));
                }}
              />
              <textarea
                className="form-control"
                id="examples_rus"
                rows={3}
                placeholder="на русском"
                required
                value={localArticle.examples.rus}
                onChange={(e) => {
                  const nextValue = e.currentTarget.value;
                  updateLocalArticle('examples', (prev) => ({
                    ...prev,
                    rus: nextValue,
                  }));
                }}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="taken_from">Откуда заимствовано</label>
            <select
              className="form-control"
              id="taken_from"
              value={localArticle.taken_from}
              onChange={(e) =>
                updateLocalArticle('taken_from', e.currentTarget.value)
              }
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
