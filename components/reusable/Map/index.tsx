import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full flex items-center justify-center border border-black/20">
      <div className="border-3 border-primary border-t-transparent h-[40px] w-[40px] animate-spin rounded-full"></div>
    </div>
  ),
});

export default MapComponent;
