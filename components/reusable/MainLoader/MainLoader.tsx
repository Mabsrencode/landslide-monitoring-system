import images from "@/constants/images";
import Image from "next/image";
import React from "react";

const MainLoader = () => {
  return (
    <div className="w-full h-full flex justify-center items-center fixed top-0 left-0">
      <div className="w-[100] h-[100]">
        <Image
          alt="loader"
          src={images.logo}
          height={100}
          width={100}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default MainLoader;
