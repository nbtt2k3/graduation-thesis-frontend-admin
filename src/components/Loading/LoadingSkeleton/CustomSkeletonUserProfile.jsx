import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const CustomSkeletonUserProfile = () => {
  return (
    <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f5f5f5">
      <div className="p-3 sm:p-6 bg-white h-auto">
        <div className="mb-4 sm:mb-6">
          <Skeleton width={150} height={40} />
        </div>
        <div className="bg-white rounded shadow">
          <div className="bg-[#00D5BE] p-3 rounded-t">
            <Skeleton width={200} height={20} />
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="flex flex-col items-center">
                <Skeleton circle width={128} height={128} />
                <Skeleton width={100} height={40} className="mt-3" />
              </div>
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {Array(5)
                  .fill()
                  .map((_, index) => (
                    <div key={index}>
                      <Skeleton width={80} height={20} />
                      <Skeleton height={40} />
                    </div>
                  ))}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Skeleton width={150} height={40} />
            </div>
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
};

export default CustomSkeletonUserProfile;
