import React from "react";

interface SpinnerVariant {
  variant?: "big" | "small" | "tiny";
}

const GlobalSpinningLoader: React.FC<SpinnerVariant> = ({ variant }) => {
  let sizeClass = "h-[20px] w-[20px]";

  switch (variant) {
    case "big":
      sizeClass = "h-[40px] w-[40px]";
      break;
    case "small":
      sizeClass = "h-[20px] w-[20px]";
      break;
    case "tiny":
      sizeClass = "h-[12px] w-[12px]";
      break;
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div
        className={`${sizeClass} mx-auto border-5 border-primary rounded-full border-t-transparent animate-spin`}
      ></div>
    </div>
  );
};

export default GlobalSpinningLoader;
