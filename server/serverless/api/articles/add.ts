import {
  getFirestore,
  Firestore,
  CollectionReference,
} from 'firebase-admin/firestore';
import {StatusCodes} from 'http-status-codes';

import {NewArticle} from 'client/types/db';
import {getUserEmail, initializeApp} from 'server/utils/firebase';
import {ServerlessHandler} from 'server/types/serverless';
import {wrapHandler} from 'server/utils/serverless';

const app = initializeApp();

const addArticle = async (
  db: Firestore,
  article: NewArticle,
  userEmail: string
): Promise<string> => {
  const collectionRef = db.collection(
    'articles'
  ) as CollectionReference<NewArticle>;
  const docRef = await collectionRef.add({...article, author: userEmail});
  return docRef.id;
};

export const methods = ['POST'];

export const handler: ServerlessHandler = wrapHandler(
  methods,
  async (event) => {
    const body = event.body as NewArticle;
    console.log('body', event.body);
    if (typeof body !== 'object') {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        body: 'Expected to have body',
      };
    }
    // TODO: verify body

    const firebaseToken = event.headers['X-Firebase-Token'];
    const db = getFirestore(app);
    const userEmail = await getUserEmail(firebaseToken);
    if (!userEmail) {
      return {
        statusCode: StatusCodes.UNAUTHORIZED,
        body: 'Expected to have authorization to add an article',
      };
    }
    const articles = await addArticle(db, body, userEmail);
    return {
      statusCode: StatusCodes.OK,
      body: JSON.stringify(articles),
    };
  }
);
