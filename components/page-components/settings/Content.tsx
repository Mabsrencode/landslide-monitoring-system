import Link from "next/link";
import React from "react";

const Content = () => {
  return (
    <section className="container mx-auto p-4 w-full h-full">
      <h2 className="text-4xl manrope font-semibold">Settings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-12">
        <div className="border border-black/10 p-2 rounded bg-gray-200 text-left">
          <h2 className="text-2xl manrope font-semibold">Account Details</h2>
          <p className="text-gray-700">
            Manage your profile info, and use the same info across the system.
          </p>
          <span className="mt-6 flex flex-wrap gap-4">
            <Link
              href={"/settings/account-details/personal-info"}
              className="flex-1 text-center bg-primary p-2 rounded text-white font-medium"
            >
              Personal Information
            </Link>
            <Link
              href={"/settings/account-details/security"}
              className="flex-1 text-center bg-primary p-2 rounded text-white font-medium"
            >
              Password & Security
            </Link>
          </span>
        </div>
        <div className="border border-black/10 p-2 rounded bg-gray-200">
          <h2 className="text-2xl manrope font-semibold">Notifications</h2>
          <p className="text-gray-700">
            Stay informed with real-time alerts on ground movement, rainfall
            thresholds, and early warning signs to help prevent disasters.
          </p>
          <span className="mt-6 flex flex-wrap gap-4">
            <Link
              href={"/settings/notifications"}
              className="flex-1 text-center bg-primary p-2 rounded text-white font-medium"
            >
              Password & Security
            </Link>
          </span>
        </div>
        <Link
          href={"/settings/notifications"}
          className="col-span-2 row-start-2 border border-black/10 p-2 rounded bg-gray-200"
        >
          3
        </Link>
      </div>
    </section>
  );
};

export default Content;
