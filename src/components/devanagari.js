import React from "react";

const symbols = [
  [
    "ऀ",
    "ँ",
    "ं",
    "ः",
    "ऄ",
    "अ",
    "आ",
    "इ",
    "ई",
    "उ",
    "ऊ",
    "ऋ",
    "ऌ",
    "ऍ",
    "ऎ",
    "ए",
  ],
  [
    "ऐ",
    "ऑ",
    "ऒ",
    "ओ",
    "औ",
    "क",
    "ख",
    "ग",
    "घ",
    "ङ",
    "च",
    "छ",
    "ज",
    "झ",
    "ञ",
    "ट",
  ],
  [
    "ठ",
    "ड",
    "ढ",
    "ण",
    "त",
    "थ",
    "द",
    "ध",
    "न",
    "ऩ",
    "प",
    "फ",
    "ब",
    "भ",
    "म",
    "य",
  ],
  [
    "र",
    "ऱ",
    "ल",
    "ळ",
    "ऴ",
    "व",
    "श",
    "ष",
    "स",
    "ह",
    "ऺ",
    "ऻ",
    "़",
    "ऽ",
    "ा",
    "ि",
  ],
  [
    "ी",
    "ु",
    "ू",
    "ृ",
    "ॄ",
    "ॅ",
    "ॆ",
    "े",
    "ै",
    "ॉ",
    "ॊ",
    "ो",
    "ौ",
    "्",
    "ॎ",
    "ॏ",
  ],
  [
    "ॐ",
    "॑",
    "॒",
    "॓",
    "॔",
    "ॕ",
    "ॖ",
    "ॗ",
    "क़",
    "ख़",
    "ग़",
    "ज़",
    "ड़",
    "ढ़",
    "फ़",
    "य़",
  ],
  [
    "ॠ",
    "ॡ",
    "ॢ",
    "ॣ",
    "।",
    "॥",
    "०",
    "१",
    "२",
    "३",
    "४",
    "५",
    "६",
    "७",
    "८",
    "९",
  ],
  [
    "॰",
    "ॱ",
    "ॲ",
    "ॳ",
    "ॴ",
    "ॵ",
    "ॶ",
    "ॷ",
    "ॸ",
    "ॹ",
    "ॺ",
    "ॻ",
    "ॼ",
    "ॽ",
    "ॾ",
    "ॿ",
  ],
];

class DevanagariTextInput extends React.Component {
  constructor(props) {
    super(props);
    this.setValue = props.setValue;
    this.state = { value: props.defaultValue };
  }

  render() {
    return (
      <React.Fragment>
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            value={this.state.value}
            onChange={(evt) => {
              this.setState({ value: evt.target.value });
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
              {symbols.map((symbol_chunk, chunk_index) => (
                <tr key={"symbol-chunk-" + chunk_index}>
                  {symbol_chunk.map((symbol, symbol_index) => (
                    <td
                      key={"symbol-" + chunk_index + "-" + symbol_index}
                      onClick={() => {
                        let newValue = (this.state.value || "") + symbol;
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
