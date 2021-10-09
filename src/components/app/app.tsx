import React from 'react';
import firebase from 'firebase/compat';

import Database, {Article} from 'lib/db';
import MainPage from 'components/main-page/main-page';
import WordAddForm from 'components/word-add-form/word-add-form';
import WordPage from 'components/word-page/word-page';
import AboutUsPage from 'components/about-us-page/about-us-page';

import './app.css';

type Route = 'main-page' | 'about-us' | 'add-word' | 'edit-word' | 'view-word';

type State = {
  currentRoute: Route;
  foundWords: firebase.firestore.QueryDocumentSnapshot<Article>[];
  user?: firebase.User;
  userIsAdmin: boolean;
  word_id?: string;
  word?: firebase.firestore.DocumentSnapshot<Article>;
};

class App extends React.Component<{}, State> {
  database = new Database();

  constructor(props: {}) {
    super(props);
    this.state = this.getCleanState();
  }

  componentDidMount = () => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({user: user});
        this.database.fetchUserAdmin(user, (value) =>
          this.setState({userIsAdmin: value})
        );
      }
    });
  };

  getCleanState = (): State => ({
    currentRoute: 'main-page',
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
            this.setState({user: result.user || undefined});
            this.database.fetchUserAdmin(result.user!, (value) =>
              this.setState({userIsAdmin: value})
            );
          });
      });
  };

  routeTo = (route: Route) => this.setState({currentRoute: route});

  signOut = () => {
    firebase.auth().signOut();
    this.setState({user: undefined, userIsAdmin: false});
  };

  searchWord = (searchTerm: string) => {
    this.database
      .searchWords(searchTerm, this.state.userIsAdmin)
      .then((query) => query.get())
      .then((snapshot) => {
        this.setState({
          foundWords:
            snapshot.docs as firebase.firestore.QueryDocumentSnapshot<Article>[],
        });
      });
  };

  viewWord = (word: firebase.firestore.DocumentSnapshot<Article>) => {
    this.setState({word: word});
    this.routeTo('view-word');
  };

  getPage = () => {
    switch (this.state.currentRoute) {
      case 'main-page':
        return (
          <MainPage
            foundWords={this.state.foundWords}
            searchWord={this.searchWord}
            viewWord={this.viewWord}
          />
        );
      case 'about-us':
        return <AboutUsPage />;
      case 'add-word':
        return <WordAddForm user={this.state.user} />;
      case 'edit-word':
        return (
          <WordAddForm
            word_id={this.state.word_id}
            word={this.state.word}
            user={this.state.user}
            routeToView={() => {
              this.setState({word_id: undefined});
              this.routeTo('view-word');
            }}
          />
        );
      case 'view-word':
        return (
          <WordPage
            word={this.state.word!}
            isAdmin={this.state.userIsAdmin}
            routeToEdit={() => {
              this.setState({word_id: this.state.word!.id});
              this.routeTo('edit-word');
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
                onClick={() => this.routeTo('main-page')}
              >
                Главная
              </button>
            </li>
            <li className="nav-item">
              <button
                className="btn nav-link"
                onClick={() => this.routeTo('add-word')}
              >
                Предложить свое слово
              </button>
            </li>
            <li className="nav-item">
              <button
                className="btn nav-link"
                onClick={() => this.routeTo('about-us')}
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
