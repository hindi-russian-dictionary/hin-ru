import {
  getFirestore,
  Firestore,
  CollectionReference,
} from 'firebase-admin/firestore';
import {StatusCodes} from 'http-status-codes';

import {Article} from 'client/types/db';
import {getUserAdmin, initializeApp} from 'server/utils/firebase';
import {ServerlessHandler} from 'server/types/serverless';
import {wrapHandler} from 'server/utils/serverless';

const app = initializeApp();

const getArticles = async (
  db: Firestore,
  word: string,
  isUserAdmin: boolean
): Promise<Article[]> => {
  const collectionRef = db.collection(
    'articles'
  ) as CollectionReference<Article>;
  let queryRef = collectionRef.where('word', '==', word);
  if (!isUserAdmin) {
    queryRef = queryRef.where('approved', '==', true);
  }
  const results = await queryRef.get();
  return results.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }));
};

export const methods = ['GET'];

export const handler: ServerlessHandler = wrapHandler(
  methods,
  async (event) => {
    const rawWord = event.params.path;
    if (!rawWord) {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        body: 'Expected to have word after "get" in path',
      };
    }
    const word = decodeURIComponent(rawWord);
    if (word.length < 2) {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        body: 'Expected to have word of length 2 or more',
      };
    }
    if (word.length > 50) {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        body: 'Expected to have word of length 50 or less',
      };
    }

    const firebaseToken = event.headers['X-Firebase-Token'];
    const db = getFirestore(app);
    const isUserAdmin = await getUserAdmin(db, firebaseToken);
    const articles = await getArticles(db, word, isUserAdmin);
    return {
      statusCode: StatusCodes.OK,
      body: JSON.stringify(articles),
    };
  }
);
