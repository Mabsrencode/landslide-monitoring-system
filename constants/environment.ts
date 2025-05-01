const environment = {
  recaptchaSiteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string,
  firebaseConfig: {
    apiKey: process.env.FIREBASE_API_KEY as string,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN as string,
    projectId: process.env.FIREBASE_PROJECT_ID as string,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET as string,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID as string,
    appId: process.env.FIREBASE_APP_ID as string,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID as string,
    adminClientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL as string,
    adminPrivateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
    firebaseService: process.env.FIREBASE_SERVICE,
  },
  public: {
    firebase: {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
    },
  },
};
export default environment;
