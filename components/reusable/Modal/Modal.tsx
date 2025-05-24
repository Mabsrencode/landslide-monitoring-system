import React, { Dispatch, SetStateAction } from "react";
interface ModalProps {
  title?: string;
  description?: string;
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  onClick: () => void;
  isLoading: boolean;
  error?: string | null;
}
const Modal: React.FC<ModalProps> = ({
  title,
  description,
  onClick,
  setShow,
  show,
  isLoading,
  error,
}) => {
  return (
    <div className="center z-[1000] w-[400px] bg-white rounded shadow-lg p-4 border border-black/10">
      <div>
        <h2 className={`text-2xl font-semibold text-center`}>{title}</h2>
        <p className="text-gray-700 text-sm mt-2 text-center">{description}</p>
      </div>
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={() => setShow(!show)}
          className="bg-red-500 py-2 cursor-pointer hover:bg-red-500/70 px-4 flex-1 text-center text-white  text-nowrap text-sm md:text-base"
        >
          Cancel
        </button>
        <button
          disabled={isLoading}
          onClick={onClick}
          className="button disabled:cursor-not-allowed disabled:hover:cursor-not-allowed flex-1 text-center text-white text-nowrap text-sm md:text-base"
        >
          {isLoading ? "Processing..." : "Confirm"}
        </button>
        <span className="mt-2 text-red-500 text-sm font-medium">{error}</span>
      </div>
    </div>
  );
};

export default Modal;
