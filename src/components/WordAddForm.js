import React from "react";
import Database from "../db";
import { getPartsOfSpeech, getPropertiesForPartOfSpeech } from "../utils";
import DevanagariTextInput from "./devanagari";

class WordAddWorm extends React.Component {
  constructor(props) {
    super(props);
    this.database = new Database();
    this.state = this.getCleanState();
    console.log(
      this.props.word ? this.props.word.get("stable_phrases").rus : "no word"
    );
  }

  getCleanState = () => ({
    upload_status: "not_started",
    word: this.props.word ? this.props.word.get("word") : "",
    transliteration: this.props.word
      ? this.props.word.get("transliteration")
      : "",
    spellings: this.props.word
      ? this.props.word.get("spellings").join(",")
      : "",
    part_of_speech: this.props.word
      ? this.props.word.get("part_of_speech")
      : "noun",
    properties: this.props.word ? this.props.word.get("properties") : {},
    taken_from: this.props.word
      ? this.props.word.get("taken_from")
      : "ниоткуда",
    meanings: this.props.word
      ? this.props.word.get("meanings")
      : [
          {
            meaning: "",
            examples: "",
          },
        ],
    control_rus:
      this.props.word && this.props.word.get("control")
        ? this.props.word.get("control").rus
        : "",
    control_hin:
      this.props.word && this.props.word.get("control")
        ? this.props.word.get("control").hin
        : "",
    stable_phrases_rus:
      this.props.word && this.props.word.get("stable_phrases")
        ? this.props.word.get("stable_phrases").rus
        : "",
    stable_phrases_hin:
      this.props.word && this.props.word.get("stable_phrases")
        ? this.props.word.get("stable_phrases").hin
        : "",
    examples_rus:
      this.props.word && this.props.word.get("examples")
        ? this.props.word.get("examples").rus
        : "",
    examples_hin:
      this.props.word && this.props.word.get("examples")
        ? this.props.word.get("examples").hin
        : "",
  });

  resetState = () => this.setState(this.getCleanState());

  setUploadingWord = () => this.setState({ upload_status: "pending" });
  setSomethingWentWrong = () => this.setState({ upload_status: "error" });

  editWord = (event) => {
    event.preventDefault();
    this.setUploadingWord();
    this.database
      .updateWord(this.props.word_id, {
        word: this.state.word,
        transliteration: this.state.transliteration,
        spellings: this.state.spellings.split(","),
        part_of_speech: this.state.part_of_speech,
        meanings: this.state.meanings,
        properties: this.state.properties ? this.state.properties : {},
        taken_from: this.state.taken_from,
        control: {
          rus: this.state.control_rus,
          hin: this.state.control_hin,
        },
        stable_phrases: {
          rus: this.state.stable_phrases_rus,
          hin: this.state.stable_phrases_hin,
        },
        examples: {
          rus: this.state.examples_rus,
          hin: this.state.examples_hin,
        },
        status: "draft",
      })
      .then(this.props.routeToView)
      .catch(this.setSomethingWentWrong);
  };

  addWord = (event) => {
    event.preventDefault();
    this.setUploadingWord();
    this.database
      .saveWord({
        word: this.state.word,
        transliteration: this.state.transliteration,
        spellings: this.state.spellings.split(","),
        part_of_speech: this.state.part_of_speech,
        meanings: this.state.meanings,
        properties: this.state.properties ? this.state.properties : {},
        taken_from: this.state.taken_from,
        control: {
          rus: this.state.control_rus,
          hin: this.state.control_hin,
        },
        stable_phrases: {
          rus: this.state.stable_phrases_rus,
          hin: this.state.stable_phrases_hin,
        },
        examples: {
          rus: this.state.examples_rus,
          hin: this.state.examples_hin,
        },
        status: "draft",
        author: this.props.user ? this.props.user.email : undefined,
      })
      .then(this.resetState)
      .catch(this.setSomethingWentWrong);
  };

  updateInput = (e) => {
    this.setState({
      [e.target.id]: e.target.value,
    });
  };

  addMeaning = (e) => {
    this.setState({
      meanings: [
        ...this.state.meanings,
        {
          meaning: "",
          examples: "",
        },
      ],
    });
  };

  updateMeaning = (idx, value) => {
    let meanings = this.state.meanings;
    meanings[idx].meaning = value;
    this.setState({
      meanings: meanings,
    });
  };

  updateMeaningExamples = (idx, value) => {
    let meanings = this.state.meanings;
    meanings[idx].examples = value;
    this.setState({
      meanings: meanings,
    });
  };

  updateProperty = (propName, valueName, value) => {
    this.setState({
      properties: {
        ...(this.state.properties ? this.state.properties : {}),
        [propName]: {
          ...(this.state.properties && propName in this.state.properties
            ? this.state.properties[propName]
            : {}),
          [valueName]: value,
        },
      },
    });
  };

