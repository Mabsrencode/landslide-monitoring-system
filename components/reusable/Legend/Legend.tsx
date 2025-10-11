import React from "react";
const Legend = () => {
  return (
    <div className="flex gap-8 w-full flex-wrap items-center justify-center mt-4">
      <div className="flex items-center gap-2">
        <div className="h-[15px] w-[15px] bg-green-500 rounded"></div>
        <h4 className="text-sm manrope font-semibold">
          Stable (No risk detected)
        </h4>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-[15px] w-[15px] bg-yellow-500 rounded"></div>
        <h4 className="text-sm manrope font-semibold">
          Caution (Minor changes observed)
        </h4>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-[15px] w-[15px] bg-orange-500 rounded"></div>
        <h4 className="text-sm manrope font-semibold">
          Alert (Possible landslide signs)
        </h4>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-[15px] w-[15px] bg-red-500 rounded"></div>
        <h4 className="text-sm manrope font-semibold">
          Danger (High landslide risk)
        </h4>
      </div>
    </div>
  );
};

export default Legend;
