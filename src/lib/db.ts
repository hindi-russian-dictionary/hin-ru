import firebase from 'firebase/compat';
import {PartOfSpeech} from 'utils/parts-of-speech';

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
  taken_from: string;
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

type User = {
  admin: boolean;
  moderator: boolean;
};

let firestore: firebase.firestore.Firestore;
export const database = {
  init: () => {
    if (!process.env.REACT_APP_FIREBASE_API_KEY) {
      throw new Error('No Firebase config found!');
    }
    const config = {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID,
      measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
    };
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }
    firestore = firebase.firestore();
  },

  addArticle: async (article: Article): Promise<string> => {
    const doc = await firestore.collection('articles').add(article);
    return doc.id;
  },

  updateArticle: async ({
    id,
    ...article
  }: Partial<Article>): Promise<void> => {
    await firestore.collection('articles').doc(id).update(article);
  },

  lookupArticles: async (
    lookup: string,
    isAdmin: boolean
  ): Promise<Article[]> => {
    let collection = (
      firestore.collection(
        'articles'
      ) as firebase.firestore.CollectionReference<Article>
    ).orderBy('word');
    if (!isAdmin) {
      collection = collection.where('approved', '==', true);
    }
    const snapshot = await collection
      .startAt(lookup)
      .endAt(lookup + '\uf8ff')
      .limit(15)
      .get();
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
  },

  fetchUserAdmin: async (user: firebase.User): Promise<boolean> => {
    const collection = firestore.collection(
      'users'
    ) as firebase.firestore.CollectionReference<User>;
    const email = user.email || undefined;
    const doc = await collection.doc(email).get();
    if (doc.exists) {
      return Boolean(doc.data()?.admin);
    } else {
      await collection.doc(email).set({admin: false, moderator: false});
      return false;
    }
  },
};