  render() {
    return (
      <div className="row my-4">
        <div className="col-12">
          {this.props.word && this.props.word.get("author")
            ? "Автор - " + this.props.word.get("author")
            : "Автор неизвестен"}
          <form onSubmit={this.props.word_id ? this.editWord : this.addWord}>
            <div className="form-group">
              <label htmlFor="word">Слово</label>
              <DevanagariTextInput
                id="word"
                placeholder="हिंदी"
                required={true}
                setValue={(value) =>
                  this.updateInput({ target: { id: "word", value: value } })
                }
                defaultValue={this.state.word}
              />
            </div>
            <div className="form-group">
              <label htmlFor="transliteration">Транслитерация</label>
              <DevanagariTextInput
                id="transliteration"
                placeholder="hindi"
                required={true}
                setValue={(value) =>
                  this.updateInput({
                    target: { id: "transliteration", value: value },
                  })
                }
                defaultValue={this.state.transliteration}
              />
            </div>
            <div className="form-group">
              <label htmlFor="spellings">Альтернативные написания</label>
              <DevanagariTextInput
                id="spellings"
                placeholder="हिंदी, हिन्दी"
                setValue={(value) =>
                  this.updateInput({
                    target: { id: "spellings", value: value },
                  })
                }
                defaultValue={this.state.spellings}
              />
            </div>
            <div className="form-group">
              <label htmlFor="part_of_speech">Часть речи</label>
              <select
                className="form-control"
                id="part_of_speech"
                onChange={this.updateInput}
                value={this.state.part_of_speech}
              >
                {Object.entries(getPartsOfSpeech()).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <hr />
            <label htmlFor="properties">Свойства</label>
            {getPropertiesForPartOfSpeech(this.state.part_of_speech).map(
              (prop) => (
                <div className="form-group" key={"prop-" + prop.name}>
                  <label htmlFor={prop.name}>{prop.readableName}</label>
                  <br />
                  <div className="form-check form-check-inline">
                    {prop.values.map((value) => {
                      let valueId =
                        "prop-" + prop.name + "-value-" + value.name;
                      return (
                        <React.Fragment key={valueId}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={valueId}
                            value={value.name}
                            onChange={(event) =>
                              this.updateProperty(
                                prop.name,
                                value.name,
                                event.target.checked
                              )
                            }
                            checked={
                              this.state.properties &&
                              prop.name in this.state.properties &&
                              value.name in this.state.properties[prop.name]
                                ? this.state.properties[prop.name][value.name]
                                : false
                            }
                          />
                          <label
                            className="form-check-label pr-2"
                            htmlFor={valueId}
                          >
                            {value.readableName}
                          </label>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              )
            )}
            <hr />
            <div className="form-group">
              <label>Значения</label>
              {this.state.meanings.map((value, index) => {
                return (
                  <div
                    className="input-group"
                    key={"meaning-input-group-" + index}
                  >
                    <textarea
                      className="form-control"
                      id={"meanings-" + index}
                      placeholder="хинди (язык)"
                      rows="3"
                      required={true}
                      value={value.meaning}
                      onChange={(event) =>
                        this.updateMeaning(index, event.target.value)
                      }
                    ></textarea>
                    <textarea
                      className="form-control"
                      id={"meanings_example" + index}
                      placeholder="हम हिंदी बोलते हैं। Мы говорим на хинди."
                      rows="3"
                      value={value.examples}
                      onChange={(event) =>
                        this.updateMeaningExamples(index, event.target.value)
                      }
                    ></textarea>
                    <div className="input-group-append">
                      {index === this.state.meanings.length - 1 ? (
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={this.addMeaning}
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="form-group">
              <label htmlFor="control_rus">Управление</label>
              <div className="input-group">
                <textarea
                  className="form-control"
                  id="control_hin"
                  rows="3"
                  placeholder="на хинди"
                  onChange={this.updateInput}
                  defaultValue={this.state.control_hin}
                ></textarea>
                <textarea
                  className="form-control"
                  id="control_rus"
                  rows="3"
                  placeholder="на русском"
                  required={true}
                  onChange={this.updateInput}
                  defaultValue={this.state.control_rus}
                ></textarea>
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
                  rows="3"
                  placeholder="на хинди"
                  onChange={this.updateInput}
                  defaultValue={this.state.stable_phrases_hin}
                ></textarea>
                <textarea
                  className="form-control"
                  id="stable_phrases_rus"
                  rows="3"
                  placeholder="на русском"
                  required={true}
                  onChange={this.updateInput}
                  defaultValue={this.state.stable_phrases_rus}
                ></textarea>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="examples_rus">Примеры</label>
              <div className="input-group">
                <textarea
                  className="form-control"
                  id="examples_hin"
                  rows="3"
                  placeholder="на хинди"
                  onChange={this.updateInput}
                  defaultValue={this.state.examples_hin}
                ></textarea>
                <textarea
                  className="form-control"
                  id="examples_rus"
                  rows="3"
                  placeholder="на русском"
                  required={true}
                  onChange={this.updateInput}
                  defaultValue={this.state.examples_rus}
                ></textarea>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="taken_from">Откуда заимствовано</label>
              <select
                className="form-control"
                id="taken_from"
                onChange={this.updateInput}
                value={this.state.taken_from}
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
                  "btn btn-outline-primary" +
                  (this.state.upload_status !== "not_started"
                    ? " disabled"
                    : "")
                }
                type="submit"
              >
                {this.state.upload_status === "error"
                  ? "Что-то пошло не так. Нажмите F12, сделайте скриншот и покажите его Диме."
                  : "Отправить"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default WordAddWorm;
