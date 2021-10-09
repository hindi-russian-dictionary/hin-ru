import React from "react";
import firebase from "firebase/compat";

import { Article } from "db";

type Props = {
  foundWords: firebase.firestore.QueryDocumentSnapshot<Article>[];
  searchWord?: (term: string) => void;
  viewWord?: (word: firebase.firestore.QueryDocumentSnapshot<Article>) => void;
};

type State = {
  searchTerm: string;
};

class MainPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { searchTerm: "" };
  }

  onSearchEnter = (event: React.KeyboardEvent): void => {
    if (event.key === "Enter") {
      this.props.searchWord!(this.state.searchTerm);
    }
  };

  render() {
    return (
      <div className="row my-4">
        <div className="col-12">
          <div className="input-group mb-3">
            <div className="input-group-prepend" style={{ width: "100%" }}>
              <span className="input-group-text cta" id="language-identifier">
                Hin/Ru
                <svg width="13px" height="10px" viewBox="0 0 13 10">
                  <path d="M1,5 L11,5"></path>
                  <polyline points="8 1 12 5 8 9"></polyline>
                </svg>
                &nbsp;&nbsp;
                <input
                  type="text"
                  className="form-control"
                  placeholder="Найти слово..."
                  aria-label="Слово"
                  aria-describedby="language-identifier"
                  onChange={(event) =>
                    this.setState({ searchTerm: event.target.value })
                  }
                  onKeyDown={this.onSearchEnter}
                />
              </span>
            </div>
          </div>
        </div>
        <div className="col-12">
          <div className="list-group">
            {this.props.foundWords.map((word) => (
              <button
                key={"open-word-modal-" + word.id}
                type="button"
                className="list-group-item list-group-item-action"
                onClick={(evt) => this.props.viewWord!(word)}
              >
                {word.get("word")}
                &nbsp; &nbsp; &nbsp;
                <span
                  className={
                    "badge " +
                    (word.get("approved")
                      ? "bg-success"
                      : "text-white bg-secondary")
                  }
                >
                  {word.get("approved") ? "одобрено" : "черновик"}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default MainPage;
