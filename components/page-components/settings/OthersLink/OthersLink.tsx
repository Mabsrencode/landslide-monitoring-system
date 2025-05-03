"use client";
import React from "react";
import Link from "next/link";
const otherLinks = [
  {
    title: "Personal Information",
    link: "/settings/account-details/personal-information",
  },
  {
    title: "Password & Security",
    link: "/settings/account-details/security",
  },
  {
    title: "Notifications",
    link: "/settings/notifications",
  },
];
const OthersLink = () => {
  return (
    <div className="w-full md:w-1/3 max-h-min bg-slate-100 rounded p-4 border border-black/10">
      <h3 className="manrope text-2xl text-semibold text-black">Others</h3>
      <ul className="mt-4">
        {otherLinks.map((link, index) => (
          <div key={index}>
            <div className="h-[1px] w-full bg-black/10" />
            <li className="hover:bg-secondary transition-all hover:text-white">
              <Link href={link.link} className="p-2 block">
                {link.title}
              </Link>
            </li>
          </div>
        ))}
      </ul>
    </div>
  );
};

export default OthersLink;
