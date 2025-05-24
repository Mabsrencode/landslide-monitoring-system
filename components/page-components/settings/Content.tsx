"use client";
import Modal from "@/components/reusable/Modal/Modal";
import SpinnerLoader from "@/components/reusable/SpinnerLoader/SpinnerLoader";
import { useAuthStore } from "@/stores/authStore";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

const Content = () => {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState("");
  const {
    mutate: deleteMutation,
    isPending: isDeleting,
    error,
  } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/account/delete?userId=${user?.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      toast.success("Account deleted successfully");
      logOutMutation.mutate();
    },
  });
  const handleLogOut = async () => {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: user?.email }),
    });
    if (!response.ok) {
      throw new Error("Logout failed");
    }
    const result = await response.json();
    return result;
  };
  const logOutMutation = useMutation({
    mutationFn: handleLogOut,
    onSuccess: () => {
      setUser(null);
      router.push("/auth/login");
    },
    onError: (error) => {
      toast.error(`Logout error: ${(error as Error).message}`);
    },
  });
  if (!user) return <SpinnerLoader variant="big" />;
  return (
    <>
      {showDeleteModal && (
        <Modal
          isLoading={isDeleting}
          title="Delete Account"
          description="Are you sure you want to delete your account? This action cannot be undone."
          show={showDeleteModal}
          setShow={setShowDeleteModal}
          onClick={deleteMutation}
        />
      )}
      <section className="container mx-auto p-4 w-full h-full">
        <h2 className="text-4xl manrope font-semibold">Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-12">
          <div className="border border-black/10 p-2 rounded bg-gray-200 text-left">
            <h2 className="text-xl md:text-2xl manrope font-semibold">
              Account Details
            </h2>
            <p className="text-gray-700 text-sm">
              Manage your profile info, and use the same info across the system.
            </p>
            <span className="mt-6 flex flex-col lg:flex-row gap-4">
              <Link
                href={"/settings/account-details/personal-information"}
                className="button w-full text-center text-white text-nowrap text-sm md:text-base"
              >
                Personal Information
              </Link>
              <Link
                href={"/settings/account-details/security"}
                className="button w-full text-center text-white text-nowrap text-sm md:text-base"
              >
                Password & Security
              </Link>
            </span>
          </div>
          <div className="border border-black/10 p-2 rounded bg-gray-200">
            <h2 className="text-xl md:text-2xl manrope font-semibold">
              Notifications
            </h2>
            <p className="text-gray-700 text-sm">
              Stay informed with real-time alerts on ground movement, rainfall
              thresholds, and early warning signs to help prevent disasters.
            </p>
            <span className="mt-6 flex flex-wrap gap-4">
              <Link
                href={"/settings/notifications"}
                className="button w-full text-center text-white text-nowrap text-sm md:text-base"
              >
                Manage Notification
              </Link>
            </span>
          </div>
          <div className="border border-black/10 p-2 rounded bg-gray-200">
            <h2 className="text-xl md:text-2xl manrope font-semibold">
              Account Settings
            </h2>
            <span className="mt-6 flex flex-wrap gap-4">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="button w-full text-center text-white text-nowrap text-sm md:text-base bg-red-500 hover:bg-red-600"
              >
                Delete Account
              </button>
            </span>
          </div>
        </div>
      </section>
    </>
  );
};

export default Content;
