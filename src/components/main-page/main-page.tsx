import React from 'react';

import {Article} from 'lib/db';

type Props = {
  articles: Article[];
  lookupArticle: (term: string) => void;
  openArticlePage: (id: string) => void;
};

export const MainPage: React.FC<Props> = (props) => {
  const [term, setTerm] = React.useState('');
  const onKeyDown = React.useCallback<React.KeyboardEventHandler>(
    (event) => {
      if (event.key === 'Enter') {
        props.lookupArticle(term);
      }
    },
    [props.lookupArticle, term]
  );

  return (
    <div className="row my-4">
      <div className="col-12">
        <div className="input-group mb-3">
          <div className="input-group-prepend" style={{width: '100%'}}>
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
                onChange={(event) => setTerm(event.currentTarget.value)}
                onKeyDown={onKeyDown}
              />
            </span>
          </div>
        </div>
      </div>
      <div className="col-12">
        <div className="list-group">
          {props.articles.map((article) => (
            <button
              key={article.id}
              type="button"
              className="list-group-item list-group-item-action"
              onClick={() => props.openArticlePage(article.id)}
            >
              {article.word}
              &nbsp; &nbsp; &nbsp;
              <span
                className={
                  'badge ' +
                  (article.approved ? 'bg-success' : 'text-white bg-secondary')
                }
              >
                {article.approved ? 'одобрено' : 'черновик'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
