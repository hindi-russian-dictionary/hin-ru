import {
  initializeApp as initializeFirebaseApp,
  cert,
  getApps,
  App,
} from 'firebase-admin/app';
import {getAuth, UserRecord, DecodedIdToken} from 'firebase-admin/auth';
import {Firestore, CollectionReference} from 'firebase-admin/firestore';
import {StatusCodes} from 'http-status-codes';

// Generate service account here
// https://console.firebase.google.com/project/hin-ru/settings/serviceaccounts/adminsdk
import serviceAccount from '../../.firebase-credentials.json';
import {User} from 'client/types/db';
import {ServerlessResponseError} from 'server/utils/serverless';

export const initializeApp = () => {
  let app: App = getApps()[0];
  if (!app) {
    app = initializeFirebaseApp({
      credential: cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key,
      }),
    });
  }
  return app;
};

export const getUserAdmin = async (
  db: Firestore,
  token?: string
): Promise<boolean> => {
  const userEmail = await getUserEmail(token);
  if (!userEmail) {
    return false;
  }
  return getUserAdminByEmail(db, userEmail);
};

export const getUserAdminByEmail = async (
  db: Firestore,
  email: string
): Promise<boolean> => {
  const usersRef = db.collection('users') as CollectionReference<User>;
  const docRef = usersRef.doc(email);
  const result = await docRef.get();
  const data = result.data();
  if (data) {
    return Boolean(data.admin);
  }
  await docRef.update({admin: false, moderator: false});
  return false;
};

export const getUserEmail = async (
  idToken?: string
): Promise<string | undefined> => {
  if (!idToken) {
    return;
  }
  let token: DecodedIdToken;
  try {
    token = await getAuth().verifyIdToken(idToken);
  } catch (e) {
    throw new ServerlessResponseError({
      statusCode: StatusCodes.UNAUTHORIZED,
      body: '"X-Firebase-Token" is not valid',
    });
  }
  let user: UserRecord;
  try {
    user = await getAuth().getUser(token.uid);
  } catch (e) {
    throw new ServerlessResponseError({
      statusCode: StatusCodes.UNAUTHORIZED,
      body: `User uid "${token.uid}" not found`,
    });
  }

  if (!user.email) {
    throw new ServerlessResponseError({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      body: `User with uid "${token.uid}" has no email`,
    });
  }
  return user.email;
};
