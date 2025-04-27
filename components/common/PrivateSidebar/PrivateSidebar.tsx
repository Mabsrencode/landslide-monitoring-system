"use client";
import { useState } from "react";
import "./style.css";
import { LuLogs } from "react-icons/lu";
import { MdSpaceDashboard } from "react-icons/md";
import {
  TbLayoutSidebarLeftExpandFilled,
  TbLayoutSidebarRightExpandFilled,
} from "react-icons/tb";
import { CiWarning } from "react-icons/ci";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import images from "@/constants/images";
import { useAuthStore } from "@/stores/authStore";
import { IoIosClose } from "react-icons/io";
import { useMutation } from "@tanstack/react-query";
import SpinnerLoader from "@/components/reusable/SpinnerLoader/SpinnerLoader";
import toast from "react-hot-toast";
const navigationItems = [
  {
    link: "/dashboard",
    name: "Dashboard",
    icon: <MdSpaceDashboard />,
  },
  {
    link: "/dashboard/logs",
    name: "Logs",
    icon: <LuLogs />,
  },
  {
    link: "/dashboard/incidents",
    name: "Incidents",
    icon: <CiWarning />,
  },
];
const handleLogOut = async () => {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Logout failed");
  }
  const result = await response.json();
  return result;
};
const PrivateSidebar = () => {
  const [openProfileContainer, setOpenProfileContainer] = useState(false);
  const { user } = useAuthStore();
  const pathname = usePathname();
  const [isSideBarOpen, setIsSideBarOpen] = useState<boolean>(false);
  const logOutMutation = useMutation({
    mutationFn: handleLogOut,
    onSuccess: () => {
      toast.success("Logged out successfully");
    },
    onError: (error) => {
      toast.error(`Logout error: ${(error as Error).message}`);
    },
  });
  return (
    <aside
      className={`sticky z-[1000] top-0 py-6 transition-all bg-white text-white h-screen flex flex-col justify-between items-center ${
        isSideBarOpen ? "w-[150px]" : "w-[60px]"
      } border-r border-black/10 shadow`}
    >
      <div className="flex flex-col items-center">
        <Link href={"/"} className="flex items-center gap-4">
          {!isSideBarOpen && (
            <Image src={images.logo} alt="logo" height={40} width={40} />
          )}
          {isSideBarOpen && (
            <h1 className="text-secondary text-xl font-bold manrope leading-4">
              BANTAY
              <br />
              <span className="text-xs font-normal">landslide</span>
            </h1>
          )}
        </Link>
        <nav className="mt-12">
          <ul className="grid gap-2 px-2 text-xl transition-all">
            {navigationItems.map((navItem) => (
              <li key={navItem.link}>
                <Link
                  className={`link flex items-center gap-2 transition-all p-[14px] hover:bg-secondary hover:text-white text-gray-700 rounded ${
                    pathname === navItem.link
                      ? "bg-secondary text-white"
                      : "text-gray-700"
                  }`}
                  title={navItem.name}
                  href={navItem.link}
                >
                  {navItem.icon}
                  <span
                    className={` ${
                      pathname === navItem.link
                        ? "bg-secondary text-white"
                        : "text-gray-700"
                    } text-sm text-nowrap text-gray-700 font-semibold ${
                      isSideBarOpen ? "block" : "hidden"
                    }`}
                  >
                    {navItem.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div>
        <div className="relative w-full">
          {user && user && user.emailVerified ? (
            <div className="relative">
              <div
                onClick={() => setOpenProfileContainer(!openProfileContainer)}
                className="flex justify-center items-center bg-primary text-3xl rounded-full h-11 w-11 hover:bg-primary/70 cursor-pointer transition-all"
              >
                <h3> {user.email.split("")[0].toUpperCase()}</h3>
              </div>
            </div>
          ) : (
            <div className="rounded-full h-11 w-11 bg-gray-400 animate-pulse"></div>
          )}
        </div>
        {openProfileContainer && user && user.email && (
          <div className="absolute bg-white rounded-lg bottom-6 left-14 w-[300px]">
            <div className="relative p-3">
              <h3 className="text-sm text-black w-[230px] font-bold text-ellipsis overflow-hidden">
                {user.email}
              </h3>
              <IoIosClose
                onClick={() => setOpenProfileContainer(false)}
                className="absolute top-1 right-1 text-black text-3xl hover:bg-slate-600/20 rounded-full cursor-pointer"
              />
              <ul className="text-black text-base my-2">
                <li>
                  <Link
                    className="py-1 hover:font-bold block border-t"
                    href={"/profile/account-details"}
                  >
                    Account Details
                  </Link>
                </li>
                <li>
                  <Link
                    className="py-1 hover:font-bold block border-t"
                    href={"/profile/notifications"}
                  >
                    Notifications & reports
                  </Link>
                </li>
                <li>
                  <Link
                    className="py-1 hover:font-bold block border-t border-b"
                    href={"/profile/security"}
                  >
                    Security
                  </Link>
                </li>
              </ul>
              <div className="w-full mt-4">
                <button
                  disabled={logOutMutation.isPending}
                  onClick={() => logOutMutation.mutate()}
                  className="text-sm mx-auto block px-12 py-2 bg-primary disable:bg-primary/70 hover:bg-primary/70 rounded cursor-pointer"
                >
                  {logOutMutation.isPending ? <SpinnerLoader /> : "Log out"}
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="mt-12 text-gray-700 hover:text-black">
          {!isSideBarOpen ? (
            <TbLayoutSidebarLeftExpandFilled
              className="cursor-pointer text-2xl mx-auto"
              onClick={() => setIsSideBarOpen(!isSideBarOpen)}
            />
          ) : (
            <TbLayoutSidebarRightExpandFilled
              className="cursor-pointer text-2xl mx-auto"
              onClick={() => setIsSideBarOpen(!isSideBarOpen)}
            />
          )}
        </div>
      </div>
    </aside>
  );
};

export default PrivateSidebar;
