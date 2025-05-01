import environment from "@/constants/environment";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const firebaseAdminConfig = {
  credential: cert({
    projectId: environment.public.firebase.projectId,
    clientEmail: environment.firebaseConfig.adminClientEmail,
    privateKey: environment.firebaseConfig.adminPrivateKey
      ?.replace(/\\n/g, "\n")
      .trim(),
  }),
};

const adminApp = getApps()[0] ?? initializeApp(firebaseAdminConfig);
const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);

export { adminAuth, adminDb };
