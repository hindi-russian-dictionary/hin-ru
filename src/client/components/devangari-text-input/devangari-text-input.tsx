import React from 'react';

import {DevangariKeyboard} from 'client/components/devangari-keyboard/devangari-keyboard';

type Props = {
  placeholder: string;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
};

export const DevanagariTextInput: React.FC<Props> = (props) => {
  const addSymbol = React.useCallback(
    (symbol) => props.setValue((prev) => prev + symbol),
    [props.setValue]
  );
  return (
    <>
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder={props.placeholder}
          value={props.value}
          onChange={(e) => props.setValue(e.currentTarget.value)}
        />
        <div className="input-group-append">
          <button
            className="btn btn-outline-secondary"
            type="button"
            data-toggle="collapse"
            data-target="#devanagari-keyboard"
            aria-expanded="false"
            aria-controls="devanagari-keyboard"
          >
            <span role="img" aria-label="keyboard">
              ⌨️
            </span>
          </button>
        </div>
      </div>
      <div className="collapse" id="devanagari-keyboard">
        <DevangariKeyboard onClick={addSymbol} />
      </div>
    </>
  );
};
