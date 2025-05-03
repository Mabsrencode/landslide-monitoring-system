"use client";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { CiEdit } from "react-icons/ci";
import { IoCloseOutline } from "react-icons/io5";
import Image from "next/image";
import SpinnerLoader from "@/components/reusable/SpinnerLoader/SpinnerLoader";
import { toast } from "react-hot-toast";
import { useRef, useState } from "react";

type ProfileFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string | null | File;
};

const ProfileForm = () => {
  type ExtendedUserCredential = UserCredential & {
    firstName?: string;
    lastName?: string;
    profileImage?: string | null;
  };

  const { user, setUser } = useAuthStore() as {
    user: ExtendedUserCredential;
    setUser: (user: ExtendedUserCredential) => void;
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      profileImage: user?.profileImage,
    },
  });
  console.log(user);
  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      let profileImageBase64: string | null = null;
      if (data.profileImage instanceof File) {
        profileImageBase64 = await convertToBase64(data.profileImage);
      } else if (data.profileImage === null) {
        profileImageBase64 = null;
      }

      const response = await fetch("/api/account/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: user?.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          profileImage: profileImageBase64,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setUser({
        ...user,
        firstName: watch("firstName"),
        lastName: watch("lastName"),
        email: watch("email"),
        profileImage: data.profileImage || user?.profileImage,
        emailVerified: data.requiresVerification
          ? false
          : user?.emailVerified ?? false,
      });
      setPreviewImage(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setValue("profileImage", file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setValue("profileImage", null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = (data: ProfileFormValues) => {
    updateProfile(data);
  };

  return (
    <section className="container mx-auto p-4 flex items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 w-full md:w-1/2"
      >
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200 relative">
              {previewImage ? (
                <Image
                  src={previewImage}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              ) : user?.profileImage ? (
                <Image
                  src={user.profileImage}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-500">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 flex gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-primary text-white rounded-full hover:bg-primary/80 transition"
              >
                <CiEdit size={18} />
              </button>
              {(previewImage || user?.profileImage) && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                >
                  <IoCloseOutline size={18} />
                </button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input
              {...register("firstName", { required: "First name is required" })}
              className="w-full px-3 py-2 border rounded"
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.firstName.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input
              {...register("lastName", { required: "Last name is required" })}
              className="w-full px-3 py-2 border rounded"
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            className="w-full px-3 py-2 border rounded"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
          {!user?.emailVerified && (
            <p className="text-yellow-600 text-xs mt-1">
              Email not verified. Check your inbox for verification link.
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary/90 disabled:opacity-70 flex justify-center disabled:cursor-not-allowed"
        >
          {isPending ? <SpinnerLoader /> : "Update Profile"}
        </button>
      </form>
    </section>
  );
};

export default ProfileForm;
