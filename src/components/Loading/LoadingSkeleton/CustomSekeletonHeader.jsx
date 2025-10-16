import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const CustomSkeletonHeader = () => {
  return (
    <SkeletonTheme baseColor="#e5e7eb" highlightColor="#f3f4f6">
      <header className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Page title */}
          <div>
            <Skeleton width={120} height={20} />
          </div>

          {/* Right: Notification + User */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Notification */}
            <div className="relative">
              <Skeleton circle width={28} height={28} />
            </div>

            {/* User info */}
            <div className="flex items-center space-x-2">
              <Skeleton circle width={32} height={32} />
              <Skeleton width={100} height={16} />
            </div>
          </div>
        </div>
      </header>
    </SkeletonTheme>
  );
};

export default CustomSkeletonHeader;
