"use client";

import { useEffect, useState, useContext } from "react";
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
import { CustomSkeletonExportReceipt, CustomSelect } from "../../../components";
import { AdminTechZoneContext } from "../../../context/AdminTechZoneContext";

const ExportReceipt = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [exportReceipts, setExportReceipts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [codeFilter, setCodeFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [appliedCodeFilter, setAppliedCodeFilter] = useState("");
  const [appliedBranchFilter, setAppliedBranchFilter] = useState("");
  const [appliedStatusFilter, setAppliedStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmReceiptId, setConfirmReceiptId] = useState(null);
  const [totalReceipts, setTotalReceipts] = useState(0);
  const [approvedReceipts, setApprovedReceipts] = useState(0);
  const [canceledReceipts, setCanceledReceipts] = useState(0);
  const [pendingReceipts, setPendingReceipts] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(null);

  const { setError, navigate } = useContext(AdminTechZoneContext);

  const getReasonInVietnamese = (reason) => {
    const reasonMap = {
      sale: "Bán hàng",
      return: "Trả hàng",
      damage: "Hàng hỏng",
      other: "Khác",
    };
    return reasonMap[reason] || reason || "Không xác định";
  };

  const getAllExportReceipts = async (page = 1) => {
    try {
      setLoading(true);
      const query = { page };
      if (appliedCodeFilter) query.code = appliedCodeFilter;
      if (appliedBranchFilter) query.branchId = appliedBranchFilter;
      if (appliedStatusFilter) query.status = appliedStatusFilter;

      const response = await apis.apiGetAllExportReceipts(query);

      setExportReceipts(response.exportReceiptList || []);
      setTotalReceipts(response.totalReceipts || 0);
      setApprovedReceipts(response.approvedReceipts || 0);
      setCanceledReceipts(response.canceledReceipts || 0);
      setPendingReceipts(response.pendingReceipts || 0);
      if (page === 1 && response.exportReceiptList) {
        setItemsPerPage(response.exportReceiptList.length || 5);
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

  const fetchBranches = async () => {
    try {
      const response = await apis.apiGetAllBranches({
        limit: 0,
        isActive: true,
      });

      setBranches(response.branchList);
    } catch (error) {
      if (error?.msg) {
        toast.error(error.msg || "Không thể tải dữ liệu. Vui lòng thử lại.");
      } else {
        setError({ hasError: true, message: "Lỗi kết nối API" });
      }
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await apis.apiGetAllProductItems({ limit: 0 });

      setProducts(response.productItemList || []);
    } catch (error) {
      if (error?.msg) {
        toast.error(error.msg || "Không thể tải dữ liệu. Vui lòng thử lại.");
      } else {
        setError({ hasError: true, message: "Lỗi kết nối API" });
      }
    }
  };

  const handleSearch = () => {
    setAppliedCodeFilter(codeFilter);
    setAppliedBranchFilter(branchFilter);
    setAppliedStatusFilter(statusFilter);
    setCurrentPage(1);
  };

  const handleResetFilters = async () => {
    setCodeFilter("");
    setBranchFilter("");
    setStatusFilter("");
    setAppliedCodeFilter("");
    setAppliedBranchFilter("");
    setAppliedStatusFilter("");
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchBranches();
    fetchProducts();
  }, []);

  useEffect(() => {
    getAllExportReceipts(currentPage);
  }, [
    currentPage,
    appliedCodeFilter,
    appliedBranchFilter,
    appliedStatusFilter,
  ]);

  useEffect(() => {
    if (location.state?.exportReceiptCreated) {
      toast.success(location.state.exportReceiptCreated);
      getAllExportReceipts(currentPage);
      navigate(location.pathname, { replace: true, state: {} });
    } else if (location.state?.exportReceiptUpdated) {
      toast.success(location.state.exportReceiptUpdated);
      getAllExportReceipts(currentPage);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, currentPage]);

  const handleApproveReceipt = async (receiptId, receiptStatus) => {
    try {
      if (receiptStatus !== "pending") {
        toast.error(
          "Chỉ có thể phê duyệt phiếu xuất kho ở trạng thái Đang chờ"
        );
        return;
      }

      const response = await apis.apiApproveExportReceipt(receiptId);

      setExportReceipts((prev) =>
        prev.map((receipt) =>
          receipt._id === receiptId
            ? { ...receipt, status: "approved" }
            : receipt
        )
      );
      setSelectedReceipt((prev) =>
        prev && prev._id === receiptId ? { ...prev, status: "approved" } : prev
      );
      setApprovedReceipts((prev) => prev + 1);
      setPendingReceipts((prev) => prev - 1);
      toast.success(response?.msg || "Phê duyệt phiếu xuất kho thành công");
    } catch (error) {
      if (error?.msg) {
        toast.error(
          error.msg || "Lỗi khi phê duyệt phiếu xuất kho. Vui lòng thử lại."
        );
      }
    }
  };

  const handleCancelReceipt = async (receiptId, receiptStatus) => {
    try {
      if (receiptStatus !== "pending") {
        toast.error("Chỉ có thể hủy phiếu xuất kho ở trạng thái Đang chờ");
        return;
      }

      const response = await apis.apiCancelExportReceipt(receiptId);
      setExportReceipts((prev) =>
        prev.map((receipt) =>
          receipt._id === receiptId
            ? { ...receipt, status: "canceled" }
            : receipt
        )
      );
      setSelectedReceipt((prev) =>
        prev && prev._id === receiptId ? { ...prev, status: "canceled" } : prev
      );
      setCanceledReceipts((prev) => prev + 1);
      setPendingReceipts((prev) => prev - 1);
      toast.success(response?.msg || "Hủy phiếu xuất kho thành công");
    } catch (error) {
      if (error?.msg) {
        toast.error(
          error.msg || "Lỗi khi hủy phiếu xuất kho. Vui lòng thử lại."
        );
      }
    }
  };

  const handleShowDetails = async (receipt) => {
    try {
      const response = await apis.apiGetExportReceipt(receipt._id);

      setSelectedReceipt(response.exportReceipt);
    } catch (error) {
      if (error?.msg) {
        toast.error(error.msg || "Không thể tải dữ liệu. Vui lòng thử lại.");
      } else {
        setError({ hasError: true, message: "Lỗi kết nối API" });
      }
    }
  };

  const handleCloseDetails = () => {
    setSelectedReceipt(null);
  };

  const handleOpenConfirmModal = (action, receiptId, receiptStatus) => {
    if (receiptStatus !== "pending") {
      toast.error(
        `Chỉ có thể ${
          action === "approve" ? "phê duyệt" : "hủy"
        } phiếu xuất kho ở trạng thái Đang chờ`
      );
      return;
    }
    setConfirmAction(action);
    setConfirmReceiptId(receiptId);
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    try {
      setIsConfirmLoading(true);
      if (confirmAction === "approve") {
        await handleApproveReceipt(confirmReceiptId, "pending");
      } else if (confirmAction === "cancel") {
        await handleCancelReceipt(confirmReceiptId, "pending");
      }
      setShowConfirmModal(false);
      setConfirmAction(null);
      setConfirmReceiptId(null);
    } finally {
      setIsConfirmLoading(false);
    }
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmReceiptId(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const totalPages = itemsPerPage ? Math.ceil(totalReceipts / itemsPerPage) : 1;

  const branchOptions = [
    { value: "", label: "Tất cả" },
    ...branches.map((branch) => ({ value: branch._id, label: branch.name })),
  ];

  const statusOptions = [
    { value: "", label: "Tất cả" },
    { value: "pending", label: "Đang chờ" },
    { value: "approved", label: "Đã phê duyệt" },
    { value: "canceled", label: "Đã hủy" },
  ];

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
    return <CustomSkeletonExportReceipt />;
  }

  return (
    <div className="p-3 sm:p-6 bg-white h-auto">
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-auto transform transition-all duration-300 ease-in-out scale-100">
            <h3 className="text-lg font-medium text-gray-900 p-6 border-b border-gray-200">
              {confirmAction === "approve"
                ? "Xác nhận phê duyệt"
                : "Xác nhận hủy"}
            </h3>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-6">
                Bạn có chắc chắn muốn{" "}
                {confirmAction === "approve" ? "phê duyệt" : "hủy"} phiếu xuất
                kho này?
              </p>
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={handleCloseConfirmModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 cursor-pointer transition-colors duration-200 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Hủy bỏ hành động"
                  disabled={isConfirmLoading}
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleConfirmAction}
                  className={`px-4 py-2 rounded-md font-medium transition-colors w-full sm:w-auto cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
                    confirmAction === "approve"
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                  aria-label={
                    confirmAction === "approve"
                      ? "Xác nhận phê duyệt"
                      : "Xác nhận hủy"
                  }
                  disabled={isConfirmLoading}
                >
                  {isConfirmLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    "Xác nhận"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl flex flex-col max-h-[90vh] transform transition-all duration-300 ease-in-out scale-100">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    Chi tiết phiếu xuất kho
                  </h3>
                  <p className="text-blue-100 text-sm opacity-90">
                    Thông tin chi tiết về phiếu xuất kho
                  </p>
                </div>
                <button
                  onClick={handleCloseDetails}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200 cursor-pointer"
                  aria-label="Đóng chi tiết"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1 min-h-0">
              <div className="mb-6">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border-l-4 border-blue-500">
                  <h4 className="text-lg font-bold text-gray-800 mb-2">
                    {selectedReceipt.code}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedReceipt.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : selectedReceipt.status === "canceled"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {selectedReceipt.status === "approved"
                        ? "Đã phê duyệt"
                        : selectedReceipt.status === "canceled"
                        ? "Đã hủy"
                        : "Đang chờ"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200">
                    Thông tin cơ bản
                  </h5>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Ghi chú
                        </p>
                        <p className="text-gray-900 mt-1">
                          {selectedReceipt.note || "Không có ghi chú"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Info className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Chi nhánh
                        </p>
                        <p className="text-gray-900 mt-1 font-medium">
                          {branches.find(
                            (b) => b._id === selectedReceipt.branchId
                          )?.name || "Không xác định"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Info className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Lý do xuất
                        </p>
                        <p className="text-gray-900 mt-1 font-medium">
                          {getReasonInVietnamese(selectedReceipt.reason)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h5 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200">
                    Danh sách sản phẩm
                  </h5>
                  <div className="space-y-3">
                    {selectedReceipt.items &&
                    selectedReceipt.items.length > 0 ? (
                      selectedReceipt.items.map((item, index) => {
                        const product = products.find(
                          (p) => p._id === item.productItemId
                        );
                        return (
                          <div
                            key={index}
                            className="bg-indigo-50 rounded-lg p-3 border border-indigo-200"
                          >
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Package className="w-4 h-4 text-indigo-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-indigo-800">
                                  Sản phẩm {index + 1}
                                </p>
                                <p className="text-indigo-900 font-medium">
                                  {product
                                    ? `${product.name} (${
                                        product.attributes
                                          ?.map(
                                            (attr) =>
                                              `${attr.code}: ${attr.value}`
                                          )
                                          .join(", ") || "No attributes"
                                      })`
                                    : `ID: ${item.productItemId}`}
                                </p>
                                <p className="text-sm text-indigo-600">
                                  Số lượng:{" "}
                                  {item.quantity.toLocaleString("vi-VN")}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                        <p className="text-sm text-indigo-600">
                          Không có sản phẩm
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h5 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-4">
                  Thời gian
                </h5>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">
                        Tạo ngày
                      </p>
                      <p className="text-base font-bold text-blue-600">
                        {formatDate(selectedReceipt.createdAt)}
                      </p>
                    </div>
                    <div className="flex-1 mx-2 sm:mx-4 relative">
                      <div className="w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full relative">
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-purple-500 rounded-full"></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">
                        Cập nhật
                      </p>
                      <p className="text-base font-bold text-purple-600">
                        {formatDate(selectedReceipt.updatedAt)}
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
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 font-medium cursor-pointer"
                  aria-label="Đóng chi tiết"
                >
                  Đóng
                </button>
                {selectedReceipt.status === "pending" && (
                  <Link
                    to={`edit/${selectedReceipt._id}`}
                    className="px-4 py-2 text-white bg-blue-600 rounded-md flex items-center transition-colors duration-200 font-medium cursor-pointer hover:bg-blue-700"
                    aria-label="Chỉnh sửa phiếu xuất kho"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Chỉnh sửa
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 sm:mb-6">
        <div className="flex space-x-1 rounded-lg p-1">
          <Link
            to="add"
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-sm hover:bg-blue-600 flex items-center transition-colors cursor-pointer"
            aria-label="Thêm phiếu xuất kho mới"
          >
            <Plus className="w-4 h-4 mr-2" />
            THÊM PHIẾU XUẤT KHO
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4 sm:mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Tổng phiếu xuất kho
              </p>
              <p className="text-2xl font-bold text-blue-800">
                {totalReceipts}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-blue-200 rounded-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Đã phê duyệt</p>
              <p className="text-2xl font-bold text-green-800">
                {approvedReceipts}
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
              <p className="text-sm font-medium text-red-600">Đã hủy</p>
              <p className="text-2xl font-bold text-red-800">
                {canceledReceipts}
              </p>
            </div>
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <EyeOff className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Đang chờ</p>
              <p className="text-2xl font-bold text-yellow-800">
                {pendingReceipts}
              </p>
            </div>
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-sm p-3 sm:p-4 mb-4 sm:mb-6 border-gray-100 border">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã phiếu xuất
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Mã phiếu xuất"
                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                value={codeFilter}
                onChange={(e) => setCodeFilter(e.target.value)}
              />
            </div>
          </div>
          <div>
            <CustomSelect
              name="branchFilter"
              options={branchOptions}
              label="Chi nhánh"
              placeholder="Tất cả"
              value={branchFilter}
              onChange={(value) => setBranchFilter(value)}
              withSearch={true}
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
          <h2 className="text-base font-semibold">QUẢN LÝ XUẤT KHO</h2>
        </div>

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  STT
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Mã phiếu
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Chi nhánh
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Lý do xuất
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
              {exportReceipts.map((receipt, index) => (
                <tr key={receipt._id} className="hover:bg-gray-100">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {(currentPage - 1) * (itemsPerPage || 5) + index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {receipt.code}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {branches.find((b) => b._id === receipt.branchId)?.name ||
                      "Không xác định"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {getReasonInVietnamese(receipt.reason)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        receipt.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : receipt.status === "canceled"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {receipt.status === "approved"
                        ? "Đã phê duyệt"
                        : receipt.status === "canceled"
                        ? "Đã hủy"
                        : "Đang chờ"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      {receipt.status === "pending" && (
                        <>
                          <Link
                            to={`edit/${receipt._id}`}
                            className="px-3 py-1 text-xs flex items-center cursor-pointer rounded transition-colors bg-blue-500 text-white hover:bg-blue-600"
                            aria-label="Sửa phiếu xuất kho"
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            Sửa
                          </Link>
                          <button
                            onClick={() =>
                              handleOpenConfirmModal(
                                "approve",
                                receipt._id,
                                receipt.status
                              )
                            }
                            className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 flex items-center cursor-pointer"
                            aria-label="Phê duyệt phiếu xuất kho"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Phê duyệt
                          </button>
                          <button
                            onClick={() =>
                              handleOpenConfirmModal(
                                "cancel",
                                receipt._id,
                                receipt.status
                              )
                            }
                            className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 flex items-center cursor-pointer"
                            aria-label="Hủy phiếu xuất kho"
                          >
                            <EyeOff className="w-3 h-3 mr-1" />
                            Hủy
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleShowDetails(receipt)}
                        className="px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 flex items-center cursor-pointer"
                        aria-label="Xem chi tiết phiếu xuất kho"
                      >
                        <Info className="w-3 h-3 mr-1" />
                        Chi tiết
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
            {exportReceipts.map((receipt, index) => (
              <div key={receipt._id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-col space-y-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      #{(currentPage - 1) * (itemsPerPage || 5) + index + 1} -{" "}
                      {receipt.code}
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      <p>
                        Chi nhánh:{" "}
                        {branches.find((b) => b._id === receipt.branchId)
                          ?.name || "Không xác định"}
                      </p>
                      <p>Lý do xuất: {getReasonInVietnamese(receipt.reason)}</p>
                    </div>
                    <div className="mt-1">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          receipt.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : receipt.status === "canceled"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {receipt.status === "approved"
                          ? "Đã phê duyệt"
                          : receipt.status === "canceled"
                          ? "Đã hủy"
                          : "Đang chờ"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-row flex-wrap gap-2">
                    {receipt.status === "pending" && (
                      <>
                        <Link
                          to={`edit/${receipt._id}`}
                          className="px-2 py-1 text-xs flex items-center rounded transition-colors bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                          aria-label="Sửa phiếu xuất kho"
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          Sửa
                        </Link>
                        <button
                          onClick={() =>
                            handleOpenConfirmModal(
                              "approve",
                              receipt._id,
                              receipt.status
                            )
                          }
                          className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 flex items-center cursor-pointer"
                          aria-label="Phê duyệt phiếu xuất kho"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Phê duyệt
                        </button>
                        <button
                          onClick={() =>
                            handleOpenConfirmModal(
                              "cancel",
                              receipt._id,
                              receipt.status
                            )
                          }
                          className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 flex items-center cursor-pointer"
                          aria-label="Hủy phiếu xuất kho"
                        >
                          <EyeOff className="w-3 h-3 mr-1" />
                          Hủy
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleShowDetails(receipt)}
                      className="px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 flex items-center cursor-pointer"
                      aria-label="Xem chi tiết phiếu xuất kho"
                    >
                      <Info className="w-3 h-3 mr-1" />
                      Chi tiết
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {exportReceipts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {appliedCodeFilter || appliedBranchFilter || appliedStatusFilter
              ? "Không có phiếu xuất kho nào phù hợp với điều kiện lọc"
              : "Chưa có phiếu xuất kho nào"}
          </div>
        )}

        {totalReceipts > (itemsPerPage || 5) && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
              <div className="text-sm text-gray-700">
                Hiển thị {(currentPage - 1) * (itemsPerPage || 5) + 1} -{" "}
                {Math.min(currentPage * (itemsPerPage || 5), totalReceipts)} của{" "}
                {totalReceipts} mục
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

export default ExportReceipt;
