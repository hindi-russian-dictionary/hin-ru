import React from 'react';

import {DevangariKeyboard} from 'client/components/devangari-keyboard/devangari-keyboard';

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

type Props = Omit<InputProps, 'onChange'> & {
  setValue: React.Dispatch<React.SetStateAction<string>>;
};

export const DevanagariTextInput: React.FC<Props> = ({
  setValue,
  ...props
}) => {
  const addSymbol = React.useCallback(
    (symbol) => setValue((prev) => prev + symbol),
    [setValue]
  );
  return (
    <>
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          onChange={(e) => setValue(e.currentTarget.value)}
          {...props}
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
