"use client";

import React, { useEffect, useState, useContext } from "react";
import {
  FileText,
  Plus,
  Package,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Info,
  RotateCcw,
} from "lucide-react";
import * as apis from "../../../apis";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { CustomSkeletonSupplier, CustomSelect } from "../../../components";
import { AdminTechZoneContext } from "../../../context/AdminTechZoneContext";

const usePhoneFilter = () => {
  const [phoneFilter, setPhoneFilter] = useState("");

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setPhoneFilter(value);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const cleanedValue = pastedData.replace(/[^0-9]/g, "");
    setPhoneFilter(cleanedValue);
  };

  const validatePhone = () => {
    if (phoneFilter) {
      if (!/^\d+$/.test(phoneFilter)) {
        toast.error("Số điện thoại chỉ được chứa các chữ số.");
        return false;
      }
      if (phoneFilter.length < 8 || phoneFilter.length > 15) {
        toast.error("Số điện thoại phải có 8-15 chữ số.");
        return false;
      }
    }
    return true;
  };

  return {
    phoneFilter,
    setPhoneFilter,
    handlePhoneChange,
    handlePaste,
    validatePhone,
  };
};

const useEmailFilter = () => {
  const [emailFilter, setEmailFilter] = useState("");

  const handleEmailChange = (e) => {
    setEmailFilter(e.target.value);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      toast.error("Vui lòng nhập email hợp lệ.");
      return false;
    }
    return true;
  };

  return { emailFilter, setEmailFilter, handleEmailChange, validateEmail };
};

