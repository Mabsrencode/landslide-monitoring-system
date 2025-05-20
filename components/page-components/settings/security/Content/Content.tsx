import BackRoute from "@/components/reusable/BackRoute/BackRoute";
import React from "react";
import OthersLink from "../../OthersLink/OthersLink";

const Content = () => {
  return (
    <section className="container mx-auto p-4 w-full h-full">
      <BackRoute />
      <div className="flex flex-col md:flex-row gap-4 w-full">
        <form className="w-full flex-1 md:w-1/2 mx-auto space-y-6 bg-slate-100 rounded p-4 border border-black/10">
          <h4 className="text-4xl text-center font-semibold manrope text-primary">
            Change Password
          </h4>
          <div className="mt-4 grid gap-4">
            <div className="grid w-full gap-2">
              <label htmlFor="current_psw">Current Password</label>
              <input
                type="password"
                id="current_psw"
                placeholder="*******************"
                className="w-full border disabled:cursor-not-allowed border-black/20 outline-none p-2  font-normal bg-white"
              />
            </div>
            <div className="grid w-full gap-2">
              <label htmlFor="new_psw">New Password</label>
              <input
                type="password"
                id="new_psw"
                placeholder="*******************"
                className="w-full border disabled:cursor-not-allowed border-black/20 outline-none p-2  font-normal bg-white"
              />
            </div>
            <div className="grid w-full gap-2">
              <label htmlFor="confirm_psw">Confirm Password</label>
              <input
                type="password"
                id="confirm_psw"
                placeholder="*******************"
                className="w-full border disabled:cursor-not-allowed border-black/20 outline-none p-2  font-normal bg-white"
              />
            </div>
          </div>
        </form>{" "}
        <OthersLink />
      </div>
    </section>
  );
};

export default Content;
