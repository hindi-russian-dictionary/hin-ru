import React from 'react';

import {DevangariKeyboard} from 'client/components/devangari-keyboard/devangari-keyboard';
import {usePopperTooltip} from 'react-popper-tooltip';

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

type Props = Omit<InputProps, 'onChange'> & {
  setValue: React.Dispatch<React.SetStateAction<string>>;
};

export const DevanagariTextInput: React.FC<Props> = ({setValue, ...props}) => {
  const addSymbol = React.useCallback(
    (symbol) => setValue((prev) => prev + symbol),
    [setValue]
  );
  const [isTooltipOpen, setTooltipOpen] = React.useState(false);
  const switchTooltipOpen = React.useCallback(
    () => setTooltipOpen((x) => !x),
    [setTooltipOpen]
  );
  const {getTooltipProps, setTooltipRef, setTriggerRef, visible} =
    usePopperTooltip({
      trigger: null,
      visible: isTooltipOpen,
      onVisibleChange: setTooltipOpen,
    });
  return (
    <>
      <div className="input-group mb-3" ref={setTriggerRef}>
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
            onClick={switchTooltipOpen}
          >
            <span role="img" aria-label="keyboard">
              ⌨️
            </span>
          </button>
        </div>
      </div>
      {
        <div
          ref={setTooltipRef}
          {...getTooltipProps({
            className: 'tooltip-container',
            style: {display: visible ? 'block' : 'none'},
          })}
        >
          <DevangariKeyboard onClick={addSymbol} />
        </div>
      }
    </>
  );
};