const Supplier = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [appliedNameFilter, setAppliedNameFilter] = useState("");
  const [appliedPhoneFilter, setAppliedPhoneFilter] = useState("");
  const [appliedEmailFilter, setAppliedEmailFilter] = useState("");
  const [appliedStatusFilter, setAppliedStatusFilter] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [activeSuppliers, setActiveSuppliers] = useState(0);
  const [inactiveSuppliers, setInactiveSuppliers] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmSupplierId, setConfirmSupplierId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  const { setError, navigate } = useContext(AdminTechZoneContext);

  const {
    phoneFilter: phoneInput,
    setPhoneFilter,
    handlePhoneChange,
    validatePhone,
    handlePaste,
  } = usePhoneFilter();
  const {
    emailFilter: emailInput,
    setEmailFilter,
    handleEmailChange,
    validateEmail,
  } = useEmailFilter();

  const statusOptions = [
    { value: "", label: "Tất cả" },
    { value: "true", label: "Hoạt động" },
    { value: "false", label: "Không hoạt động" },
  ];

  const getAllSuppliers = async (page = 1) => {
    try {
      setLoading(true);
      setError("");
      const query = { page };
      if (appliedNameFilter) query.name = appliedNameFilter;
      if (appliedPhoneFilter) query.phone = appliedPhoneFilter;
      if (appliedEmailFilter) query.email = appliedEmailFilter;
      if (appliedStatusFilter) query.isActive = appliedStatusFilter;
      const response = await apis.apiGetAllSuppliers(query);

      setSuppliers(response.supplierList || []);
      setTotalSuppliers(response.totalSuppliers || 0);
      setActiveSuppliers(response.activeSuppliers || 0);
      setInactiveSuppliers(response.inactiveSuppliers || 0);
      if (page === 1 && response.supplierList) {
        setItemsPerPage(response.supplierList.length || 1);
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

  const handleSearch = () => {
    let isValid = true;

    if (!validatePhone()) {
      isValid = false;
    }

    if (!validateEmail(emailInput)) {
      isValid = false;
    }

    if (isValid) {
      setAppliedNameFilter(nameFilter);
      setAppliedPhoneFilter(phoneInput);
      setAppliedEmailFilter(emailInput);
      setAppliedStatusFilter(statusFilter);
      setCurrentPage(1);
    }
  };

  const handleResetFilters = async () => {
    setNameFilter("");
    setPhoneFilter("");
    setEmailFilter("");
    setStatusFilter("");
    setAppliedNameFilter("");
    setAppliedPhoneFilter("");
    setAppliedEmailFilter("");
    setAppliedStatusFilter("");
    setCurrentPage(1);
  };

  const handleToggleConfirm = (supplierId, currentStatus) => {
    setConfirmSupplierId(supplierId);
    setConfirmAction(currentStatus ? "hide" : "show");
    setIsConfirmModalOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!confirmSupplierId || !confirmAction) return;

    try {
      setIsConfirmLoading(true);
      const newStatus = confirmAction === "hide";
      const response = await apis.apiUpdateSupplierVisibility(
        confirmSupplierId,
        {
          isActive: !newStatus,
        }
      );

      setSuppliers((prev) =>
        prev.map((supplier) =>
          supplier._id === confirmSupplierId
            ? { ...supplier, isActive: !newStatus }
            : supplier
        )
      );
      setActiveSuppliers((prev) => (newStatus ? prev - 1 : prev + 1));
      setInactiveSuppliers((prev) => (newStatus ? prev + 1 : prev - 1));
      toast.success(response?.msg || "Thay đổi trạng thái thành công");
    } catch (error) {
      if (error?.msg) {
        toast.error(error.msg || "Không thể tải dữ liệu. Vui lòng thử lại.");
      }
    } finally {
      setIsConfirmLoading(false);
      setIsConfirmModalOpen(false);
      setConfirmSupplierId(null);
      setConfirmAction(null);
    }
  };

  const handleShowDetails = (supplier) => {
    setSelectedSupplier(supplier);
  };

  const handleCloseDetails = () => {
    setSelectedSupplier(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  useEffect(() => {
    getAllSuppliers(currentPage);
  }, [
    currentPage,
    appliedNameFilter,
    appliedPhoneFilter,
    appliedEmailFilter,
    appliedStatusFilter,
  ]);

  useEffect(() => {
    if (location.state?.supplierCreated) {
      getAllSuppliers(currentPage);
      toast.success(location.state.supplierCreated);
      navigate(location.pathname, { replace: true, state: {} });
    } else if (location.state?.supplierUpdated) {
      getAllSuppliers(currentPage);
      toast.success(location.state.supplierUpdated);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, currentPage]);

  const totalPages = itemsPerPage
    ? Math.ceil(totalSuppliers / itemsPerPage)
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
    return <CustomSkeletonSupplier />;
  }

  return (
    <div className="p-3 sm:p-6 bg-white h-auto">
      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 p-6 border-b border-gray-200">
              Xác nhận {confirmAction === "hide" ? "Ẩn" : "Hiển thị"} nhà cung
              cấp
            </h3>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-6">
                Bạn có chắc muốn {confirmAction === "hide" ? "ẩn" : "hiển thị"}{" "}
                nhà cung cấp này?
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
                    confirmAction === "hide"
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "bg-green-500 hover:bg-green-600"
                  } ${isConfirmLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={handleConfirmToggle}
                  aria-label={
                    confirmAction === "hide"
                      ? "Xác nhận ẩn"
                      : "Xác nhận hiển thị"
                  }
                  disabled={isConfirmLoading}
                >
                  {isConfirmLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Đang xử lý...
                    </>
                  ) : confirmAction === "hide" ? (
                    "Ẩn"
                  ) : (
                    "Hiển thị"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    Chi tiết nhà cung cấp
                  </h3>
                  <p className="text-blue-100 text-sm opacity-90">
                    Thông tin chi tiết về nhà cung cấp
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
            <div className="p-6 overflow-y-auto flex-1 min-h-0">
              <div className="mb-6">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border-l-4 border-blue-500">
                  <h4 className="text-xl font-bold text-gray-800 mb-2">
                    {selectedSupplier.name}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {selectedSupplier.code}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedSupplier.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedSupplier.isActive
                        ? "Hoạt động"
                        : "Không hoạt động"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          Mô tả
                        </p>
                        <p className="text-gray-900 mt-1">
                          {selectedSupplier.description || "Không có mô tả"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Info className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Người liên hệ
                        </p>
                        <p className="text-gray-900 mt-1 font-medium">
                          {selectedSupplier.contactPersonName || "Không có"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Package className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Tên viết tắt
                        </p>
                        <p className="text-gray-900 mt-1 font-medium">
                          {selectedSupplier.shortName || "Không có"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h5 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200">
                    Thông tin liên hệ
                  </h5>
                  <div className="space-y-3">
                    <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                      <p className="text-sm font-medium text-orange-800">
                        Địa chỉ
                      </p>
                      <p className="text-orange-900 font-medium">
                        {selectedSupplier.fullAddress || "Không có"}
                      </p>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                      <p className="text-sm font-medium text-indigo-800">
                        Số điện thoại
                      </p>
                      <p className="text-indigo-900 font-medium">
                        {selectedSupplier.phone || "Không có"}
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <p className="text-sm font-medium text-blue-800">Email</p>
                      <p className="text-blue-900 font-medium">
                        {selectedSupplier.email || "Không có"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h5 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-4">
                  Thời gian
                </h5>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">
                        Tạo ngày
                      </p>
                      <p className="text-base sm:text-lg font-bold text-blue-600">
                        {formatDate(selectedSupplier.createdAt)}
                      </p>
                    </div>
                    <div className="flex-1 mx-2 sm:mx-4 relative">
                      <div className="w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">
                        Cập nhật ngày
                      </p>
                      <p className="text-base sm:text-lg font-bold text-purple-600">
                        {formatDate(selectedSupplier.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex-shrink-0">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCloseDetails}
                  className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium cursor-pointer"
                  aria-label="Đóng chi tiết"
                >
                  Đóng
                </button>
                <Link
                  to={`edit/${selectedSupplier._id}`}
                  className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center transition-colors duration-200 font-medium cursor-pointer"
                  aria-label="Chỉnh sửa nhà cung cấp"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="mb-4 sm:mb-6">
        <div className="hidden sm:flex justify-between items-center rounded-lg p-1">
          <div className="flex space-x-1">
            <Link
              to="add"
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-sm hover:bg-blue-600 flex items-center transition-colors cursor-pointer"
              aria-label="Thêm nhà cung cấp mới"
            >
              <Plus className="w-4 h-4 mr-2" />
              THÊM NHÀ CUNG CẤP
            </Link>
            <Link
              to="/products/product-management"
              className="px-4 py-2 text-sm bg-orange-500 text-white rounded-sm hover:bg-orange-600 flex items-center transition-colors cursor-pointer"
              aria-label="Quản lý sản phẩm"
            >
              <Package className="w-4 h-4 mr-2" />
              QUẢN LÝ SẢN PHẨM
            </Link>
          </div>
        </div>
        <div className="sm:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-full px-4 py-3 bg-blue-500 text-white rounded-sm hover:bg-blue-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
          >
            {isMobileMenuOpen ? (
              <X className="w-4 h-4 mr-2" />
            ) : (
              <Menu className="w-4 h-4 mr-2" />
            )}
            MENU
          </button>
          {isMobileMenuOpen && (
            <div className="mt-2 space-y-2 bg-white border border-gray-200 rounded-sm shadow-lg p-2">
              <Link
                to="add"
                className="w-full px-4 py-2 text-sm bg-blue-500 text-white rounded-sm hover:bg-blue-600 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Thêm nhà cung cấp mới"
              >
                <Plus className="w-4 h-4 mr-2" />
                THÊM NHÀ CUNG CẤP
              </Link>
              <Link
                to="/products/product-management"
                className="w-full px-4 py-2 text-sm bg-orange-500 text-white rounded-sm hover:bg-orange-600 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Quản lý sản phẩm"
              >
                <Package className="w-4 h-4 mr-2" />
                QUẢN LÝ SẢN PHẨM
              </Link>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 sm:mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Tổng nhà cung cấp
              </p>
              <p className="text-2xl font-bold text-blue-800">
                {totalSuppliers}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">
                Đang hoạt động
              </p>
              <p className="text-2xl font-bold text-green-800">
                {activeSuppliers}
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
              <p className="text-sm font-medium text-red-600">
                Không hoạt động
              </p>
              <p className="text-2xl font-bold text-red-800">
                {inactiveSuppliers}
              </p>
            </div>
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <EyeOff className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-sm p-3 sm:p-4 mb-4 sm:mb-6 border-gray-100 border">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên nhà cung cấp
            </label>
            <input
              type="text"
              placeholder="Tên nhà cung cấp"
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              aria-label="Tìm kiếm theo tên nhà cung cấp"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại
            </label>
            <div className="w-full relative">
              <input
                type="tel"
                pattern="[0-9]*"
                placeholder="Số điện thoại"
                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                value={phoneInput}
                onChange={handlePhoneChange}
                onPaste={handlePaste}
                aria-label="Tìm kiếm theo số điện thoại"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="w-full relative">
              <input
                type="email"
                placeholder="Email"
                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                value={emailInput}
                onChange={handleEmailChange}
                aria-label="Tìm kiếm theo email"
              />
            </div>
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
            className="px-4 py-2 text-sm bg-gray-500 text-white rounded-sm hover:bg-gray-600 flex items-center transition-colors cursor-pointer"
            aria-label="Xóa bộ lọc"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            XÓA BỘ LỌC
          </button>
        </div>
      </div>
      <div className="bg-white rounded-sm shadow-md">
        <div className="bg-[#00D5BE] text-white p-3 rounded-t-sm flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <h2 className="text-base font-semibold">QUẢN LÝ NHÀ CUNG CẤP</h2>
        </div>
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  STT
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Tên nhà cung cấp
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Địa chỉ
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Số điện thoại
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Email
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
              {suppliers.map((supplier, index) => (
                <tr key={supplier._id} className="hover:bg-gray-100">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {(currentPage - 1) * (itemsPerPage || 1) + index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {supplier.name}
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate"
                    title={supplier.fullAddress}
                  >
                    {supplier.fullAddress}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {supplier.phone}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {supplier.email}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        supplier.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {supplier.isActive ? "Hoạt động" : "Không hoạt động"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <Link
                        to={`edit/${supplier._id}`}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 flex items-center cursor-pointer"
                        aria-label="Sửa nhà cung cấp"
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Sửa
                      </Link>
                      <button
                        onClick={() => handleShowDetails(supplier)}
                        className="px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 flex items-center cursor-pointer"
                        aria-label="Xem chi tiết nhà cung cấp"
                      >
                        <Info className="w-3 h-3 mr-1" />
                        Chi tiết
                      </button>
                      <button
                        onClick={() =>
                          handleToggleConfirm(supplier._id, supplier.isActive)
                        }
                        className={`px-3 py-1 rounded text-xs flex items-center cursor-pointer transition-colors ${
                          supplier.isActive
                            ? "bg-orange-500 text-white hover:bg-orange-600"
                            : "bg-green-500 text-white hover:bg-green-600"
                        }`}
                        aria-label={
                          supplier.isActive
                            ? "Ẩn nhà cung cấp"
                            : "Hiển thị nhà cung cấp"
                        }
                      >
                        {supplier.isActive ? (
                          <>
                            <EyeOff className="w-3 h-3 mr-1" />
                            Ẩn
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3 mr-1" />
                            Hiện
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
            {suppliers.map((supplier, index) => (
              <div key={supplier._id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      #{(currentPage - 1) * (itemsPerPage || 1) + index + 1} -{" "}
                      {supplier.name}
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      <p className="truncate" title={supplier.fullAddress}>
                        {supplier.fullAddress}
                      </p>
                      <p>SĐT: {supplier.phone}</p>
                      <p>Email: {supplier.email}</p>
                    </div>
                    <div className="mt-1">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          supplier.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {supplier.isActive ? "Hoạt động" : "Không hoạt động"}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2 flex-shrink-0">
                    <Link
                      to={`edit/${supplier._id}`}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 flex items-center cursor-pointer"
                      aria-label="Sửa nhà cung cấp"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      Sửa
                    </Link>
                    <button
                      onClick={() => handleShowDetails(supplier)}
                      className="px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 flex items-center cursor-pointer"
                      aria-label="Xem chi tiết nhà cung cấp"
                    >
                      <Info className="w-3 h-3 mr-1" />
                      Chi tiết
                    </button>
                    <button
                      onClick={() =>
                        handleToggleConfirm(supplier._id, supplier.isActive)
                      }
                      className={`px-3 py-1 rounded text-xs flex items-center cursor-pointer transition-colors ${
                        supplier.isActive
                          ? "bg-orange-500 text-white hover:bg-orange-600"
                          : "bg-green-500 text-white hover:bg-green-600"
                      }`}
                      aria-label={
                        supplier.isActive
                          ? "Ẩn nhà cung cấp"
                          : "Hiển thị nhà cung cấp"
                      }
                    >
                      {supplier.isActive ? (
                        <>
                          <EyeOff className="w-3 h-3 mr-1" />
                          Ẩn
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3 mr-1" />
                          Hiện
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {suppliers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {appliedNameFilter ||
            appliedPhoneFilter ||
            appliedEmailFilter ||
            appliedStatusFilter
              ? "Không có nhà cung cấp nào phù hợp với điều kiện lọc"
              : "Chưa có nhà cung cấp nào"}
          </div>
        )}
        {totalSuppliers > (itemsPerPage || 1) && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
              <div className="text-sm text-gray-700">
                Hiển thị {(currentPage - 1) * (itemsPerPage || 1) + 1} -{" "}
                {Math.min(currentPage * (itemsPerPage || 1), totalSuppliers)}{" "}
                của {totalSuppliers} mục
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

export default Supplier;
