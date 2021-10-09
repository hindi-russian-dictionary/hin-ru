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

type PartOfSpeechPropertyValue = {
  key: string;
  name: string;
};

type PartOfSpeechProperty = {
  key: string;
  name: string;
  values: PartOfSpeechPropertyValue[];
};

export const PARTS_OF_SPEECH = {
  noun: 'существительное',
  verb: 'глагол',
  compound_verb: 'составной глагол',
  adjective: 'прилагательное',
  adverb: 'наречие',
  pronoun: 'местоимение',
  conjunction: 'союз',
  interjection: 'междометие',
  postposition: 'послелог',
  particle: 'частица',
  numeral: 'числительное',
};

export const PARTS_OF_SPEECH_PROPERTIES: Partial<Record<PartOfSpeech, PartOfSpeechProperty[]>> = {
    noun: [
      {
        key: 'gender',
        name: 'Род',
        values: [
          {key: 'm', name: 'мужской'},
          {key: 'f', name: 'женский'},
        ],
      },
    ],
    verb: [
      {
        key: 'transitivity',
        name: 'Переходность',
        values: [
          {key: 'transitive', name: 'переходный'},
          {key: 'non_transitive', name: 'непереходный'},
        ],
      },
    ],
    compound_verb: [
      {
        key: 'transitivity',
        name: 'Переходность',
        values: [
          {key: 'transitive', name: 'переходный'},
          {key: 'non_transitive', name: 'непереходный'},
        ],
      },
      {
        key: 'compound_of',
        name: 'Состоит из',
        values: [
          {
            key: 'noun_and_verb',
            name: 'существительного и глагола',
          },
          {
            key: 'adjective_and_verb',
            name: 'прилагательного и глагола',
          },
          {
            key: 'participle_and_verb',
            name: 'причастия и глагола',
          },
        ],
      },
    ],
    adjective: [
      {
        key: 'mutability',
        name: 'Изменяемость',
        values: [
          {key: 'mutable', name: 'изменяемое'},
          {key: 'immutable', name: 'неизменяемое'},
        ],
      },
    ],
    pronoun: [
      {
        key: 'order',
        name: 'Разряд',
        values: [
          {key: 'personal', name: 'личное'},
          {key: 'demonstrative', name: 'указательное'},
          {key: 'relative', name: 'относительное'},
          {key: 'indefinite', name: 'неопределенное'},
          {key: 'interrogative', name: 'вопросительное'},
        ],
      },
      {
        key: 'gender',
        name: 'Род',
        values: [
          {key: 'm', name: 'мужской'},
          {key: 'f', name: 'женский'},
        ],
      },
    ],
    numeral: [
      {
        key: 'type',
        name: 'Тип',
        values: [
          {key: 'quantitative', name: 'количественное'},
          {key: 'ordinal', name: 'порядковое'},
          {key: 'collective', name: 'собирательное'},
        ],
      },
    ],
  };