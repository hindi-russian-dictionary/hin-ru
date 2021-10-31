import React from 'react';

import {Article} from 'client/lib/db';
import {updateAtArray} from 'client/utils/array-utils';
import {getNextValue} from 'client/utils/react-utils';

type Props = {
  meanings: Article['meanings'];
  setMeanings: React.Dispatch<React.SetStateAction<Article['meanings']>>;
};

export const MeaningsForm: React.FC<Props> = (props) => {
  const updateMeaning = React.useCallback<
    (
      meaning: React.SetStateAction<Article['meanings'][number]>,
      index: number
    ) => void
  >(
    (meaning, index) => {
      props.setMeanings((prevMeanings) =>
        updateAtArray(
          prevMeanings,
          index,
          getNextValue(prevMeanings[index], meaning)
        )
      );
    },
    [props.setMeanings]
  );
  const updateMeaningValue = React.useCallback<
    (value: string, index: number) => void
  >(
    (value, index) => {
      updateMeaning(
        (prevMeaning) => ({...prevMeaning, meaning: value}),
        index
      );
    },
    [updateMeaning]
  );
  const updateMeaningExamples = React.useCallback<
    (value: string, index: number) => void
  >(
    (value, index) => {
      updateMeaning(
        (prevMeaning) => ({...prevMeaning, examples: value}),
        index
      );
    },
    [updateMeaning]
  );
  const addMeaning = React.useCallback(
    () =>
      props.setMeanings((prevMeanings) => [
        ...prevMeanings,
        {meaning: '', examples: ''},
      ]),
    [props.setMeanings]
  );
  React.useEffect(() => {
    if (props.meanings.length === 0) {
      addMeaning();
    }
  }, [props.meanings, addMeaning]);

  return (
    <>
      <label>Значения</label>
      {props.meanings.map((value, index) => {
        return (
          <div className="input-group" key={index}>
            <textarea
              className="form-control"
              placeholder="хинди (язык)"
              rows={3}
              required
              value={value.meaning}
              onChange={(e) => updateMeaningValue(e.currentTarget.value, index)}
            />
            <textarea
              className="form-control"
              placeholder="हम हिंदी बोलते हैं। Мы говорим на хинди."
              rows={3}
              value={value.examples}
              onChange={(e) =>
                updateMeaningExamples(e.currentTarget.value, index)
              }
            />
            <div className="input-group-append">
              {index === props.meanings.length - 1 ? (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={addMeaning}
                >
                  <i className="fas fa-plus" />
                </button>
              ) : null}
            </div>
          </div>
        );
      })}
    </>
  );
};
