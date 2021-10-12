import React from 'react';

import {Article} from 'lib/db';
import {PARTS_OF_SPEECH, PartOfSpeech} from 'utils/parts-of-speech';
import {DevanagariTextInput} from 'components/devangari-text-input/devangari-text-input';
import {PropertiesForm} from 'components/properties-form/properties-form';
import {MeaningsForm} from 'components/meanings-form/meanings-form';
import {useOpenArticlePage} from 'hooks/useOpenArticlePage';
import {useUserControls} from 'hooks/useUserControls';
import {useArticle} from 'hooks/useArticle';
import {useParams} from 'react-router-dom';
import {useUpdateArticle} from 'hooks/useUpdateArticle';
import {useAddArticle} from 'hooks/useAddArticle';
import {getNextValue} from 'utils/react-utils';

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
  const openArticlePage = useOpenArticlePage();

  const params = useParams<'word'>();
  const article = useArticle(params.word || '');
  const addArticle = useAddArticle();
  const updateArticle = useUpdateArticle();

  const {user} = useUserControls();

  const [uploadStatus, setUploadStatus] =
    React.useState<UploadStatus>('not_started');

  const [localArticle, setLocalArticle] = React.useState<Article>(
    article || getEmptyArticle()
  );
  React.useEffect(() => {
    if (article) {
      setLocalArticle(article);
    }
  }, [article, setLocalArticle]);

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

  return (
    <div className="row my-4">
      <div className="col-12">
        {`Автор ${article?.author ? `- ${article.author}` : 'неизвестен'}`}
        <form onSubmit={article ? editWord : addWord}>
          <div className="form-group">
            <label htmlFor="word">Слово</label>
            <DevanagariTextInput
              placeholder="हिंदी"
              value={localArticle.word}
              setValue={(value) => updateLocalArticle('word', value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="transliteration">Транслитерация</label>
            <DevanagariTextInput
              placeholder="hindi"
              value={localArticle.transliteration}
              setValue={(value) => updateLocalArticle('transliteration', value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="spellings">Альтернативные написания</label>
            <DevanagariTextInput
              placeholder="हिंदी, हिन्दी"
              value={localArticle.spellings.join(',')}
              setValue={(value) =>
                updateLocalArticle('spellings', (prev) =>
                  (typeof value === 'function'
                    ? value(prev.join(','))
                    : value
                  ).split(',')
                )
              }
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
            setProperties={(props) => updateLocalArticle('properties', props)}
          />
          <hr />
          <div className="form-group">
            <MeaningsForm
              meanings={localArticle.meanings}
              setMeanings={(meanings) =>
                updateLocalArticle('meanings', meanings)
              }
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
                onChange={(e) =>
                  updateLocalArticle('control', (prev) => ({
                    ...prev,
                    hin: e.currentTarget.value,
                  }))
                }
              />
              <textarea
                className="form-control"
                id="control_rus"
                rows={3}
                placeholder="на русском"
                required
                value={localArticle.control.rus}
                onChange={(e) =>
                  updateLocalArticle('control', (prev) => ({
                    ...prev,
                    rus: e.currentTarget.value,
                  }))
                }
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
                onChange={(e) =>
                  updateLocalArticle('stable_phrases', (prev) => ({
                    ...prev,
                    hin: e.currentTarget.value,
                  }))
                }
              />
              <textarea
                className="form-control"
                id="stable_phrases_rus"
                rows={3}
                placeholder="на русском"
                required
                value={localArticle.stable_phrases.rus}
                onChange={(e) =>
                  updateLocalArticle('stable_phrases', (prev) => ({
                    ...prev,
                    rus: e.currentTarget.value,
                  }))
                }
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
                onChange={(e) =>
                  updateLocalArticle('examples', (prev) => ({
                    ...prev,
                    hin: e.currentTarget.value,
                  }))
                }
              />
              <textarea
                className="form-control"
                id="examples_rus"
                rows={3}
                placeholder="на русском"
                required
                value={localArticle.examples.rus}
                onChange={(e) =>
                  updateLocalArticle('examples', (prev) => ({
                    ...prev,
                    rus: e.currentTarget.value,
                  }))
                }
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
