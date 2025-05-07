"use client";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { CiEdit } from "react-icons/ci";
import { IoCloseOutline } from "react-icons/io5";
import Image from "next/image";
import SpinnerLoader from "@/components/reusable/SpinnerLoader/SpinnerLoader";
import { toast } from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import MainLoader from "@/components/reusable/MainLoader/MainLoader";
import OthersLink from "../OthersLink/OthersLink";
import BackRoute from "@/components/reusable/BackRoute/BackRoute";
const Content = () => {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore() as {
    user: ExtendedUserCredential;
    setUser: (user: ExtendedUserCredential) => void;
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      profileImage: user?.profileImage || "",
    },
  });
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        profileImage: user?.profileImage || "",
      });
    }
  }, [user, reset]);

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
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
          profileImage: previewImage ? previewImage : user?.profileImage,
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
        emailVerified: data.requiresVerification ? false : user?.emailVerified,
      });
      setIsEditing(false);
      setPreviewImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      queryClient.invalidateQueries({ queryKey: ["user"] });
      reset(undefined, { keepValues: true });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.match("image.*")) {
        reject(new Error("Only image files are allowed"));
        return;
      }

      if (file.size > 500 * 1024) {
        reject(new Error("Image must be smaller than 500KB"));
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      try {
        const file = e.target.files[0];
        const base64 = await convertToBase64(file);
        setPreviewImage(base64);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = (data: ProfileFormValues) => {
    updateProfile({
      ...data,
      profileImage: previewImage !== user?.profileImage ? previewImage : null,
    });
  };
  if (!user) return <MainLoader />;

  return (
    <section className="container mx-auto p-4 flex flex-col">
      <BackRoute />
      <div className="flex flex-col md:flex-row gap-4 w-full">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex-1 md:w-1/2 mx-auto space-y-6 bg-slate-100 rounded p-4 border border-black/10"
        >
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-primary border-2 border-secondary overflow-hidden relative">
                {previewImage ? (
                  <Image
                    src={previewImage}
                    alt="Profile preview"
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                ) : user?.profileImage ? (
                  <Image
                    src={user.profileImage}
                    alt="Profile"
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-500">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 flex gap-1">
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-gray-200 text-black rounded-full hover:bg-gray-300 transition"
                    title="Change photo"
                  >
                    <CiEdit size={18} />
                  </button>
                )}
                {previewImage && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                    title="Remove photo"
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
                disabled={!isEditing}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">JPG, PNG (Max 500KB)</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="manrope font-semibold text-sm mb-1">
                First Name
              </label>
              <input
                disabled={!isEditing}
                {...register("firstName", {
                  required: "First name is required",
                })}
                className="w-full border disabled:cursor-not-allowed border-black/20 outline-none p-2  font-normal mt-2 bg-white"
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <label className="manrope font-semibold text-sm mb-1">
                Last Name
              </label>
              <input
                disabled={!isEditing}
                {...register("lastName", { required: "Last name is required" })}
                className="w-full border disabled:cursor-not-allowed border-black/20 outline-none p-2  font-normal mt-2 bg-white"
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <label className="manrope font-semibold text-sm mb-1">Email</label>
            <input
              disabled={!isEditing}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              className="w-full border disabled:cursor-not-allowed border-black/20 outline-none p-2  font-normal mt-2 bg-white"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
            {!user?.emailVerified && (
              <p className="text-yellow-600 text-xs mt-1">
                Email not verified. Check your inbox for verification link.
              </p>
            )}
          </div>
          <div>
            {isEditing ? (
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-green-500 hover:cursor-pointer text-white py-2 px-4 hover:bg-green-500/70 transition disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isPending ? (
                  <>
                    <SpinnerLoader />
                    Updating...
                  </>
                ) : (
                  "Update Profile"
                )}
              </button>
            ) : (
              <div
                onClick={() => setIsEditing(!isEditing)}
                className="button text-white text-center"
              >
                Edit Profile
              </div>
            )}
            {isEditing && (
              <div
                onClick={() => setIsEditing(!isEditing)}
                className="w-full text-center bg-red-500  mt-2 hover:cursor-pointer text-white py-2 px-4 hover:bg-red-500   /70 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Cancel
              </div>
            )}
          </div>
        </form>
        <OthersLink />
      </div>
    </section>
  );
};

export default Content;
