import { adminAuth } from "@/lib/firebase/admin";
import {
  auth,
  db,
  doc,
  getDownloadURL,
  getStorage,
  ref,
  sendEmailVerification,
  updateDoc,
  updateEmail,
  updateProfile,
  uploadBytes,
} from "@/lib/firebase/config";
import { errorRes, jsonRes } from "@/utils/auth/authApiResponse";
import { nowISOString } from "@/utils/date";

class UserService {
  private static instance: UserService;
  public static getInstance = () => {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  };

  public updateProfile = async (
    uid: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      profileImage?: string | null;
    }
  ) => {
    try {
      const userRecord = await adminAuth.getUser(uid);
      const storage = getStorage();
      let updates: Record<string, any> = {};
      let authUpdates: Record<string, any> = {};

      if (data.profileImage === null) {
        updates.profileImage = null;
        authUpdates.photoURL = null;
      } else if (
        data.profileImage &&
        data.profileImage.startsWith("data:image")
      ) {
        const base64Data = data.profileImage.split(",")[1];
        const buffer = Buffer.from(base64Data, "base64");
        const storageRef = ref(storage, `profileImages/${uid}`);
        await uploadBytes(storageRef, buffer, {
          contentType:
            data.profileImage.match(/^data:(.*);base64/)?.[1] || "image/jpeg",
        });
        const downloadURL = await getDownloadURL(storageRef);
        updates.profileImage = downloadURL;
        authUpdates.photoURL = downloadURL;
      }

      if (data.firstName || data.lastName) {
        updates.firstName =
          data.firstName || userRecord.displayName?.split(" ")[0];
        updates.lastName =
          data.lastName || userRecord.displayName?.split(" ")[1] || "";
        authUpdates.displayName =
          `${updates.firstName} ${updates.lastName}`.trim();
      }

      let requiresVerification = false;
      if (data.email && data.email !== userRecord.email) {
        updates.email = data.email;
        updates.emailVerified = false;
        requiresVerification = true;

        await adminAuth.updateUser(uid, {
          email: data.email,
          emailVerified: false,
        });

        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
          await updateEmail(firebaseUser, data.email);
          await sendEmailVerification(firebaseUser);
        }
      }

      await updateDoc(doc(db, "users", uid), {
        ...updates,
        updatedAt: nowISOString(),
      });

      if (Object.keys(authUpdates).length > 0) {
        await adminAuth.updateUser(uid, authUpdates);
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
          await updateProfile(firebaseUser, authUpdates);
        }
      }

      return jsonRes({
        success: true,
        message: requiresVerification
          ? "Profile updated! Please verify your new email."
          : "Profile updated successfully!",
        requiresVerification,
        profileImage: updates.profileImage,
      });
    } catch (error) {
      console.error("Updating Profile error:", error);
      return errorRes(error);
    }
  };
}

export default UserService;
