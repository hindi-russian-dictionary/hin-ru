import {getFirestore} from 'firebase-admin/firestore';
import {StatusCodes} from 'http-status-codes';

import {getUserAdmin, initializeApp} from 'server/utils/firebase';
import {ServerlessHandler} from 'server/types/serverless';
import {wrapHandler} from 'server/utils/serverless';

const app = initializeApp();

export const methods = ['GET'];

export const handler: ServerlessHandler = wrapHandler(
  methods,
  async (event) => {
    const firebaseToken = event.headers['X-Firebase-Token'];
    const db = getFirestore(app);
    const isUserAdmin = await getUserAdmin(db, firebaseToken);
    return {
      statusCode: StatusCodes.OK,
      body: JSON.stringify({isAdmin: isUserAdmin}),
    };
  }
);
