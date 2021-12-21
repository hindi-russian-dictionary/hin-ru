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
  term: string,
  isUserAdmin: boolean
): Promise<Article[]> => {
  const articlesRef = db.collection('articles') as CollectionReference<Article>;
  let queryReference = articlesRef.orderBy('word');
  if (!isUserAdmin) {
    queryReference = queryReference.where('approved', '==', true);
  }
  queryReference = queryReference
    .startAt(term)
    .endAt(term + '\uf8ff')
    .limit(15);
  const results = await queryReference.get();
  return results.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }));
};

export const methods = ['GET'];

export const handler: ServerlessHandler = wrapHandler(
  methods,
  async (event) => {
    const rawTerm = event.queryStringParameters.term;
    if (!rawTerm) {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        body: 'Expected to have "term" in query',
      };
    }
    const term = decodeURIComponent(rawTerm);
    if (term.length < 2) {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        body: 'Expected to have "term" of length 2 or more',
      };
    }
    if (term.length > 50) {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        body: 'Expected to have "term" of length 50 or less',
      };
    }

    const firebaseToken = event.headers['X-Firebase-Token'];
    const db = getFirestore(app);
    const isUserAdmin = await getUserAdmin(db, firebaseToken);
    const articles = await getArticles(db, term, isUserAdmin);
    return {
      statusCode: StatusCodes.OK,
      body: JSON.stringify(articles),
    };
  }
);
