import React from 'react';
import {DEVANGARI_SYMBOLS} from '../utils/devangari';

type Props = {
  defaultValue: string;
  placeholder: string;
  setValue: (nextValue: string) => void;
};

type State = {
  value: string;
};

class DevanagariTextInput extends React.Component<Props, State> {
  setValue: (nextValue: string) => void;

  constructor(props: Props) {
    super(props);
    this.setValue = props.setValue;
    this.state = {value: props.defaultValue};
  }

  render() {
    return (
      <React.Fragment>
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder={this.props.placeholder}
            value={this.state.value}
            onChange={(evt) => {
              this.setState({value: evt.target.value});
              this.setValue(evt.target.value);
            }}
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
          <table className="table">
            <tbody>
              {DEVANGARI_SYMBOLS.map((symbol_chunk, chunk_index) => (
                <tr key={'symbol-chunk-' + chunk_index}>
                  {symbol_chunk.map((symbol, symbol_index) => (
                    <td
                      key={'symbol-' + chunk_index + '-' + symbol_index}
                      onClick={() => {
                        let newValue = (this.state.value || '') + symbol;
                        this.setState({
                          value: newValue,
                        });
                        this.setValue(newValue);
                      }}
                    >
                      {symbol}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </React.Fragment>
    );
  }
}

export default DevanagariTextInput;
