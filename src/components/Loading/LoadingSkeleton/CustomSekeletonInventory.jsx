import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const CustomSkeletonInventory = () => {
  return (
    <SkeletonTheme baseColor="#e5e7eb" highlightColor="#f3f4f6">
      <div className="p-3 sm:p-6 bg-white h-auto">
        {/* Summary Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 sm:mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton width={100} height={16} />
                <Skeleton width={60} height={32} />
              </div>
              <Skeleton circle width={32} height={32} />
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton width={100} height={16} />
                <Skeleton width={60} height={32} />
              </div>
              <Skeleton circle width={32} height={32} />
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton width={100} height={16} />
                <Skeleton width={60} height={32} />
              </div>
              <Skeleton circle width={32} height={32} />
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-sm p-3 sm:p-4 mb-4 sm:mb-6 border-gray-100 border">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Skeleton width={120} height={16} className="mb-2" />
              <Skeleton width="100%" height={40} />
            </div>
            <div>
              <Skeleton width={120} height={16} className="mb-2" />
              <Skeleton width="100%" height={40} />
            </div>
            <div>
              <Skeleton width={120} height={16} className="mb-2" />
              <Skeleton width="100%" height={40} />
            </div>
            <div>
              <Skeleton width={120} height={16} className="mb-2" />
              <Skeleton width="100%" height={40} />
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <Skeleton width={80} height={40} />
            <Skeleton width={120} height={40} />
          </div>
          <div className="mt-2 flex justify-end space-x-2">
            <Skeleton width={60} height={32} />
            <Skeleton width={60} height={32} />
          </div>
        </div>

        {/* Inventory Table/List */}
        <div className="bg-white rounded-sm shadow-md">
          <div className="bg-[#00D5BE] text-white p-3 rounded-t-sm">
            <Skeleton width={150} height={20} />
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "STT",
                    "Tên sản phẩm",
                    "SKU",
                    "Số lượng",
                    "Chi nhánh",
                    "Trạng thái",
                    "Hoạt động",
                  ].map((_, index) => (
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
                      <td className="px-4 py-3">
                        <Skeleton width={40} height={20} />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton width={100} height={20} />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton width={80} height={20} />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton width={60} height={20} />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton width={80} height={20} />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton width={80} height={24} />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton width={60} height={28} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden">
            {Array(5)
              .fill()
              .map((_, index) => (
                <div key={index} className="p-4 border-b">
                  <div className="flex items-start space-x-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div className="flex-1 min-w-0">
                          <Skeleton width={120} height={20} />
                          <Skeleton width={80} height={16} className="mt-1" />
                          <Skeleton width={60} height={16} className="mt-1" />
                          <Skeleton width={80} height={16} className="mt-1" />
                          <Skeleton width={80} height={24} className="mt-1" />
                        </div>
                        <div className="flex space-x-2 flex-shrink-0">
                          <Skeleton width={60} height={28} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Empty State */}
          <div className="text-center py-8 text-gray-500">
            <Skeleton width={200} height={20} />
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
              <Skeleton width={200} height={20} />
              <div className="flex items-center space-x-2 overflow-x-auto">
                <Skeleton width={60} height={32} />
                {Array(3)
                  .fill()
                  .map((_, index) => (
                    <Skeleton key={index} width={32} height={32} />
                  ))}
                <Skeleton width={60} height={32} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
};

export default CustomSkeletonInventory;
