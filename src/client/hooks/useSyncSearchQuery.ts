import {useEffect} from 'react';
import {useSearchParams} from 'react-router-dom';

export const useSyncSearchQuery = (query: string | undefined): void => {
  const [, setSearchParams] = useSearchParams(query ? {query} : []);

  useEffect(() => {
    setSearchParams(query ? {query} : []);
  }, [query]);
};
