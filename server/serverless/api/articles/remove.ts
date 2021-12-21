import {
  getFirestore,
  Firestore,
  CollectionReference,
} from 'firebase-admin/firestore';
import {StatusCodes} from 'http-status-codes';

import {Article} from 'client/types/db';
import {getUserAdmin, initializeApp} from 'server/utils/firebase';
import {ServerlessHandler} from 'server/types/serverless';
import {ServerlessResponseError, wrapHandler} from 'server/utils/serverless';

const app = initializeApp();

const removeArticle = async (db: Firestore, id: string): Promise<void> => {
  const collectionRef = db.collection(
    'articles'
  ) as CollectionReference<Article>;
  const docRef = collectionRef.doc(id);
  if (!(await docRef.get()).exists) {
    throw new ServerlessResponseError({
      statusCode: 410,
      body: `There is no article with id "${id}"`,
    });
  }
  await docRef.delete();
};

export const methods = ['DELETE'];

export const handler: ServerlessHandler = wrapHandler(
  methods,
  async (event) => {
    const id = event.params.path;
    if (!id) {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        body: 'Expected to have id after "remove" in path',
      };
    }

    const firebaseToken = event.headers['X-Firebase-Token'];
    const db = getFirestore(app);
    const isUserAdmin = await getUserAdmin(db, firebaseToken);
    if (!isUserAdmin) {
      return {
        statusCode: StatusCodes.UNAUTHORIZED,
        body: 'Expected to be an administrator to remove an article',
      };
    }
    const articles = await removeArticle(db, id);
    return {
      statusCode: StatusCodes.OK,
      body: JSON.stringify(articles),
    };
  }
);
