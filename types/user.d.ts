type ExtendedUserCredential = UserCredential & {
  firstName?: string;
  lastName?: string;
  profileImage?: string | null;
};

type ProfileFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string | null | File;
};

type UserData = {
  contactNumber: string;
  createdAt: string;
  disabled: boolean;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  role: "user" | "admin";
  status: "active" | "inactive" | "pending_verification";
  uid: string;
  updatedAt: string;
  username: string;
};

type UserListResponse = {
  message: string;
  data: UserData[] | null;
};
