import React from 'react';
import {Link, useSearchParams} from 'react-router-dom';

import {useLookupArticles} from 'client/hooks/articles/use-lookup-articles';
import {PARTS_OF_SPEECH} from 'client/utils/parts-of-speech';
import {useSyncSearchQuery} from 'client/hooks/use-sync-search-query';

export const MainPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [term, setTerm] = React.useState(searchParams.get('query') || '');
  const [fixedTerm, setFixedTerm] = React.useState(term);
  useSyncSearchQuery(fixedTerm);
  const lookupArticlesQuery = useLookupArticles(fixedTerm);
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
                value={term}
                onChange={(event) => setTerm(event.currentTarget.value)}
                onKeyDown={onKeyDown}
              />
            </span>
            {lookupArticlesQuery.isLoading ? <div>...</div> : null}
          </div>
        </div>
      </div>
      {lookupArticlesQuery.error ? (
        <div>
          <div>Ошибка</div>
          <div>{String(lookupArticlesQuery.error)}</div>
        </div>
      ) : null}
      <div className="col-12">
        <div className="list-group">
          {lookupArticlesQuery.data && lookupArticlesQuery.data.length === 0 ? (
            <div>{`По запросу ${fixedTerm} ничего не найдено :(`}</div>
          ) : null}
          {(lookupArticlesQuery.data ?? []).map((articleGroup) => (
            <Link
              key={articleGroup.map((article) => article.id).join(',')}
              type="button"
              className="list-group-item list-group-item-action word-description"
              to={`/article/${articleGroup[0].word}`}
            >
              <div className="word">{articleGroup[0].word}</div>
              <div>
                {articleGroup.map((article) => (
                  <div key={article.id} className="word-element">
                    &nbsp; &nbsp; &nbsp;
                    {articleGroup.length > 1 ? (
                      <span className="word-pos">
                        {PARTS_OF_SPEECH[article.part_of_speech]}
                      </span>
                    ) : null}
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
                  </div>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
