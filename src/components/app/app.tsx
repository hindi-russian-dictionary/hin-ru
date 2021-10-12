import React from 'react';
import {
  User as FirebaseUser,
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  setPersistence,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from '@firebase/auth';

import {Article, database} from 'lib/db';
import {MainPage} from 'components/main-page/main-page';
import {WordAddForm} from 'components/word-add-form/word-add-form';
import {WordPage} from 'components/word-page/word-page';
import {AboutUsPage} from 'components/about-us-page/about-us-page';

import './app.css';

type Route = 'main-page' | 'about-us' | 'add-word' | 'edit-word' | 'view-word';

export const App: React.FC = () => {
  const [route, setRoute] = React.useState<Route>('main-page');
  const [loadedArticles, setLoadedArticles] = React.useState<Article[]>([]);
  const [user, setUser] = React.useState<FirebaseUser>();
  const [isUserAdmin, setUserAdmin] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [auth] = React.useState(() => getAuth());

  const signIn = React.useCallback(async () => {
    await setPersistence(auth, {type: 'LOCAL'});
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    if (result.user) {
      setUser(result.user);
      setUserAdmin(await database.fetchUserAdmin(result.user));
    }
  }, [setUser, setUserAdmin]);

  const signOut = React.useCallback(async () => {
    setUser(undefined);
    setUserAdmin(false);
    await firebaseSignOut(auth);
  }, [setUser, setUserAdmin, auth]);

  const initialAuthorize = React.useCallback(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setUserAdmin(await database.fetchUserAdmin(user));
      }
    });
  }, [database, auth, setUser, setUserAdmin]);

  React.useEffect(() => initialAuthorize(), [initialAuthorize]);

  const viewWord = React.useCallback<(id: string) => void>(
    (id) => {
      setSelectedIndex(loadedArticles.findIndex((word) => word.id === id));
      setRoute('view-word');
    },
    [loadedArticles, setSelectedIndex, setRoute]
  );

  const editWord = React.useCallback(() => {
    setRoute('edit-word');
  }, [setRoute]);

  const onWordEditDone = React.useCallback(() => {
    setSelectedIndex(-1);
    setRoute('view-word');
  }, [setSelectedIndex, setRoute]);

  const searchWord = React.useCallback(
    async (term: string) => {
      setLoadedArticles(await database.lookupArticles(term, isUserAdmin));
    },
    [setLoadedArticles, database, isUserAdmin]
  );

  const selectedArticle = loadedArticles[selectedIndex];
  const page = React.useMemo(() => {
    switch (route) {
      case 'about-us':
        return <AboutUsPage />;
      case 'add-word':
      case 'edit-word':
        return (
          <WordAddForm
            article={selectedArticle}
            user={user}
            routeToView={onWordEditDone}
            addWord={database.addArticle}
            updateWord={database.updateArticle}
          />
        );
      case 'view-word':
        if (!selectedArticle) {
          return null;
        }
        return (
          <WordPage
            article={selectedArticle}
            isAdmin={isUserAdmin}
            routeToEdit={editWord}
            updateWord={database.updateArticle}
          />
        );
      default:
        return (
          <MainPage
            articles={loadedArticles}
            lookupArticle={searchWord}
            openArticlePage={viewWord}
          />
        );
    }
  }, [
    route,
    user,
    selectedArticle,
    onWordEditDone,
    isUserAdmin,
    editWord,
    loadedArticles,
    viewWord,
    searchWord,
  ]);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <ul className="navbar-nav mr-auto">
          <li className="nav-item">
            <button
              className="btn nav-link"
              onClick={() => setRoute('main-page')}
            >
              Главная
            </button>
          </li>
          <li className="nav-item">
            <button
              className="btn nav-link"
              onClick={() => setRoute('add-word')}
            >
              Предложить свое слово
            </button>
          </li>
          <li className="nav-item">
            <button
              className="btn nav-link"
              onClick={() => setRoute('about-us')}
            >
              О нас
            </button>
          </li>
        </ul>
        {user ? (
          <button className="btn btn-primary" onClick={signOut}>
            Выйти ({user.displayName})
          </button>
        ) : (
          <button className="btn btn-primary" onClick={signIn}>
            Войти через Google
          </button>
        )}
      </nav>
      <div className="container">{page}</div>
    </>
  );
};
