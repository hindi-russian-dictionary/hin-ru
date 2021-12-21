import React from 'react';
import {getAuth, Auth} from '@firebase/auth';

import {
  FirebaseApp,
  FirebaseOptions,
  getApps,
  initializeApp,
} from '@firebase/app';

export const useAuth = (): Auth => {
  const [app] = React.useState<FirebaseApp>(() => {
    const apps = getApps();
    if (apps.length !== 0) {
      return apps[0];
    }
    if (!process.env.FIREBASE_API_KEY) {
      throw new Error('No Firebase config found!');
    }
    const config: FirebaseOptions = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    };
    return initializeApp(config);
  });
  return React.useState(() => getAuth(app))[0];
};
