import React from 'react';
import {Link, Route, Routes} from 'react-router-dom';

import {MainPage} from 'components/main-page/main-page';
import {WordAddForm} from 'components/word-add-form/word-add-form';
import {WordPage} from 'components/word-page/word-page';
import {AboutUsPage} from 'components/about-us-page/about-us-page';

import {useUserControls} from 'hooks/useUserControls';

import './app.css';

export const App: React.FC = () => {
  const {user, signIn, signOut} = useUserControls();

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <ul className="navbar-nav mr-auto">
          <li className="nav-item">
            <Link className="btn nav-link" to="/">
              Главная
            </Link>
          </li>
          <li className="nav-item">
            <Link className="btn nav-link" to="/add">
              Предложить свое слово
            </Link>
          </li>
          <li className="nav-item">
            <Link className="btn nav-link" to="/about">
              О нас
            </Link>
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
      <div className="container">
        <Routes>
          <Route path="/add" element={<WordAddForm />} />
          <Route path="/article/:word/">
            <Route index element={<WordPage />} />
            <Route path="edit" element={<WordAddForm />} />
          </Route>
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="*" element={<MainPage />} />
        </Routes>
      </div>
    </>
  );
};