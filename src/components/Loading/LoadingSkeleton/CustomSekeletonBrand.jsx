import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const CustomSkeletonBrand = () => {
  return (
    <SkeletonTheme baseColor="#e5e7eb" highlightColor="#f3f4f6">
      <div className="p-3 sm:p-6 bg-white h-auto">
        {/* Header with Buttons */}
        <div className="mb-4 sm:mb-6">
          <div className="hidden sm:flex space-x-2 rounded-lg p-1">
            <Skeleton width={150} height={40} />
            <Skeleton width={180} height={40} />
          </div>
          <div className="sm:hidden">
            <Skeleton width="100%" height={40} />
            <div className="mt-2">
              <Skeleton width="100%" height={40} />
              <Skeleton width="100%" height={40} />
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 sm:mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-sm p-4">
            <Skeleton width={100} height={16} />
            <Skeleton width={60} height={32} />
          </div>
          <div className="bg-green-50 border border-green-200 rounded-sm p-4">
            <Skeleton width={100} height={16} />
            <Skeleton width={60} height={32} />
          </div>
          <div className="bg-red-50 border border-red-200 rounded-sm p-4">
            <Skeleton width={100} height={16} />
            <Skeleton width={60} height={32} />
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-sm p-3 sm:p-4 mb-4 sm:mb-6 border-gray-100 border">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Skeleton width={120} height={16} />
              <Skeleton width="100%" height={40} />
            </div>
            <div>
              <Skeleton width={120} height={16} />
              <div className="relative">
                <Skeleton width="100%" height={40} />
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <Skeleton width={80} height={40} />
            <Skeleton width={120} height={40} />
          </div>
        </div>

        {/* Brand Table/List */}
        <div className="bg-white rounded-sm shadow-md">
          <div className="bg-[#00D5BE] text-white p-3 rounded-t-sm">
            <Skeleton width={150} height={20} />
          </div>

          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {Array(5)
                    .fill()
                    .map((_, index) => (
                      <th key={index} className="px-4 py-3">
                        <Skeleton width={80} height={20} />
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Array(5)
                  .fill()
                  .map((_, index) => (
                    <tr key={index} className="hover:bg-gray-100">
                      <td className="px-4 py-3"><Skeleton width={40} height={20} /></td>
                      <td className="px-4 py-3"><Skeleton width={48} height={48} /></td>
                      <td className="px-4 py-3"><Skeleton width={100} height={20} /></td>
                      <td className="px-4 py-3"><Skeleton width={80} height={20} /></td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <Skeleton width={40} height={28} />
                          <Skeleton width={40} height={28} />
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden">
            {Array(5)
              .fill()
              .map((_, index) => (
                <div key={index} className="p-4 border-b">
                  <div className="flex items-start space-x-3">
                    <Skeleton width={64} height={64} />
                    <div className="flex-1">
                      <Skeleton width={120} height={20} />
                      <Skeleton width={80} height={20} />
                    </div>
                    <div className="flex space-x-2">
                      <Skeleton width={40} height={28} />
                      <Skeleton width={40} height={28} />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
            <Skeleton width={200} height={20} />
            <div className="flex items-center space-x-2">
              <Skeleton width={60} height={32} />
              <Skeleton width={20} height={32} />
              <Skeleton width={20} height={32} />
              <Skeleton width={20} height={32} />
              <Skeleton width={60} height={32} />
            </div>
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
};

export default CustomSkeletonBrand;