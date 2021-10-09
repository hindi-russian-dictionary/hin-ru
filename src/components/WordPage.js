import React from "react";
import { getPartsOfSpeech, getPropertiesForPartOfSpeech } from "../utils";
import Database from "../db";

class WordPage extends React.Component {
  constructor(props) {
    super(props);
    this.database = new Database();
    this.state = { isWordApproved: props.word.get("approved") };
  }

  render() {
    let word = this.props.word;
    return (
      <React.Fragment>
        {this.props.isAdmin ? (
          <button className="btn btn-info" onClick={this.props.routeToEdit}>
            Редактировать (осторожно, вы админ)
          </button>
        ) : (
          ""
        )}
        &nbsp;
        {this.props.isAdmin ? (
          !this.state.isWordApproved ? (
            <button
              className="btn btn-success"
              onClick={() =>
                this.database
                  .updateWord(word.id, { approved: true })
                  .then(() => this.setState({ isWordApproved: true }))
              }
            >
              Одобрить!
            </button>
          ) : (
            <button
              className="btn btn-danger"
              onClick={() =>
                this.database
                  .updateWord(word.id, { approved: false })
                  .then(() => this.setState({ isWordApproved: false }))
              }
            >
              Разодобрить :(
            </button>
          )
        ) : (
          ""
        )}
        <h1>{word.get("word")}</h1>
        <table className="table">
          <tbody>
            <tr>
              <th>Часть речи</th>
              <td>{getPartsOfSpeech()[word.get("part_of_speech")]}</td>
            </tr>
            <tr>
              <th>Транслитерация</th>
              <td>{word.get("transliteration")}</td>
            </tr>
            {getPropertiesForPartOfSpeech(word.get("part_of_speech")).map(
              (property) => (
                <tr key={word.get("word") + "-" + property.name}>
                  <th>{property.readableName}</th>
                  <td>
                    {word.get("properties") &&
                    property.name in word.get("properties")
                      ? Object.entries(word.get("properties")[property.name])
                          .filter(([_, value]) => value)
                          .map(
                            ([key, _]) =>
                              property.values.filter(
                                (value) => value.name === key
                              )[0].readableName
                          )
                      : "-"}
                  </td>
                </tr>
              )
            )}
            <tr>
              <th>Альтернативные написания</th>
              <td>{word.get("spellings")}</td>
            </tr>
            <tr>
              <th>Значения</th>
              <td>
                <table className="table">
                  <tbody>
                    {word.get("meanings").map((meaning) => (
                      <tr key={meaning.meaning}>
                        <td>{meaning.meaning}</td>
                        <td>{meaning.examples}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
            </tr>
            <tr>
              <th>Управление</th>
              <td>{word.get("control") ? word.get("control")["hin"] : ""}</td>
              <td>{word.get("control") ? word.get("control")["rus"] : ""}</td>
            </tr>
            <tr>
              <th>Устойчивые словосочетания</th>
              <td>
                {word.get("stable_phrases")
                  ? word.get("stable_phrases")["hin"]
                  : ""}
              </td>
              <td>
                {word.get("stable_phrases")
                  ? word.get("stable_phrases")["rus"]
                  : ""}
              </td>
            </tr>
            <tr>
              <th>Примеры</th>
              <td>{word.get("examples") ? word.get("examples")["hin"] : ""}</td>
              <td>{word.get("examples") ? word.get("examples")["rus"] : ""}</td>
            </tr>
            <tr>
              <th>Заимствовано из</th>
              <td>{word.get("taken_from")}</td>
            </tr>
          </tbody>
        </table>
      </React.Fragment>
    );
  }
}

export default WordPage;
