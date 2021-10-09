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

function getPartsOfSpeech(): Record<PartOfSpeech, string> {
  return {
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
}

type PartOfSpeechValue = {
  name: string;
  readableName: string;
};

type PartOfSpeechProperties = {
  name: string;
  readableName: string;
  values: PartOfSpeechValue[];
};

function getPropertiesForPartOfSpeech(partOfSpeech: PartOfSpeech) {
  let propertiesByPartOfSpeech: Record<PartOfSpeech, PartOfSpeechProperties[]> =
    {
      noun: [
        {
          name: 'gender',
          readableName: 'Род',
          values: [
            {name: 'm', readableName: 'мужской'},
            {name: 'f', readableName: 'женский'},
          ],
        },
      ],
      verb: [
        {
          name: 'transitivity',
          readableName: 'Переходность',
          values: [
            {name: 'transitive', readableName: 'переходный'},
            {name: 'non_transitive', readableName: 'непереходный'},
          ],
        },
      ],
      compound_verb: [
        {
          name: 'transitivity',
          readableName: 'Переходность',
          values: [
            {name: 'transitive', readableName: 'переходный'},
            {name: 'non_transitive', readableName: 'непереходный'},
          ],
        },
        {
          name: 'compound_of',
          readableName: 'Состоит из',
          values: [
            {
              name: 'noun_and_verb',
              readableName: 'существительного и глагола',
            },
            {
              name: 'adjective_and_verb',
              readableName: 'прилагательного и глагола',
            },
            {
              name: 'participle_and_verb',
              readableName: 'причастия и глагола',
            },
          ],
        },
      ],
      adjective: [
        {
          name: 'mutability',
          readableName: 'Изменяемость',
          values: [
            {name: 'mutable', readableName: 'изменяемое'},
            {name: 'immutable', readableName: 'неизменяемое'},
          ],
        },
      ],
      adverb: [],
      pronoun: [
        {
          name: 'order',
          readableName: 'Разряд',
          values: [
            {name: 'personal', readableName: 'личное'},
            {name: 'demonstrative', readableName: 'указательное'},
            {name: 'relative', readableName: 'относительное'},
            {name: 'indefinite', readableName: 'неопределенное'},
            {name: 'interrogative', readableName: 'вопросительное'},
          ],
        },
        {
          name: 'gender',
          readableName: 'Род',
          values: [
            {name: 'm', readableName: 'мужской'},
            {name: 'f', readableName: 'женский'},
          ],
        },
      ],
      conjunction: [],
      interjection: [],
      postposition: [],
      particle: [],
      numeral: [
        {
          name: 'type',
          readableName: 'Тип',
          values: [
            {name: 'quantitative', readableName: 'количественное'},
            {name: 'ordinal', readableName: 'порядковое'},
            {name: 'collective', readableName: 'собирательное'},
          ],
        },
      ],
    };
  return propertiesByPartOfSpeech[partOfSpeech];
}

export {getPartsOfSpeech, getPropertiesForPartOfSpeech};
