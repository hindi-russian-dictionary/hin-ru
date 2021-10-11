import React from 'react';

import {DEVANGARI_SYMBOLS} from 'utils/devangari';

type Props = {
  onClick: (symbol: string) => void;
};

export const DevangariKeyboard: React.FC<Props> = (props) => {
  return (
    <table className="table">
      <tbody>
        {DEVANGARI_SYMBOLS.map((chunk, chunkIndex) => (
          <tr key={chunkIndex}>
            {chunk.map((symbol, index) => (
              <td key={index} onClick={() => props.onClick(symbol)}>
                {symbol}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
