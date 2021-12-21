export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'compound_verb'
  | 'adjective'
  | 'adverb'
  | 'pronoun'
  | 'conjunction'
  | 'interjection'
  | 'postposition'
  | 'particle'
  | 'numeral';

export type Article = {
  id: string;
  word: string;
  transliteration: string;
  spellings: string[];
  part_of_speech: PartOfSpeech;
  meanings: {
    meaning: string;
    examples: string;
  }[];
  properties: Record<string, Record<string, boolean>>;
  taken_from?: string;
  control: {
    rus: string;
    hin: string;
  };
  stable_phrases: {
    rus: string;
    hin: string;
  };
  examples: {
    rus: string;
    hin: string;
  };
  status: 'draft';
  author?: string;
  approved?: boolean;
};

export type User = {
  admin: boolean;
  moderator: boolean;
};

export type PartialArticle = Partial<Omit<Article, 'id'>> & {id: string};
export type NewArticle = Omit<Article, 'id'>;
