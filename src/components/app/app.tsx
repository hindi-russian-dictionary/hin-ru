import React from 'react';
import {useAsyncEffect} from 'use-async-effect';

import {Article, database} from 'lib/db';
import {MainPage} from 'components/main-page/main-page';
import {WordAddForm} from 'components/word-add-form/word-add-form';
import {WordPage} from 'components/word-page/word-page';
import {AboutUsPage} from 'components/about-us-page/about-us-page';

import {useUserControls} from 'hooks/useUserControls';
import {useFirestore} from 'hooks/useFirestore';

import './app.css';

type Route = 'main-page' | 'about-us' | 'add-word' | 'edit-word' | 'view-word';

export const App: React.FC = () => {
  const firestore = useFirestore();

  const [route, setRoute] = React.useState<Route>('main-page');
  const [loadedArticles, setLoadedArticles] = React.useState<Article[]>([]);
  const [isUserAdmin, setUserAdmin] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);

  const {user, signIn, signOut} = useUserControls();
  useAsyncEffect(
    async (isMounted) => {
      if (user) {
        const isAdmin = await database.fetchUserAdmin(firestore, user);
        if (isMounted()) {
          setUserAdmin(isAdmin);
        }
      } else {
        setUserAdmin(false);
      }
    },
    [firestore, user, setUserAdmin]
  );

  const openArticlePage = React.useCallback<(id: string) => void>(
    (id) => {
      setSelectedIndex(
        loadedArticles.findIndex((article) => article.id === id)
      );
      setRoute('view-word');
    },
    [loadedArticles, setSelectedIndex, setRoute]
  );

  const editArticle = React.useCallback(() => {
    setRoute('edit-word');
  }, [setRoute]);

  const onArticleEditDone = React.useCallback(() => {
    setSelectedIndex(-1);
    setRoute('view-word');
  }, [setSelectedIndex, setRoute]);

  const lookupArticle = React.useCallback(
    async (term: string) => {
      setLoadedArticles(
        await database.lookupArticles(firestore, term, isUserAdmin)
      );
    },
    [setLoadedArticles, firestore, isUserAdmin]
  );

  const addArticle = React.useCallback(
    (article: Article) => database.addArticle(firestore, article),
    [firestore]
  );
  const updateArticle = React.useCallback(
    (article: Article) => database.updateArticle(firestore, article),
    [firestore]
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
            routeToView={onArticleEditDone}
            addArticle={addArticle}
            updateArticle={updateArticle}
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
            routeToEdit={editArticle}
            updateArticle={updateArticle}
          />
        );
      default:
        return (
          <MainPage
            articles={loadedArticles}
            lookupArticle={lookupArticle}
            openArticlePage={openArticlePage}
          />
        );
    }
  }, [
    route,
    user,
    selectedArticle,
    onArticleEditDone,
    isUserAdmin,
    editArticle,
    loadedArticles,
    openArticlePage,
    lookupArticle,
    addArticle,
    updateArticle,
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
