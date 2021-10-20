import React from 'react';
import {Link} from 'react-router-dom';

import {useLookupArticles} from 'client/hooks/useLookupArticles';

export const MainPage: React.FC = () => {
  const [term, setTerm] = React.useState('');
  const [fixedTerm, setFixedTerm] = React.useState('');
  const articleGroups = useLookupArticles(fixedTerm);
  const onKeyDown = React.useCallback<React.KeyboardEventHandler>(
    (event) => {
      if (event.key === 'Enter') {
        setFixedTerm(term);
      }
    },
    [setFixedTerm, term]
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
          {articleGroups.map((articleGroup) => (
            <Link
              key={articleGroup.map((article) => article.id).join(',')}
              type="button"
              className="list-group-item list-group-item-action"
              to={`/article/${articleGroup[0].word}`}
            >
              {articleGroup[0].word}
              {articleGroup.map((article) => (
                <>
                  &nbsp; &nbsp; &nbsp;
                  <span
                    className={
                      'badge ' +
                      (article.approved
                        ? 'bg-success'
                        : 'text-white bg-secondary')
                    }
                  >
                    {article.approved ? 'одобрено' : 'черновик'}
                  </span>
                </>
              ))}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
