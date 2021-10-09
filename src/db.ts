import firebase from "firebase/compat";
import { PartOfSpeech } from "utils";

export type Article = {
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
  status: "draft";
  author?: string;
  approved?: boolean;
};

type User = {
  admin: boolean;
  moderator: boolean;
};

class Database {
  constructor() {
    if (process.env.REACT_APP_FIREBASE_API_KEY) {
      const config = {
        apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
        authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
        databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
        projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
        storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.REACT_APP_FIREBASE_APP_ID,
        measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
      };
      if (!firebase.apps.length) {
        firebase.initializeApp(config);
      }
    } else {
      console.log("No Firebase config found!");
    }
  }

  async saveWord(word: Article): Promise<void> {
    const db = firebase.firestore();
    await db.collection("articles").add(word);
  }

  async updateWord(word_id: string, word: Partial<Article>): Promise<void> {
    const db = firebase.firestore();
    await db.collection("articles").doc(word_id).update(word);
  }

  async searchWords(
    lookup: string,
    isAdmin: boolean
  ): Promise<firebase.firestore.Query<Article>> {
    const db = firebase.firestore();
    let collection = (
      db.collection(
        "articles"
      ) as firebase.firestore.CollectionReference<Article>
    ).orderBy("word");
    if (!isAdmin) {
      collection = collection.where("approved", "==", true);
    }
    return collection
      .startAt(lookup)
      .endAt(lookup + "\uf8ff")
      .limit(15);
  }

  async fetchUserAdmin(
    user: firebase.User,
    setAdminCallback: (isAdmin: boolean) => void
  ): Promise<void> {
    const db = firebase.firestore();
    db.collection("users")
      .doc(user.email || undefined)
      .get()
      .then(function (doc) {
        if (doc.exists) {
          setAdminCallback((doc.data() as User).admin);
        } else {
          db.collection("users")
            .doc(user.email || undefined)
            .set({
              admin: false,
              moderator: false,
            })
            .then(() => setAdminCallback(false));
        }
      });
  }
}

export default Database;
