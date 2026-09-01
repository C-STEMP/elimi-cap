import { Loader } from "@/src/components/ui/loader";

export default function NsqLoading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh] w-full">
      <Loader />
    </div>
  );
}
