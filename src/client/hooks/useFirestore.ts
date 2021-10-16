import React from 'react';
import {getFirestore} from '@firebase/firestore';

import {useFirebaseApp} from 'client/hooks/useFirebaseApp';

export const useFirestore = () => {
  const app = useFirebaseApp();
  const [firestore] = React.useState(() => getFirestore(app));
  return firestore;
};
