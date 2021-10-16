import {useNavigate} from 'react-router-dom';
import React from 'react';

export const useOpenArticlePage = () => {
  const navigate = useNavigate();
  return React.useCallback(
    (word: string) => navigate(`/article/${word}`),
    [navigate]
  );
};
