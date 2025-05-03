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
