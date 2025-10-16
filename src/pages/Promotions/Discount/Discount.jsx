"use client";

import React, { useEffect, useState, useContext } from "react";
import {
  FileText,
  Plus,
  Eye,
  EyeOff,
  X,
  Info,
  Package,
  RotateCcw,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import * as apis from "../../../apis";
import { CustomSkeletonDiscount, CustomSelect } from "../../../components";
import { AdminTechZoneContext } from "../../../context/AdminTechZoneContext";

const Discount = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [codeFilter, setCodeFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [productIdsFilter, setProductIdsFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [validityFilter, setValidityFilter] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedCodeFilter, setAppliedCodeFilter] = useState("");
  const [appliedTypeFilter, setAppliedTypeFilter] = useState("");
  const [appliedProductIdsFilter, setAppliedProductIdsFilter] = useState("");
  const [appliedStatusFilter, setAppliedStatusFilter] = useState("");
  const [appliedValidityFilter, setAppliedValidityFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [totalDiscounts, setTotalDiscounts] = useState(0);
  const [activeDiscounts, setActiveDiscounts] = useState(0);
  const [inactiveDiscounts, setInactiveDiscounts] = useState(0);
  const [validDiscounts, setValidDiscounts] = useState(0);
  const [notStartedDiscounts, setNotStartedDiscounts] = useState(0);
  const [expiredDiscounts, setExpiredDiscounts] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmDiscountId, setConfirmDiscountId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const { setError, navigate } = useContext(AdminTechZoneContext);

  const typeOptions = [
    { value: "", label: "Tất cả" },
    { value: "percentage", label: "Phần trăm" },
    { value: "fixed", label: "Cố định" },
  ];

  const statusOptions = [
    { value: "", label: "Tất cả" },
    { value: "true", label: "Hoạt động" },
    { value: "false", label: "Không hoạt động" },
  ];

  const validityOptions = [
    { value: "", label: "Tất cả" },
    { value: "notStarted", label: "Chưa bắt đầu" },
    { value: "valid", label: "Còn hạn" },
    { value: "expired", label: "Hết hạn" },
  ];

  const productOptions = [
    { value: "", label: "Tất cả" },
    ...products.map((product) => ({
      value: product._id,
      label: product.name,
    })),
  ];

  const getAllDiscounts = async (page = 1) => {
    try {
      setLoading(true);
      const query = { page };
      if (appliedSearchTerm) query.name = appliedSearchTerm;
      if (appliedCodeFilter) query.code = appliedCodeFilter;
      if (appliedTypeFilter) query.type = appliedTypeFilter;
      if (appliedProductIdsFilter) query.productIds = appliedProductIdsFilter;
      if (appliedStatusFilter) query.isActive = appliedStatusFilter;
      if (appliedValidityFilter) query.validity = appliedValidityFilter;

      const response = await apis.apiGetAllDiscounts(query);

      setDiscounts(response.discountList || []);
      setTotalDiscounts(response.summary?.totalDiscounts || 0);
      setActiveDiscounts(response.summary?.activeDiscounts || 0);
      setInactiveDiscounts(response.summary?.inactiveDiscounts || 0);
      setValidDiscounts(response.summary?.validDiscounts || 0);
      setNotStartedDiscounts(response.summary?.notStartedDiscounts || 0);
      setExpiredDiscounts(response.summary?.expiredDiscounts || 0);
      if (page === 1 && response.discountList) {
        setItemsPerPage(response.discountList.length || 1);
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

  const fetchProducts = async () => {
    try {
      const response = await apis.apiGetAllProducts({ limit: 0 });
      setProducts(response.productList || []);
    } catch (error) {
      if (error?.msg) {
        toast.error(error.msg || "Không thể tải dữ liệu. Vui lòng thử lại.");
      } else {
        setError({ hasError: true, message: "Lỗi kết nối API" });
      }
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const query = { page: 1 };
      if (searchTerm) query.name = searchTerm;
      if (codeFilter) query.code = codeFilter;
      if (typeFilter) query.type = typeFilter;
      if (productIdsFilter) query.productIds = productIdsFilter;
      if (statusFilter) query.isActive = statusFilter;
      if (validityFilter) query.validity = validityFilter;

      const response = await apis.apiGetAllDiscounts(query);

      setDiscounts(response.discountList || []);
      setTotalDiscounts(response.summary?.totalDiscounts || 0);
      setActiveDiscounts(response.summary?.activeDiscounts || 0);
      setInactiveDiscounts(response.summary?.inactiveDiscounts || 0);
      setValidDiscounts(response.summary?.validDiscounts || 0);
      setNotStartedDiscounts(response.summary?.notStartedDiscounts || 0);
      setExpiredDiscounts(response.summary?.expiredDiscounts || 0);
      if (response.discountList) {
        setItemsPerPage(response.discountList.length || 1);
      }

      setAppliedSearchTerm(searchTerm);
      setAppliedCodeFilter(codeFilter);
      setAppliedTypeFilter(typeFilter);
      setAppliedProductIdsFilter(productIdsFilter);
      setAppliedStatusFilter(statusFilter);
      setAppliedValidityFilter(validityFilter);
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
    setSearchTerm("");
    setCodeFilter("");
    setTypeFilter("");
    setProductIdsFilter("");
    setStatusFilter("");
    setValidityFilter("");
    setAppliedSearchTerm("");
    setAppliedCodeFilter("");
    setAppliedTypeFilter("");
    setAppliedProductIdsFilter("");
    setAppliedStatusFilter("");
    setAppliedValidityFilter("");
    setCurrentPage(1);

    try {
      setLoading(true);
      const response = await apis.apiGetAllDiscounts({ page: 1 });

      setDiscounts(response.discountList || []);
      setTotalDiscounts(response.summary?.totalDiscounts || 0);
      setActiveDiscounts(response.summary?.activeDiscounts || 0);
      setInactiveDiscounts(response.summary?.inactiveDiscounts || 0);
      setValidDiscounts(response.summary?.validDiscounts || 0);
      setNotStartedDiscounts(response.summary?.notStartedDiscounts || 0);
      setExpiredDiscounts(response.summary?.expiredDiscounts || 0);
      if (response.discountList) {
        setItemsPerPage(response.discountList.length || 1);
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
    getAllDiscounts(currentPage);
  }, [currentPage]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (location.state?.discountCreated) {
      getAllDiscounts(currentPage);
      toast.success(location.state.discountCreated);
      navigate(location.pathname, { replace: true, state: {} });
    } else if (location.state?.discountUpdated) {
      getAllDiscounts(currentPage);
      toast.success(location.state.discountUpdated);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, currentPage]);

  const handleToggleConfirm = (discountId, currentStatus) => {
    setConfirmDiscountId(discountId);
    setConfirmAction(currentStatus ? "hide" : "show");
    setIsConfirmModalOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!confirmDiscountId || !confirmAction) return;

    try {
      setIsConfirmLoading(true);
      const newStatus = confirmAction === "hide";
      const response = await apis.apiUpdateDiscountVisibility(
        confirmDiscountId,
        {
          isActive: !newStatus,
        }
      );

      setDiscounts((prev) =>
        prev.map((discount) =>
          discount._id === confirmDiscountId
            ? { ...discount, isActive: !newStatus }
            : discount
        )
      );
      setActiveDiscounts((prev) => (newStatus ? prev - 1 : prev + 1));
      setInactiveDiscounts((prev) => (newStatus ? prev + 1 : prev - 1));
      toast.success(response?.msg || "Thay đổi trạng thái thành công!");
    } catch (error) {
      if (error?.msg) {
        toast.error(
          error.msg ||
            "Không thể thay đổi trạng thái discount. Vui lòng thử lại."
        );
      }
    } finally {
      setIsConfirmLoading(false);
      setIsConfirmModalOpen(false);
      setConfirmDiscountId(null);
      setConfirmAction(null);
    }
  };

  const handleShowDetails = (discount) => {
    setSelectedDiscount(discount);
  };

  const handleCloseDetails = () => {
    setSelectedDiscount(null);
  };

  const getDiscountStatus = (validFrom, validTo) => {
    const today = new Date();
    const start = new Date(validFrom);
    const end = new Date(validTo);

    if (today < start) return "notStarted";
    if (today > end) return "expired";
    return "valid";
  };

  const getCurrentDatePosition = (validFrom, validTo) => {
    const today = new Date();
    const start = new Date(validFrom);
    const end = new Date(validTo);
    if (today < start || today > end) return null;
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = today.getTime() - start.getTime();
    return (elapsed / totalDuration) * 100;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const totalPages = itemsPerPage
    ? Math.ceil(totalDiscounts / itemsPerPage)
    : 1;

  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 3;

    if (totalPages > 0) items.push(1);

    const start = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
    if (start > 2) items.push("...");

    const end = Math.min(
      totalPages - 1,
      currentPage + Math.floor(maxVisiblePages / 2)
    );
    for (let i = start; i <= end; i++) {
      items.push(i);
    }

    if (end < totalPages - 1) items.push("...");
    if (totalPages > 1) items.push(totalPages);

    return items;
  };

  if (loading) {
    return <CustomSkeletonDiscount />;
  }

  return (
    <div className="p-3 sm:p-6 bg-white h-auto">
      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 p-6 border-b border-gray-200">
              Xác nhận {confirmAction === "hide" ? "Ẩn" : "Hiển thị"} discount
            </h3>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-6">
                Bạn có chắc muốn {confirmAction === "hide" ? "ẩn" : "hiển thị"}{" "}
                discount này?
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

      {/* Discount Details Modal */}
      {selectedDiscount && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Chi tiết discount</h3>
                  <p className="text-blue-100 text-sm opacity-90">
                    Thông tin chi tiết về discount
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
                    {selectedDiscount.name}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {selectedDiscount.code}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedDiscount.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedDiscount.isActive
                        ? "Hoạt động"
                        : "Không hoạt động"}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        getDiscountStatus(
                          selectedDiscount.validFrom,
                          selectedDiscount.validTo
                        ) === "valid"
                          ? "bg-blue-100 text-blue-800"
                          : getDiscountStatus(
                              selectedDiscount.validFrom,
                              selectedDiscount.validTo
                            ) === "notStarted"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {getDiscountStatus(
                        selectedDiscount.validFrom,
                        selectedDiscount.validTo
                      ) === "valid"
                        ? "Còn hạn"
                        : getDiscountStatus(
                            selectedDiscount.validFrom,
                            selectedDiscount.validTo
                          ) === "notStarted"
                        ? "Chưa bắt đầu"
                        : "Hết hạn"}
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
                          {selectedDiscount.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Info className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Loại discount
                        </p>
                        <p className="text-gray-900 mt-1 font-medium">
                          {selectedDiscount.type === "percentage"
                            ? "Phần trăm"
                            : "Cố định"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 font-bold text-sm">
                          %
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Giá trị giảm
                        </p>
                        <p className="text-gray-900 mt-1 font-bold text-lg">
                          {selectedDiscount.type === "percentage"
                            ? `${selectedDiscount.value}%`
                            : `${selectedDiscount.value.toLocaleString()} VNĐ`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h5 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200">
                    Sản phẩm áp dụng
                  </h5>
                  <div className="space-y-3">
                    {selectedDiscount.products &&
                    selectedDiscount.products.length > 0 ? (
                      selectedDiscount.products.map((product) => (
                        <div
                          key={product._id}
                          className="bg-indigo-50 rounded-lg p-3 border border-indigo-200"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Package className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-indigo-800">
                                Sản phẩm
                              </p>
                              <p className="text-indigo-900 font-medium">
                                {product.name}
                              </p>
                              <p className="text-sm text-indigo-600">
                                ID: {product._id}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                        <p className="text-sm text-indigo-600">
                          Không có sản phẩm cụ thể
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h5 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-4">
                  Thời gian hiệu lực
                </h5>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">
                        Bắt đầu
                      </p>
                      <p className="text-base sm:text-lg font-bold text-blue-600">
                        {formatDate(selectedDiscount.validFrom)}
                      </p>
                    </div>
                    <div className="flex-1 mx-2 sm:mx-4 relative">
                      <div className="w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full relative">
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-purple-500 rounded-full"></div>
                        {getCurrentDatePosition(
                          selectedDiscount.validFrom,
                          selectedDiscount.validTo
                        ) !== null && (
                          <div
                            className="absolute top-1/2 transform -translate-y-1/2 w-2 h-2 bg-yellow-500 rounded-full"
                            style={{
                              left: `${getCurrentDatePosition(
                                selectedDiscount.validFrom,
                                selectedDiscount.validTo
                              )}%`,
                            }}
                          ></div>
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">
                        Kết thúc
                      </p>
                      <p className="text-base sm:text-lg font-bold text-purple-600">
                        {formatDate(selectedDiscount.validTo)}
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
                  to={`edit/${selectedDiscount._id}`}
                  className={`px-6 py-2 text-white rounded-lg flex items-center transition-colors duration-200 font-medium ${
                    getDiscountStatus(
                      selectedDiscount.validFrom,
                      selectedDiscount.validTo
                    ) === "valid" ||
                    getDiscountStatus(
                      selectedDiscount.validFrom,
                      selectedDiscount.validTo
                    ) === "notStarted"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-400 cursor-not-allowed opacity-50"
                  }`}
                  aria-label="Chỉnh sửa discount"
                  onClick={(e) => {
                    if (
                      getDiscountStatus(
                        selectedDiscount.validFrom,
                        selectedDiscount.validTo
                      ) === "expired"
                    ) {
                      e.preventDefault();
                      toast.error("Không thể chỉnh sửa discount đã hết hạn");
                    }
                  }}
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
        <div className="flex justify-between items-center space-x-2 rounded-lg p-1">
          <Link
            to="add"
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-sm hover:bg-blue-600 flex items-center transition-colors cursor-pointer"
            aria-label="Thêm discount mới"
          >
            <Plus className="w-4 h-4 mr-2" />
            THÊM DISCOUNT
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 sm:mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Tổng discount</p>
              <p className="text-2xl font-bold text-blue-800">
                {totalDiscounts}
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
              <p className="text-sm font-medium text-green-600">
                Đang hoạt động
              </p>
              <p className="text-2xl font-bold text-green-800">
                {activeDiscounts}
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
                {inactiveDiscounts}
              </p>
            </div>
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <EyeOff className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Còn hạn</p>
              <p className="text-2xl font-bold text-blue-800">
                {validDiscounts}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">
                Chưa bắt đầu
              </p>
              <p className="text-2xl font-bold text-yellow-800">
                {notStartedDiscounts}
              </p>
            </div>
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hết hạn</p>
              <p className="text-2xl font-bold text-gray-800">
                {expiredDiscounts}
              </p>
            </div>
            <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-sm p-3 sm:p-4 mb-4 sm:mb-6 border-gray-100 border">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên discount
            </label>
            <input
              type="text"
              placeholder="Tên discount"
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã discount
            </label>
            <input
              type="text"
              placeholder="Mã discount"
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              value={codeFilter}
              onChange={(e) => setCodeFilter(e.target.value)}
            />
          </div>
          <CustomSelect
            name="typeFilter"
            options={typeOptions}
            label="Loại discount"
            placeholder="Tất cả"
            value={typeFilter}
            onChange={setTypeFilter}
            withSearch={false}
          />
          <CustomSelect
            name="productIdsFilter"
            options={productOptions}
            label="Sản phẩm áp dụng"
            placeholder="Tất cả"
            value={productIdsFilter}
            onChange={setProductIdsFilter}
            withSearch={true}
          />
          <CustomSelect
            name="statusFilter"
            options={statusOptions}
            label="Trạng thái"
            placeholder="Tất cả"
            value={statusFilter}
            onChange={setStatusFilter}
            withSearch={false}
          />
          <CustomSelect
            name="validityFilter"
            options={validityOptions}
            label="Hiệu lực"
            placeholder="Tất cả"
            value={validityFilter}
            onChange={setValidityFilter}
            withSearch={false}
          />
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
          <h2 className="text-base font-semibold">QUẢN LÝ DISCOUNT</h2>
        </div>
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  STT
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Tên discount
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Mã discount
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Loại
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Giá trị
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Thời gian hiệu lực
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Hiệu lực
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Hoạt động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {discounts.map((discount, index) => (
                <tr key={discount._id} className="hover:bg-gray-100">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {(currentPage - 1) * (itemsPerPage || 1) + index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {discount.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {discount.code}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {discount.type === "percentage" ? "Phần trăm" : "Cố định"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {discount.type === "percentage"
                      ? `${discount.value}%`
                      : `${discount.value.toLocaleString()} VNĐ`}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {formatDate(discount.validFrom)} -{" "}
                    {formatDate(discount.validTo)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        discount.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {discount.isActive ? "Hoạt động" : "Không hoạt động"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        getDiscountStatus(
                          discount.validFrom,
                          discount.validTo
                        ) === "valid"
                          ? "bg-blue-100 text-blue-800"
                          : getDiscountStatus(
                              discount.validFrom,
                              discount.validTo
                            ) === "notStarted"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {getDiscountStatus(
                        discount.validFrom,
                        discount.validTo
                      ) === "valid"
                        ? "Còn hạn"
                        : getDiscountStatus(
                            discount.validFrom,
                            discount.validTo
                          ) === "notStarted"
                        ? "Chưa bắt đầu"
                        : "Hết hạn"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <Link
                        to={`edit/${discount._id}`}
                        className={`px-3 py-1 text-xs flex items-center cursor-pointer rounded transition-colors ${
                          getDiscountStatus(
                            discount.validFrom,
                            discount.validTo
                          ) === "valid" ||
                          getDiscountStatus(
                            discount.validFrom,
                            discount.validTo
                          ) === "notStarted"
                            ? "bg-blue-500 text-white hover:bg-blue-600"
                            : "bg-gray-400 text-white opacity-50 cursor-not-allowed"
                        }`}
                        aria-label="Sửa discount"
                        onClick={(e) => {
                          if (
                            getDiscountStatus(
                              discount.validFrom,
                              discount.validTo
                            ) === "expired"
                          ) {
                            e.preventDefault();
                            toast.error(
                              "Không thể chỉnh sửa discount đã hết hạn"
                            );
                          }
                        }}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Sửa
                      </Link>
                      <button
                        onClick={() => handleShowDetails(discount)}
                        className="px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 flex items-center cursor-pointer"
                        aria-label="Xem chi tiết discount"
                      >
                        <Info className="w-3 h-3 mr-1" />
                        Chi tiết
                      </button>
                      <button
                        onClick={() =>
                          handleToggleConfirm(discount._id, discount.isActive)
                        }
                        className={`px-3 py-1 rounded text-xs flex items-center cursor-pointer transition-colors ${
                          discount.isActive
                            ? "bg-orange-500 text-white hover:bg-orange-600"
                            : "bg-green-500 text-white hover:bg-green-600"
                        }`}
                        aria-label={
                          discount.isActive
                            ? "Ẩn discount"
                            : "Hiển thị discount"
                        }
                      >
                        {discount.isActive ? (
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
            {discounts.map((discount, index) => (
              <div key={discount._id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      #{(currentPage - 1) * (itemsPerPage || 1) + index + 1} -{" "}
                      {discount.name}
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      <p>Mã: {discount.code}</p>
                      <p>
                        Giá trị:{" "}
                        {discount.type === "percentage"
                          ? `${discount.value}%`
                          : `${discount.value.toLocaleString()} VNĐ`}
                      </p>
                      <p>
                        Sản phẩm áp dụng:{" "}
                        {discount.products && discount.products.length > 0
                          ? discount.products.map((p) => p.name).join(", ")
                          : "Không có sản phẩm"}
                      </p>
                      <p>
                        Hiệu lực: {formatDate(discount.validFrom)} -{" "}
                        {formatDate(discount.validTo)}
                      </p>
                    </div>
                    <div className="mt-1 flex space-x-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          discount.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {discount.isActive ? "Hoạt động" : "Không hoạt động"}
                      </span>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          getDiscountStatus(
                            discount.validFrom,
                            discount.validTo
                          ) === "valid"
                            ? "bg-blue-100 text-blue-800"
                            : getDiscountStatus(
                                discount.validFrom,
                                discount.validTo
                              ) === "notStarted"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {getDiscountStatus(
                          discount.validFrom,
                          discount.validTo
                        ) === "valid"
                          ? "Còn hạn"
                          : getDiscountStatus(
                              discount.validFrom,
                              discount.validTo
                            ) === "notStarted"
                          ? "Chưa bắt đầu"
                          : "Hết hạn"}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`edit/${discount._id}`}
                      className={`px-3 py-1 text-xs flex items-center cursor-pointer rounded transition-colors ${
                        getDiscountStatus(
                          discount.validFrom,
                          discount.validTo
                        ) === "valid" ||
                        getDiscountStatus(
                          discount.validFrom,
                          discount.validTo
                        ) === "notStarted"
                          ? "bg-blue-500 text-white hover:bg-blue-600"
                          : "bg-gray-400 text-white opacity-50 cursor-not-allowed"
                      }`}
                      aria-label="Sửa discount"
                      onClick={(e) => {
                        if (
                          getDiscountStatus(
                            discount.validFrom,
                            discount.validTo
                          ) === "expired"
                        ) {
                          e.preventDefault();
                          toast.error(
                            "Không thể chỉnh sửa discount đã hết hạn"
                          );
                        }
                      }}
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      Sửa
                    </Link>
                    <button
                      onClick={() => handleShowDetails(discount)}
                      className="px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 flex items-center cursor-pointer"
                      aria-label="Xem chi tiết discount"
                    >
                      <Info className="w-3 h-3 mr-1" />
                      Chi tiết
                    </button>
                    <button
                      onClick={() =>
                        handleToggleConfirm(discount._id, discount.isActive)
                      }
                      className={`px-3 py-1 rounded text-xs flex items-center cursor-pointer transition-colors ${
                        discount.isActive
                          ? "bg-orange-500 text-white hover:bg-orange-600"
                          : "bg-green-500 text-white hover:bg-green-600"
                      }`}
                      aria-label={
                        discount.isActive ? "Ẩn discount" : "Hiển thị discount"
                      }
                    >
                      {discount.isActive ? (
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
        {discounts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {appliedSearchTerm ||
            appliedCodeFilter ||
            appliedTypeFilter ||
            appliedProductIdsFilter ||
            appliedStatusFilter ||
            appliedValidityFilter
              ? "Không có discount nào phù hợp với điều kiện lọc"
              : "Chưa có discount nào"}
          </div>
        )}
        {totalDiscounts > (itemsPerPage || 1) && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
              <div className="text-sm text-gray-700">
                Hiển thị {(currentPage - 1) * (itemsPerPage || 1) + 1} -{" "}
                {Math.min(currentPage * (itemsPerPage || 1), totalDiscounts)}{" "}
                của {totalDiscounts} mục
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
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discount;
