import {
  getFirestore,
  Firestore,
  CollectionReference,
} from 'firebase-admin/firestore';
import {StatusCodes} from 'http-status-codes';

import {Article, PartialArticle} from 'client/types/db';
import {getUserEmail, initializeApp} from 'server/utils/firebase';
import {ServerlessHandler} from 'server/types/serverless';
import {wrapHandler} from 'server/utils/serverless';

const app = initializeApp();

const updateArticle = async (
  db: Firestore,
  article: PartialArticle,
  userEmail: string
): Promise<void> => {
  const collectionRef = db.collection(
    'articles'
  ) as CollectionReference<Article>;
  const docRef = collectionRef.doc(article.id);
  await docRef.update({...article, author: userEmail});
};

export const methods = ['POST'];

export const handler: ServerlessHandler = wrapHandler(
  methods,
  async (event) => {
    const body = event.body as PartialArticle;
    if (typeof body !== 'object') {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        body: 'Expected to have body',
      };
    }
    if (!body.id) {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        body: 'Expected article to have id',
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
    const articles = await updateArticle(db, body, userEmail);
    return {
      statusCode: StatusCodes.OK,
      body: JSON.stringify(articles),
    };
  }
);
