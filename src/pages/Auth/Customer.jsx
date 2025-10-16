"use client";

import React, { useEffect, useState, useContext } from "react";
import {
  FileText,
  Eye,
  EyeOff,
  X,
  Info,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import * as apis from "../../apis";
import { toast } from "react-hot-toast";
import { CustomSkeletonCustomer, CustomSelect } from "../../components";
import { AdminTechZoneContext } from "../../context/AdminTechZoneContext";

const Customer = () => {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedStatusFilter, setAppliedStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [activeCustomers, setActiveCustomers] = useState(0);
  const [inactiveCustomers, setInactiveCustomers] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmCustomerId, setConfirmCustomerId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  const { setError } = useContext(AdminTechZoneContext);

  const statusOptions = [
    { value: "", label: "Tất cả" },
    { value: "false", label: "Hoạt động" },
    { value: "true", label: "Bị chặn" },
  ];

  const getAllCustomers = async (page = 1) => {
    try {
      setLoading(true);
      const query = { page, limit: itemsPerPage };
      if (appliedSearchTerm) query.name = appliedSearchTerm;
      if (appliedStatusFilter) query.isBlocked = appliedStatusFilter;
      const response = await apis.apiGetAlluser(query);

      setCustomers(response.userList || []);
      setTotalCustomers(response.totalUsers || 0);
      setActiveCustomers(response.activeUsers || 0);
      setInactiveCustomers(response.inactiveUsers || 0);
      if (page === 1 && response.userList) {
        setItemsPerPage(response.userList.length || 5);
      }
    } catch (error) {
      if (error?.msg) {
        toast.error(error.msg || "Không thể tải dữ liệu. Vui lòng thử lại.");
      } else {
        setError({ hasError: true, message: "Lỗi kết nối API" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const query = { page: 1, limit: itemsPerPage };
      if (searchTerm) query.name = searchTerm;
      if (statusFilter) query.isBlocked = statusFilter;
      const response = await apis.apiGetAlluser(query);

      setCustomers(response.userList || []);
      setTotalCustomers(response.totalUsers || 0);
      setActiveCustomers(response.activeUsers || 0);
      setInactiveCustomers(response.inactiveUsers || 0);
      if (response.userList) {
        setItemsPerPage(response.userList.length || 5);
      }

      setAppliedSearchTerm(searchTerm);
      setAppliedStatusFilter(statusFilter);
      setCurrentPage(1);
    } catch (error) {
      if (error?.msg) {
        toast.error(error.msg || "Không thể tải dữ liệu. Vui lòng thử lại.");
      } else {
        setError({ hasError: true, message: "Lỗi kết nối API" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = async () => {
    try {
      setLoading(true);
      setSearchTerm("");
      setStatusFilter("");
      setAppliedSearchTerm("");
      setAppliedStatusFilter("");
      setCurrentPage(1);

      const response = await apis.apiGetAlluser({
        page: 1,
        limit: itemsPerPage,
      });

      setCustomers(response.userList || []);
      setTotalCustomers(response.totalUsers || 0);
      setActiveCustomers(response.activeUsers || 0);
      setInactiveCustomers(response.inactiveUsers || 0);
      if (response.userList) {
        setItemsPerPage(response.userList.length || 5);
      }
    } catch (error) {
      if (error?.msg) {
        toast.error(error.msg || "Không thể tải dữ liệu. Vui lòng thử lại.");
      } else {
        setError({ hasError: true, message: "Lỗi kết nối API" });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllCustomers(currentPage);
  }, [currentPage]);

  const handleToggleConfirm = (customerId, currentStatus) => {
    setConfirmCustomerId(customerId);
    setConfirmAction(currentStatus ? "unblock" : "block");
    setIsConfirmModalOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!confirmCustomerId || !confirmAction) return;

    try {
      setIsConfirmLoading(true);
      const newStatus = confirmAction === "block";
      const response = await apis.apiUpdateUserBlockStatus({
        userId: confirmCustomerId,
        isBlocked: newStatus,
      });

      toast.success(response.msg || "Thay đổi trạng thái thành công!");

      setCustomers((prev) =>
        prev.map((customer) =>
          customer._id === confirmCustomerId
            ? { ...customer, isBlocked: newStatus }
            : customer
        )
      );
      setActiveCustomers((prev) =>
        confirmAction === "block" ? prev - 1 : prev + 1
      );
      setInactiveCustomers((prev) =>
        confirmAction === "block" ? prev + 1 : prev - 1
      );
    } catch (error) {
      if (error?.msg) {
        toast.error(
          error.msg || "Không thể thay đổi trạng thái. Vui lòng thử lại."
        );
      }
    } finally {
      setIsConfirmLoading(false);
      setIsConfirmModalOpen(false);
      setConfirmCustomerId(null);
      setConfirmAction(null);
    }
  };

  const handleShowDetails = (customer) => {
    setSelectedCustomer(customer);
  };

  const handleCloseDetails = () => {
    setSelectedCustomer(null);
  };

  const totalPages = itemsPerPage
    ? Math.ceil(totalCustomers / itemsPerPage)
    : 1;

  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 3;

    if (totalPages > 0) {
      items.push(1);
    }

    const start = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
    if (start > 2) {
      items.push("...");
    }

    const end = Math.min(
      totalPages - 1,
      currentPage + Math.floor(maxVisiblePages / 2)
    );

    for (let i = start; i <= end; i++) {
      items.push(i);
    }

    if (end < totalPages - 1) {
      items.push("...");
    }

    if (totalPages > 1) {
      items.push(totalPages);
    }

    return items;
  };

  if (loading) {
    return <CustomSkeletonCustomer />;
  }

  return (
    <div className="p-3 sm:p-6 bg-white h-auto">
      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 p-6 border-b border-gray-200">
              Xác nhận {confirmAction === "block" ? "Chặn" : "Bỏ chặn"} khách
              hàng
            </h3>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-6">
                Bạn có chắc muốn{" "}
                {confirmAction === "block" ? "chặn" : "bỏ chặn"} khách hàng này?
              </p>
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 cursor-pointer transition-colors duration-200 w-full sm:w-auto"
                  onClick={() => setIsConfirmModalOpen(false)}
                  aria-label="Hủy"
                  disabled={isConfirmLoading}
                >
                  Hủy
                </button>
                <button
                  className={`px-4 py-2 text-white rounded-md flex items-center justify-center transition-colors duration-200 w-full sm:w-auto cursor-pointer ${
                    confirmAction === "block"
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "bg-green-500 hover:bg-green-600"
                  } ${isConfirmLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={handleConfirmToggle}
                  aria-label={
                    confirmAction === "block"
                      ? "Xác nhận chặn"
                      : "Xác nhận bỏ chặn"
                  }
                  disabled={isConfirmLoading}
                >
                  {isConfirmLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Đang xử lý...
                    </>
                  ) : confirmAction === "block" ? (
                    "Chặn"
                  ) : (
                    "Bỏ chặn"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    Chi tiết khách hàng
                  </h3>
                  <p className="text-blue-100 text-sm opacity-90">
                    Thông tin chi tiết về khách hàng
                  </p>
                </div>
                <button
                  onClick={handleCloseDetails}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200 cursor-pointer"
                  aria-label="Đóng chi tiết"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 min-h-0">
              {/* Customer Name & Email */}
              <div className="mb-6">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border-l-4 border-blue-500">
                  <h4 className="text-xl font-bold text-gray-800 mb-2">
                    {selectedCustomer.fullName}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {selectedCustomer.email}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedCustomer.isBlocked
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {selectedCustomer.isBlocked ? "Bị chặn" : "Hoạt động"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h5 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200">
                    Thông tin cơ bản
                  </h5>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Họ và tên
                        </p>
                        <p className="text-gray-900 mt-1">
                          {selectedCustomer.fullName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Info className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Giới tính
                        </p>
                        <p className="text-gray-900 mt-1 font-medium">
                          {selectedCustomer.gender === "MALE" ? "Nam" : "Nữ"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 font-bold text-sm">
                          @
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Email
                        </p>
                        <p className="text-gray-900 mt-1 font-bold">
                          {selectedCustomer.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-4">
                  <h5 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200">
                    Thông tin bổ sung
                  </h5>
                  <div className="space-y-3">
                    <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                      <p className="text-sm font-medium text-orange-800">
                        Số điện thoại
                      </p>
                      <p className="text-orange-900 font-bold">
                        {selectedCustomer.phone}
                      </p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                      <p className="text-sm font-medium text-red-800">
                        Ngày sinh
                      </p>
                      <p className="text-red-900 font-bold">
                        {new Date(
                          selectedCustomer.dateOfBirth
                        ).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                      <p className="text-sm font-medium text-indigo-800">
                        Xác minh tài khoản
                      </p>
                      <p className="text-indigo-900 font-medium">
                        {selectedCustomer.isVerified
                          ? "Đã xác minh"
                          : "Chưa xác minh"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Creation */}
              <div className="mt-6">
                <h5 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-4">
                  Thông tin tài khoản
                </h5>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">
                        Ngày tạo
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        {new Date(
                          selectedCustomer.createdAt
                        ).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full relative">
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-purple-500 rounded-full"></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">
                        Cập nhật
                      </p>
                      <p className="text-lg font-bold text-purple-600">
                        {new Date(
                          selectedCustomer.updatedAt
                        ).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex-shrink-0">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCloseDetails}
                  className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium cursor-pointer"
                  aria-label="Đóng chi tiết"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 sm:mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Tổng khách hàng
              </p>
              <p className="text-2xl font-bold text-blue-800">
                {totalCustomers}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Hoạt động</p>
              <p className="text-2xl font-bold text-green-800">
                {activeCustomers}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Bị chặn</p>
              <p className="text-2xl font-bold text-red-800">
                {inactiveCustomers}
              </p>
            </div>
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <EyeOff className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-sm p-3 sm:p-4 mb-4 sm:mb-6 border-gray-100 border">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên khách hàng
            </label>
            <input
              type="text"
              placeholder="Tên khách hàng"
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <CustomSelect
              name="statusFilter"
              options={statusOptions}
              label="Trạng thái"
              placeholder="Tất cả"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              withSearch={false}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-500 text-white rounded-sm hover:bg-blue-600 transition-colors cursor-pointer"
            aria-label="Tìm kiếm"
          >
            Tìm kiếm
          </button>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-gray-500 text-white rounded-sm hover:bg-gray-600 flex items-center transition-colors cursor-pointer"
            aria-label="Xóa bộ lọc"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            XÓA BỘ LỌC
          </button>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-sm shadow-md">
        <div className="bg-[#00D5BE] text-white p-3 rounded-t-sm flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <h2 className="text-base font-semibold">QUẢN LÝ KHÁCH HÀNG</h2>
        </div>

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  STT
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Tên khách hàng
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Số điện thoại
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Ngày sinh
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Hoạt động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.map((customer, index) => (
                <tr key={customer._id} className="hover:bg-gray-100">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {customer.fullName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {customer.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {customer.phone}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Date(customer.dateOfBirth).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        customer.isBlocked
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {customer.isBlocked ? "Bị chặn" : "Hoạt động"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleShowDetails(customer)}
                        className="px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 flex items-center cursor-pointer"
                        aria-label="Xem chi tiết khách hàng"
                      >
                        <Info className="w-3 h-3 mr-1" />
                        Chi tiết
                      </button>
                      <button
                        onClick={() =>
                          handleToggleConfirm(customer._id, customer.isBlocked)
                        }
                        className={`px-3 py-1 rounded text-xs flex items-center cursor-pointer transition-colors ${
                          customer.isBlocked
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-orange-500 text-white hover:bg-orange-600"
                        }`}
                        aria-label={
                          customer.isBlocked
                            ? "Bỏ chặn khách hàng"
                            : "Chặn khách hàng"
                        }
                      >
                        {customer.isBlocked ? (
                          <>
                            <Eye className="w-3 h-3 mr-1" />
                            Bỏ chặn
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 mr-1" />
                            Chặn
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lg:hidden">
          <div className="divide-y divide-gray-200">
            {customers.map((customer, index) => (
              <div key={customer._id} className="p-4 hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        #{(currentPage - 1) * itemsPerPage + index + 1} -{" "}
                        {customer.fullName}
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        <p>Email: {customer.email}</p>
                        <p>Số điện thoại: {customer.phone}</p>
                        <p>
                          Ngày sinh:{" "}
                          {new Date(customer.dateOfBirth).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                      <div className="mt-1">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            customer.isBlocked
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {customer.isBlocked ? "Bị chặn" : "Hoạt động"}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2 flex-shrink-0">
                      <button
                        onClick={() => handleShowDetails(customer)}
                        className="px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 flex items-center cursor-pointer"
                        aria-label="Xem chi tiết khách hàng"
                      >
                        <Info className="w-3 h-3 mr-1" />
                        Chi tiết
                      </button>
                      <button
                        onClick={() =>
                          handleToggleConfirm(customer._id, customer.isBlocked)
                        }
                        className={`px-3 py-1 rounded text-xs flex items-center cursor-pointer transition-colors ${
                          customer.isBlocked
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-orange-500 text-white hover:bg-orange-600"
                        }`}
                        aria-label={
                          customer.isBlocked
                            ? "Bỏ chặn khách hàng"
                            : "Chặn khách hàng"
                        }
                      >
                        {customer.isBlocked ? (
                          <>
                            <Eye className="w-3 h-3 mr-1" />
                            Bỏ chặn
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 mr-1" />
                            Chặn
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {customers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {appliedSearchTerm || appliedStatusFilter
              ? "Không có khách hàng nào phù hợp với điều kiện lọc"
              : "Chưa có khách hàng nào"}
          </div>
        )}

        {totalCustomers > itemsPerPage && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
              <div className="text-sm text-gray-700">
                Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, totalCustomers)} của{" "}
                {totalCustomers} mục
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center cursor-pointer"
                  aria-label="Trang trước"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Trước
                </button>
                <div className="flex items-center space-x-1">
                  {getPaginationItems().map((item, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        typeof item === "number" && setCurrentPage(item)
                      }
                      className={`px-3 py-1 text-sm border rounded cursor-pointer ${
                        item === currentPage
                          ? "bg-blue-500 text-white border-blue-500"
                          : typeof item === "number"
                          ? "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          : "bg-white text-gray-700 border-gray-300 cursor-default"
                      } ${
                        typeof item !== "number" ? "pointer-events-none" : ""
                      }`}
                      aria-label={
                        typeof item === "number" ? `Trang ${item}` : undefined
                      }
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center cursor-pointer"
                  aria-label="Trang sau"
                >
                  Sau
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customer;
