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
  limit,
  orderBy,
  query,
  QueryConstraint,
  startAt,
  UpdateData,
  updateDoc,
  where,
} from '@firebase/firestore';
import {PartOfSpeech} from 'client/utils/parts-of-speech';

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

export const database = {
  addArticle: async (
    firestore: Firestore,
    article: Omit<Article, 'id'>
  ): Promise<string> => {
    const collectionReference = (await collection(
      firestore,
      'articles'
    )) as CollectionReference<Article>;
    const docReference = await addDoc(collectionReference, article);
    return docReference.id;
  },

  updateArticle: async (
    firestore: Firestore,
    {id, ...article}: Partial<Article>
  ): Promise<void> => {
    const collectionReference = (await collection(
      firestore,
      'articles'
    )) as CollectionReference<Article>;
    const docReference = await doc(collectionReference, id);
    await updateDoc(docReference, article as UpdateData<Article>);
  },

  getArticle: async (
    firestore: Firestore,
    word: string
  ): Promise<Article | undefined> => {
    const collectionReference = (await collection(
      firestore,
      'articles'
    )) as CollectionReference<Article>;
    const queryReference = await query(
      collectionReference,
      where('word', '==', word)
    );
    const docsSnapshots = await getDocs(queryReference);
    return docsSnapshots.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }))[0];
  },

  lookupArticles: async (
    firestore: Firestore,
    lookup: string,
    isAdmin: boolean
  ): Promise<Article[]> => {
    const collectionReference = (await collection(
      firestore,
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

  fetchUserAdmin: async (
    firestore: Firestore,
    user: FirebaseUser
  ): Promise<boolean> => {
    const collectionReference = (await collection(
      firestore,
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
