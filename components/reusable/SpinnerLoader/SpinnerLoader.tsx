import React from "react";

interface SpinnerVariant {
  variant?: "big" | "small" | "tiny";
}

const SpinnerLoader: React.FC<SpinnerVariant> = ({ variant }) => {
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
    <div
      className={`${sizeClass} border-3 border-primary rounded-full border-t-white animate-spin bg-blend-difference`}
    ></div>
  );
};

export default SpinnerLoader;
