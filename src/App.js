import React from "react";
import firebase from "firebase/compat";
import Database from "./db";
import "./App.css";
import MainPage from "./components/MainPage";
import WordAddWorm from "./components/WordAddForm";
import WordPage from "./components/WordPage";
import AboutUsPage from "./components/AboutUsPage";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.database = new Database();
    this.state = this.getCleanState();
  }

  componentDidMount = () => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user: user });
        this.database.fetchUserAdmin(user, (value) =>
          this.setState({ userIsAdmin: value })
        );
      }
    });
  };

  getCleanState = () => ({
    currentRoute: "main-page",
    foundWords: [],
    user: undefined,
    userIsAdmin: false,
  });

  resetState = () =>
    this.setState({
      ...this.getCleanState(),
    });

  signIn = () => {
    let authProvider = new firebase.auth.GoogleAuthProvider();
    firebase
      .auth()
      .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(() => {
        firebase
          .auth()
          .signInWithPopup(authProvider)
          .then((result) => {
            this.setState({ user: result.user });
            this.database.fetchUserAdmin(result.user, (value) =>
              this.setState({ userIsAdmin: value })
            );
          });
      });
  };

  routeTo = (route) => this.setState({ currentRoute: route });

  signOut = () => {
    firebase.auth().signOut();
    this.setState({ user: undefined, userIsAdmin: false });
  };

  searchWord = (searchTerm) => {
    this.database
      .searchWords(searchTerm, this.state.userIsAdmin)
      .get()
      .then((snapshot) => {
        this.setState({
          foundWords: snapshot.docs,
        });
      });
  };

  viewWord = (word) => {
    this.setState({ word: word });
    this.routeTo("view-word");
  };

  getPage = () => {
    switch (this.state.currentRoute) {
      case "main-page":
        return (
          <MainPage
            foundWords={this.state.foundWords}
            searchWord={this.searchWord}
            viewWord={this.viewWord}
          />
        );
      case "about-us":
        return <AboutUsPage />;
      case "add-word":
        return <WordAddWorm user={this.state.user} />;
      case "edit-word":
        return (
          <WordAddWorm
            word_id={this.state.word_id}
            word={this.state.word}
            user={this.state.user}
          />
        );
      case "view-word":
        return (
          <WordPage
            word={this.state.word}
            isAdmin={this.state.userIsAdmin}
            routeToEdit={(evt) => {
              this.setState({ word_id: this.state.word.id });
              this.routeTo("edit-word");
            }}
            routeToView={(evt) => {
              this.setState({ word_id: undefined });
              this.routeTo("view-word");
            }}
          />
        );
      default:
        return <MainPage foundWords={this.state.foundWords} />;
    }
  };

  render() {
    return (
      <React.Fragment>
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <button
                className="btn nav-link"
                onClick={() => this.routeTo("main-page")}
              >
                Главная
              </button>
            </li>
            <li className="nav-item">
              <button
                className="btn nav-link"
                onClick={() => this.routeTo("add-word")}
              >
                Предложить свое слово
              </button>
            </li>
            <li className="nav-item">
              <button
                className="btn nav-link"
                onClick={() => this.routeTo("about-us")}
              >
                О нас
              </button>
            </li>
          </ul>
          {this.state.user ? (
            <button className="btn btn-primary" onClick={this.signOut}>
              Выйти ({this.state.user.displayName})
            </button>
          ) : (
            <button className="btn btn-primary" onClick={this.signIn}>
              Войти через Google
            </button>
          )}
        </nav>
        <div className="container">{this.getPage()}</div>
      </React.Fragment>
    );
  }
}

export default App;
