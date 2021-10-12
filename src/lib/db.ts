import {initializeApp} from '@firebase/app';
import {User as FirebaseUser} from '@firebase/auth';
import {
  addDoc,
  collection,
  CollectionReference,
  doc,
  endAt,
  Firestore,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  QueryConstraint,
  startAt,
  UpdateData,
  updateDoc,
  where,
} from '@firebase/firestore';
import {PartOfSpeech} from 'utils/parts-of-speech';
import {FirebaseOptions} from '@firebase/app';

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

let firestoreInstance: Firestore;
export const database = {
  init: () => {
    if (!process.env.REACT_APP_FIREBASE_API_KEY) {
      throw new Error('No Firebase config found!');
    }
    const config: FirebaseOptions = {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID,
      measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
    };
    initializeApp(config);
    firestoreInstance = getFirestore();
  },

  addArticle: async (article: Article): Promise<string> => {
    const collectionReference = (await collection(
      firestoreInstance,
      'articles'
    )) as CollectionReference<Article>;
    const docReference = await addDoc(collectionReference, article);
    return docReference.id;
  },

  updateArticle: async ({
    id,
    ...article
  }: Partial<Article>): Promise<void> => {
    const collectionReference = (await collection(
      firestoreInstance,
      'articles'
    )) as CollectionReference<Article>;
    const docReference = await doc(collectionReference, id);
    await updateDoc(docReference, article as UpdateData<Article>);
  },

  lookupArticles: async (
    lookup: string,
    isAdmin: boolean
  ): Promise<Article[]> => {
    const collectionReference = (await collection(
      firestoreInstance,
      'articles'
    )) as CollectionReference<Article>;
    const constraints = [
      orderBy('word'),
      isAdmin ? null : where('approved', '==', true),
      startAt(lookup),
      endAt(lookup + '\uf8ff'),
      limit(15),
    ].filter((x): x is QueryConstraint => Boolean(x));
    const queryReference = query(collectionReference, ...constraints);
    const docsSnapshots = await getDocs(queryReference);
    return docsSnapshots.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
  },

  fetchUserAdmin: async (user: FirebaseUser): Promise<boolean> => {
    const collectionReference = (await collection(
      firestoreInstance,
      'users'
    )) as CollectionReference<User>;
    const email = user.email || undefined;
    const docReference = await doc(collectionReference, email);
    const docData = await getDoc(docReference);
    if (docData.exists()) {
      return Boolean(docData.data().admin);
    } else {
      await updateDoc(docReference, {admin: false, moderator: false});
      return false;
    }
  },
};
