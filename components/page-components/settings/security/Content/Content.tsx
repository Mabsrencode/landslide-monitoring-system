import BackRoute from "@/components/reusable/BackRoute/BackRoute";
import React from "react";

const Content = () => {
  return (
    <section className="container mx-auto p-4 w-full h-full">
      <BackRoute />
      <form>
        <h4>Change Password</h4>
        <div>
          <div>
            <label htmlFor=""></label>
            <input type="text" />
          </div>
          <div>
            <label htmlFor=""></label>
            <input type="text" />
          </div>
          <div>
            <label htmlFor=""></label>
            <input type="text" />
          </div>
        </div>
      </form>
    </section>
  );
};

export default Content;
