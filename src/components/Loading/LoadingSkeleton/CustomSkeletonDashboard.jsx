import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const CustomSkeletonDashboard = () => {
  return (
    <SkeletonTheme baseColor="#e5e7eb" highlightColor="#f3f4f6">
      <div className="p-4 sm:p-6 md:p-8 bg-white min-h-screen">
        {/* Thống kê tổng quan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {Array(8)
            .fill()
            .map((_, index) => (
              <div
                key={index}
                className={`rounded-sm p-4 sm:p-5 ${
                  index === 0
                    ? "bg-blue-50 border border-blue-200"
                    : index === 1
                    ? "bg-green-50 border border-green-200"
                    : index === 2
                    ? "bg-orange-50 border border-orange-200"
                    : index === 3
                    ? "bg-purple-50 border border-purple-200"
                    : index === 4
                    ? "bg-blue-50 border border-blue-200"
                    : index === 5
                    ? "bg-green-50 border border-green-200"
                    : index === 6
                    ? "bg-teal-50 border border-teal-200"
                    : "bg-indigo-50 border border-indigo-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton width={100} height={16} className="mb-2" />
                    <Skeleton width={80} height={24} />
                  </div>
                  <Skeleton circle width={32} height={32} />
                </div>
              </div>
            ))}
        </div>

        {/* Đơn hàng mới nhất */}
        <div className="bg-white rounded-sm shadow-md mb-6 sm:mb-8">
          <div className="bg-[#00D5BE] text-white p-4 sm:p-5 rounded-t-sm">
            <Skeleton width={150} height={20} />
          </div>
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {Array(4)
                    .fill()
                    .map((_, index) => (
                      <th
                        key={index}
                        className="px-4 sm:px-5 py-3 sm:py-4 text-left"
                      >
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
                      <td className="px-4 sm:px-5 py-3 sm:py-4">
                        <Skeleton width={100} height={20} />
                      </td>
                      <td className="px-4 sm:px-5 py-3 sm:py-4">
                        <Skeleton width={100} height={20} />
                      </td>
                      <td className="px-4 sm:px-5 py-3 sm:py-4">
                        <Skeleton width={100} height={20} />
                      </td>
                      <td className="px-4 sm:px-5 py-3 sm:py-4">
                        <Skeleton width={80} height={24} />
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
                <div
                  key={index}
                  className="p-4 sm:p-5 hover:bg-gray-50 border-b border-gray-200"
                >
                  <Skeleton width={200} height={60} />
                </div>
              ))}
          </div>
        </div>

        {/* Đơn hàng chờ xử lý */}
        <div className="bg-white rounded-sm shadow-md mb-6 sm:mb-8">
          <div className="bg-[#00D5BE] text-white p-4 sm:p-5 rounded-t-sm">
            <Skeleton width={150} height={20} />
          </div>
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {Array(4)
                    .fill()
                    .map((_, index) => (
                      <th
                        key={index}
                        className="px-4 sm:px-5 py-3 sm:py-4 text-left"
                      >
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
                      <td className="px-4 sm:px-5 py-3 sm:py-4">
                        <Skeleton width={100} height={20} />
                      </td>
                      <td className="px-4 sm:px-5 py-3 sm:py-4">
                        <Skeleton width={100} height={20} />
                      </td>
                      <td className="px-4 sm:px-5 py-3 sm:py-4">
                        <Skeleton width={100} height={20} />
                      </td>
                      <td className="px-4 sm:px-5 py-3 sm:py-4">
                        <Skeleton width={80} height={24} />
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
                <div
                  key={index}
                  className="p-4 sm:p-5 hover:bg-gray-50 border-b border-gray-200"
                >
                  <Skeleton width={200} height={60} />
                </div>
              ))}
          </div>
        </div>

        {/* Sản phẩm mới nhập và khách hàng mới */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-sm shadow-md">
            <div className="bg-[#00D5BE] text-white p-4 sm:p-5 rounded-t-sm">
              <Skeleton width={150} height={20} />
            </div>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {Array(2)
                      .fill()
                      .map((_, index) => (
                        <th
                          key={index}
                          className="px-4 sm:px-5 py-3 sm:py-4 text-left"
                        >
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
                        <td className="px-4 sm:px-5 py-3 sm:py-4">
                          <Skeleton width={100} height={20} />
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4">
                          <Skeleton width={100} height={20} />
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
                  <div
                    key={index}
                    className="p-4 sm:p-5 hover:bg-gray-50 border-b border-gray-200"
                  >
                    <Skeleton width={200} height={60} />
                  </div>
                ))}
            </div>
          </div>
          <div className="bg-white rounded-sm shadow-md">
            <div className="bg-[#00D5BE] text-white p-4 sm:p-5 rounded-t-sm">
              <Skeleton width={150} height={20} />
            </div>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {Array(3)
                      .fill()
                      .map((_, index) => (
                        <th
                          key={index}
                          className="px-4 sm:px-5 py-3 sm:py-4 text-left"
                        >
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
                        <td className="px-4 sm:px-5 py-3 sm:py-4">
                          <Skeleton width={100} height={20} />
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4">
                          <Skeleton width={100} height={20} />
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4">
                          <Skeleton width={100} height={20} />
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
                  <div
                    key={index}
                    className="p-4 sm:p-5 hover:bg-gray-50 border-b border-gray-200"
                  >
                    <Skeleton width={200} height={60} />
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Top sản phẩm bán chạy và sản phẩm sắp hết hàng */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-sm shadow-md">
            <div className="bg-[#00D5BE] text-white p-4 sm:p-5 rounded-t-sm">
              <Skeleton width={150} height={20} />
            </div>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {Array(3)
                      .fill()
                      .map((_, index) => (
                        <th
                          key={index}
                          className="px-4 sm:px-5 py-3 sm:py-4 text-left"
                        >
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
                        <td className="px-4 sm:px-5 py-3 sm:py-4">
                          <Skeleton width={100} height={20} />
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4">
                          <Skeleton width={80} height={20} />
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4">
                          <Skeleton width={80} height={20} />
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
                  <div
                    key={index}
                    className="p-4 sm:p-5 hover:bg-gray-50 border-b border-gray-200"
                  >
                    <Skeleton width={200} height={60} />
                  </div>
                ))}
            </div>
          </div>
          <div className="bg-white rounded-sm shadow-md">
            <div className="bg-[#00D5BE] text-white p-4 sm:p-5 rounded-t-sm">
              <Skeleton width={150} height={20} />
            </div>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {Array(2)
                      .fill()
                      .map((_, index) => (
                        <th
                          key={index}
                          className="px-4 sm:px-5 py-3 sm:py-4 text-left"
                        >
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
                        <td className="px-4 sm:px-5 py-3 sm:py-4">
                          <Skeleton width={100} height={20} />
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4">
                          <Skeleton width={80} height={20} />
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
                  <div
                    key={index}
                    className="p-4 sm:p-5 hover:bg-gray-50 border-b border-gray-200"
                  >
                    <Skeleton width={200} height={60} />
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Thông báo */}
        <div className="bg-white rounded-sm shadow-md mb-6 sm:mb-8">
          <div className="bg-[#00D5BE] text-white p-4 sm:p-5 rounded-t-sm flex flex-col gap-3">
            <Skeleton width={150} height={20} />
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
              <Skeleton width="100%" height={40} />
              <Skeleton width="100%" height={40} />
            </div>
          </div>
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {Array(5)
                    .fill()
                    .map((_, index) => (
                      <th
                        key={index}
                        className="px-4 sm:px-5 py-3 sm:py-4 text-left"
                      >
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
                      <td className="px-4 sm:px-5 py-3 sm:py-4">
                        <Skeleton width={100} height={20} />
                      </td>
                      <td className="px-4 sm:px-5 py-3 sm:py-4">
                        <Skeleton width={150} height={20} />
                      </td>
                      <td className="px-4 sm:px-5 py-3 sm:py-4">
                        <Skeleton width={100} height={20} />
                      </td>
                      <td className="px-4 sm:px-5 py-3 sm:py-4">
                        <Skeleton width={80} height={24} />
                      </td>
                      <td className="px-4 sm:px-5 py-3 sm:py-4">
                        <Skeleton width={100} height={20} />
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
                <div
                  key={index}
                  className="p-4 sm:p-5 hover:bg-gray-50 border-b border-gray-200"
                >
                  <Skeleton width={200} height={80} />
                </div>
              ))}
          </div>
          <div className="flex justify-between p-4 sm:p-5">
            <Skeleton width={80} height={32} />
            <Skeleton width={100} height={32} />
            <Skeleton width={80} height={32} />
          </div>
        </div>

        {/* Biểu đồ trực quan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {Array(4)
            .fill()
            .map((_, index) => (
              <div key={index} className="bg-white rounded-sm shadow-md">
                <div className="bg-[#00D5BE] text-white p-4 sm:p-5 rounded-t-sm flex flex-col gap-3">
                  <Skeleton width={150} height={20} />
                  <Skeleton width="100%" height={40} />
                </div>
                <div className="p-4 sm:p-5">
                  <Skeleton width="100%" height={300} />
                </div>
              </div>
            ))}
        </div>
      </div>
    </SkeletonTheme>
  );
};

export default CustomSkeletonDashboard;