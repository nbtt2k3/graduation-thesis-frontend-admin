"use client";
import { useEffect, useState, useRef, useContext } from "react";
import { FileText, Eye, EyeOff, X, Info, RotateCcw } from "lucide-react";
import * as apis from "../../apis";
import { toast } from "react-hot-toast";
import { CustomSkeletonOrder } from "../../components";
import { AdminTechZoneContext } from "../../context/AdminTechZoneContext";

// Dịch các trạng thái đơn hàng sang tiếng Việt
const statusTranslations = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  processing: "Đang chuẩn bị",
  shipped: "Đã gửi đi",
  out_for_delivery: "Đang giao hàng",
  delivered: "Đã giao",
  return_requested: "Yêu cầu trả hàng",
  returned: "Đã trả hàng",
  cancelled: "Đã hủy",
};

// Dịch các trạng thái thanh toán sang tiếng Việt
const paymentStatusTranslations = {
  pending: "Chưa thanh toán",
  paid: "Đã thanh toán",
  failed: "Thanh toán thất bại",
};

// Các phương thức thanh toán
const paymentMethods = [
  { value: "", label: "Tất cả" },
  { value: "cod", label: "Tiền mặt" },
  { value: "momo", label: "Momo" },
];

// Thứ tự trạng thái tuyến tính
const orderStatusOrder = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "return_requested",
  "returned",
];

// Hàm lấy các trạng thái hợp lệ dựa trên trạng thái hiện tại
const getValidNextStatuses = (currentStatus) => {
  if (currentStatus === "cancelled" || currentStatus === "returned") {
    return []; // Không thể thay đổi trạng thái nếu đã hủy hoặc đã trả hàng
  }
  if (currentStatus === "delivered") {
    return ["return_requested", "returned", "cancelled"];
  }
  const currentIndex = orderStatusOrder.indexOf(currentStatus);
  if (currentIndex === -1) {
    return orderStatusOrder.concat("cancelled"); // Nếu trạng thái không xác định, cho phép tất cả
  }
  // Lấy tất cả các trạng thái sau trạng thái hiện tại, cộng với "cancelled" nếu chưa giao
  const validStatuses = orderStatusOrder.slice(currentIndex + 1);
  if (currentIndex < orderStatusOrder.indexOf("delivered")) {
    validStatuses.push("cancelled");
  }
  return validStatuses;
};

// CustomSelect component for dropdowns without search input
const CustomSelect = ({
  name,
  options,
  error,
  disabled,
  onChange,
  setValue,
  label,
  placeholder,
  value,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (value) {
      const selected = options.find((option) => option.value === value);
      setSelectedOption(selected ? selected.label : "");
    } else {
      setSelectedOption("");
    }
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (option) => {
    setSelectedOption(option.label);
    setValue?.(name, option.value);
    onChange({ target: { name, value: option.value } });
    setIsOpen(false);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div ref={wrapperRef} className="relative w-full">
        <div
          className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex items-center justify-between ${
            error ? "border-red-500" : "border-gray-300"
          } ${isOpen ? "ring-2 ring-blue-500" : ""}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className="text-gray-700">{selectedOption || placeholder}</span>
          <svg
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-sm shadow-lg max-h-60 overflow-y-auto">
            {options.length > 0 ? (
              options.map((option) => (
                <div
                  key={option.value}
                  className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => handleSelect(option)}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="p-2 text-gray-500">
                Không có tùy chọn nào phù hợp
              </div>
            )}
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
  );
};

const Order = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedStatusFilter, setAppliedStatusFilter] = useState("");
  const [appliedPaymentMethodFilter, setAppliedPaymentMethodFilter] =
    useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdateModal, setStatusUpdateModal] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const { setError } = useContext(AdminTechZoneContext);

  const orderStatuses = [
    { value: "", label: "Tất cả" },
    ...Object.keys(statusTranslations).map((key) => ({
      value: key,
      label: statusTranslations[key],
    })),
  ];

  // Chỉ hiển thị một số trạng thái chính cho phần thống kê (giảm số lượng card)
  const displayedStatuses = [
    { value: "pending", label: statusTranslations.pending },
    { value: "processing", label: statusTranslations.processing },
    { value: "delivered", label: statusTranslations.delivered },
    { value: "cancelled", label: statusTranslations.cancelled },
  ];

  const getAllOrders = async (page = 1) => {
    try {
      setLoading(true);
      setError("");
      const query = { page };
      if (appliedSearchTerm) query.orderCode = appliedSearchTerm;
      if (appliedStatusFilter) query.status = appliedStatusFilter;
      if (appliedPaymentMethodFilter)
        query.paymentMethod = appliedPaymentMethodFilter;

      const response = await apis.apiGetAllOrders(query);

      setOrders(response.orderList || []);
      setTotalOrders(response.totalOrders || 0);
      if (page === 1 && response.orderList) {
        setItemsPerPage(response.orderList.length || 1);
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
    setAppliedSearchTerm(searchTerm);
    setAppliedStatusFilter(statusFilter);
    setAppliedPaymentMethodFilter(paymentMethodFilter);
    setCurrentPage(1);
  };

  const handleResetFilters = async () => {
    setSearchTerm("");
    setStatusFilter("");
    setPaymentMethodFilter("");
    setAppliedSearchTerm("");
    setAppliedStatusFilter("");
    setAppliedPaymentMethodFilter("");
    setCurrentPage(1);
  };

  useEffect(() => {
    getAllOrders(currentPage);
  }, [
    currentPage,
    appliedSearchTerm,
    appliedStatusFilter,
    appliedPaymentMethodFilter,
  ]);

  const handleUpdateStatus = async (orderId, newStatus, cancelReason = "") => {
    try {
      const response = await apis.apiUpdateOrderStatusByAdmin(orderId, {
        status: newStatus,
        ...(newStatus === "cancelled" && { cancelReason }),
      });
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? { ...order, status: newStatus, cancelReason }
            : order
        )
      );
      toast.success(
        response.msg ||
          `Cập nhật trạng thái đơn hàng thành công: ${statusTranslations[newStatus]}`
      );
      setCancelReason("");
      setSelectedStatus(null);
      setStatusUpdateModal(null);
    } catch (error) {
      if (error?.msg) {
        toast.error(
          error.msg || "Không thể cập nhật trạng thái. Vui lòng thử lại."
        );
      }
    }
  };

  const handleStatusUpdateSubmit = async (orderId, newStatus) => {
    if (newStatus === "cancelled" && !cancelReason) {
      toast.error("Lý do hủy không được để trống");
      return;
    }
    await handleUpdateStatus(orderId, newStatus, cancelReason);
  };

  const handleShowDetails = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
  };

  const openStatusUpdateModal = (order) => {
    setSelectedOrder(null); // Close details modal
    setStatusUpdateModal(order);
    setCancelReason(""); // Reset lý do hủy
    setSelectedStatus(null); // Reset trạng thái được chọn
  };

  const closeStatusUpdateModal = () => {
    setStatusUpdateModal(null);
    setCancelReason("");
    setSelectedStatus(null);
  };

  const statusCounts = orderStatuses.reduce((acc, status) => {
    acc[status.value] = orders.filter(
      (order) => order.status === status.value
    ).length;
    return acc;
  }, {});

  const totalPages = itemsPerPage ? Math.ceil(totalOrders / itemsPerPage) : 1;

  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

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
    return <CustomSkeletonOrder />;
  }

  return (
    <div className="p-3 sm:p-6 bg-white h-auto">
      {statusUpdateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh]">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    Cập nhật trạng thái
                  </h3>
                  <p className="text-blue-100 text-sm opacity-90">
                    Mã đơn hàng: {statusUpdateModal.orderCode || "Không có mã"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCancelReason("");
                    setSelectedStatus(null);
                    closeStatusUpdateModal();
                  }}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200 cursor-pointer"
                  aria-label="Đóng"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1 min-h-0">
              <h5 className="text-lg font-semibold text-gray-800 mb-4">
                Chọn trạng thái mới
              </h5>
              <div className="grid grid-cols-2 gap-3">
                {getValidNextStatuses(statusUpdateModal.status).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => {
                        if (status !== "cancelled") {
                          handleStatusUpdateSubmit(
                            statusUpdateModal._id,
                            status
                          );
                        } else {
                          setSelectedStatus(status);
                        }
                      }}
                      className={`p-3 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer ${
                        statusUpdateModal.status === status
                          ? "bg-blue-100 text-blue-800 cursor-default"
                          : "bg-gray-100 text-gray-800 hover:bg-blue-50 hover:text-blue-700"
                      }`}
                      disabled={statusUpdateModal.status === status}
                    >
                      {statusTranslations[status]}
                    </button>
                  )
                )}
              </div>
              {selectedStatus === "cancelled" && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lý do hủy đơn
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập lý do hủy"
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                </div>
              )}
              {getValidNextStatuses(statusUpdateModal.status).length === 0 && (
                <p className="text-gray-600 text-sm">
                  Không thể cập nhật trạng thái. Đơn hàng đã ở trạng thái cuối (
                  {statusTranslations[statusUpdateModal.status]}).
                </p>
              )}
            </div>
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex-shrink-0">
              {selectedStatus === "cancelled" && (
                <button
                  onClick={() =>
                    handleStatusUpdateSubmit(
                      statusUpdateModal._id,
                      selectedStatus
                    )
                  }
                  className="w-full px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium cursor-pointer mb-2"
                  aria-label="Xác nhận hủy"
                >
                  Xác nhận hủy
                </button>
              )}
              <button
                onClick={() => {
                  setCancelReason("");
                  setSelectedStatus(null);
                  closeStatusUpdateModal();
                }}
                className="w-full px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium cursor-pointer"
                aria-label="Đóng"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Chi tiết đơn hàng</h3>
                  <p className="text-blue-100 text-sm opacity-90">
                    Thông tin chi tiết về đơn hàng
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
                    {selectedOrder.orderCode || "Không có mã đơn hàng"}
                  </h4>
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {statusTranslations[selectedOrder.status] ||
                        "Không xác định"}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedOrder.paymentStatus === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : selectedOrder.paymentStatus === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {paymentStatusTranslations[selectedOrder.paymentStatus] ||
                        "Không xác định"}
                    </span>
                    {selectedOrder.status === "cancelled" &&
                      selectedOrder.cancelReason && (
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                          Lý do hủy: {selectedOrder.cancelReason}
                        </span>
                      )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200">
                    Thông tin khách hàng
                  </h5>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Tên khách hàng
                        </p>
                        <p className="text-gray-900 mt-1">
                          {selectedOrder.userId?.fullName ||
                            "Không có thông tin"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Info className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Email
                        </p>
                        <p className="text-gray-900 mt-1">
                          {selectedOrder.userId?.email || "Không có thông tin"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 font-bold text-sm">
                          ☎
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Số điện thoại
                        </p>
                        <p className="text-gray-900 mt-1">
                          {selectedOrder.userId?.phone || "Không có thông tin"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200">
                    Địa chỉ giao hàng
                  </h5>
                  <div className="space-y-3">
                    <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                      <p className="text-sm font-medium text-orange-800">
                        Tên người nhận
                      </p>
                      <p className="text-orange-900 font-bold">
                        {selectedOrder.shippingAddress?.fullName ||
                          "Không có thông tin"}
                      </p>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                      <p className="text-sm font-medium text-indigo-800">
                        Địa chỉ
                      </p>
                      <p className="text-indigo-900 font-medium">
                        {selectedOrder.shippingAddress
                          ? `${selectedOrder.shippingAddress.addressLine}, ${selectedOrder.shippingAddress.ward}, ${selectedOrder.shippingAddress.district}, ${selectedOrder.shippingAddress.province}`
                          : "Không có thông tin"}
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <p className="text-sm font-medium text-blue-800">
                        Số điện thoại
                      </p>
                      <p className="text-blue-900 font-medium">
                        {selectedOrder.shippingAddress?.phone ||
                          "Không có thông tin"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h5 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-4">
                  Sản phẩm
                </h5>
                {selectedOrder.items?.length > 0 ? (
                  selectedOrder.items.map((item) => (
                    <div
                      key={item._id}
                      className="bg-gray-50 rounded-xl p-4 mb-3 border border-gray-200"
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.image || "/default-image.png"}
                          alt={item.name || "Sản phẩm"}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium">
                            {item.name || "Không có tên sản phẩm"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.attributes?.length > 0
                              ? item.attributes
                                  .map((attr) => `${attr.code}: ${attr.value}`)
                                  .join(", ")
                              : "Không có thuộc tính"}
                          </p>
                          <p className="text-sm text-gray-600">
                            Số lượng: {item.quantity || 0}
                          </p>
                          <p className="text-sm text-gray-600">
                            Giá: {(item.discountedPrice || 0).toLocaleString()}{" "}
                            VNĐ
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">
                    Không có sản phẩm trong đơn hàng
                  </p>
                )}
              </div>

              <div className="mt-6">
                <h5 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-4">
                  Thanh toán
                </h5>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-600">
                      Phương thức thanh toán
                    </p>
                    <p className="text-gray-900 font-medium">
                      {selectedOrder.paymentMethod === "cod"
                        ? "Tiền mặt"
                        : selectedOrder.paymentMethod === "momo"
                        ? "Momo"
                        : "Không có thông tin"}
                    </p>
                  </div>
                  <div className="flex justify-between mt-2">
                    <p className="text-sm font-medium text-gray-600">
                      Tổng tiền
                    </p>
                    <p className="text-gray-900 font-bold text-lg">
                      {(selectedOrder.totalAmount || 0).toLocaleString()} VNĐ
                    </p>
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
                        Tạo đơn
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        {selectedOrder.createdAt
                          ? new Date(
                              selectedOrder.createdAt
                            ).toLocaleDateString("vi-VN")
                          : "Không có thông tin"}
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
                        {selectedOrder.updatedAt
                          ? new Date(
                              selectedOrder.updatedAt
                            ).toLocaleDateString("vi-VN")
                          : "Không có thông tin"}
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
                <button
                  onClick={() => openStatusUpdateModal(selectedOrder)}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 cursor-pointer ${
                    selectedOrder.status === "cancelled" ||
                    selectedOrder.status === "returned"
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                  disabled={
                    selectedOrder.status === "cancelled" ||
                    selectedOrder.status === "returned"
                  }
                  aria-label="Cập nhật trạng thái"
                >
                  Cập nhật trạng thái
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phần thống kê: Chỉ hiển thị Tổng đơn hàng và 4 trạng thái chính */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 sm:mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-blue-800">{totalOrders}</p>
            </div>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
        {displayedStatuses.map((status) => (
          <div
            key={status.value}
            className={`border rounded-sm p-4 ${
              status.value === "delivered"
                ? "bg-green-50 border-green-200"
                : status.value === "cancelled"
                ? "bg-red-50 border-red-200"
                : "bg-yellow-50 border-yellow-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {status.label}
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {statusCounts[status.value] || 0}
                </p>
              </div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  status.value === "delivered"
                    ? "bg-green-500"
                    : status.value === "cancelled"
                    ? "bg-red-500"
                    : "bg-yellow-500"
                }`}
              >
                {status.value === "delivered" ? (
                  <Eye className="w-4 h-4 text-white" />
                ) : (
                  <EyeOff className="w-4 h-4 text-white" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-sm p-3 sm:p-4 mb-4 sm:mb-6 border-gray-100 border">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã đơn hàng
            </label>
            <input
              type="text"
              placeholder="Tìm theo mã đơn hàng"
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <CustomSelect
              name="paymentMethodFilter"
              options={paymentMethods}
              label="Phương thức thanh toán"
              placeholder="Tất cả"
              value={paymentMethodFilter}
              onChange={(e) => {
                setPaymentMethodFilter(e.target.value);
              }}
              setValue={(name, value) => {
                setPaymentMethodFilter(value);
              }}
            />
          </div>
          <div>
            <CustomSelect
              name="statusFilter"
              options={orderStatuses}
              label="Trạng thái"
              placeholder="Tất cả"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
              }}
              setValue={(name, value) => {
                setStatusFilter(value);
              }}
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
          <h2 className="text-base font-semibold">QUẢN LÝ ĐƠN HÀNG</h2>
        </div>

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  STT
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Mã đơn hàng
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Khách hàng
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Tổng tiền
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Phương thức thanh toán
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
              {orders.map((order, index) => (
                <tr key={order._id} className="hover:bg-gray-100">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {(currentPage - 1) * (itemsPerPage || 1) + index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {order.orderCode || "Không có mã"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {order.userId?.fullName || "Không có thông tin"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {(order.totalAmount || 0).toLocaleString()} VNĐ
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {order.paymentMethod === "cod"
                      ? "Tiền mặt"
                      : order.paymentMethod === "momo"
                      ? "Momo"
                      : "Không có thông tin"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "returned" ||
                            order.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {statusTranslations[order.status] || "Không xác định"}
                    </span>
                    {order.status === "cancelled" && order.cancelReason && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 ml-2 truncate max-w-[150px]">
                        Lý do: {order.cancelReason}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleShowDetails(order)}
                        className="px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 flex items-center cursor-pointer"
                        aria-label="Xem chi tiết đơn hàng"
                      >
                        <Info className="w-3 h-3 mr-1" />
                        Chi tiết
                      </button>
                      <button
                        onClick={() => openStatusUpdateModal(order)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center ${
                          order.status === "cancelled" ||
                          order.status === "returned"
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                        }`}
                        disabled={
                          order.status === "cancelled" ||
                          order.status === "returned"
                        }
                        aria-label="Cập nhật trạng thái"
                      >
                        Cập nhật trạng thái
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
            {orders.map((order, index) => (
              <div key={order._id} className="p-4 hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        #{(currentPage - 1) * (itemsPerPage || 1) + index + 1} -{" "}
                        {order.orderCode || "Không có mã"}
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        <p>
                          Khách hàng:{" "}
                          {order.userId?.fullName || "Không có thông tin"}
                        </p>
                        <p>
                          Tổng tiền: {(order.totalAmount || 0).toLocaleString()}{" "}
                          VNĐ
                        </p>
                        <p>
                          Phương thức:{" "}
                          {order.paymentMethod === "cod"
                            ? "Tiền mặt"
                            : order.paymentMethod === "momo"
                            ? "Momo"
                            : "Không có thông tin"}
                        </p>
                      </div>
                      <div className="mt-1">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.status === "delivered"
                              ? "bg-green-100 text-green-800"
                              : order.status === "returned" ||
                                order.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {statusTranslations[order.status] || "Không xác định"}
                        </span>
                        {order.status === "cancelled" && order.cancelReason && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 ml-2 truncate max-w-[150px]">
                            Lý do: {order.cancelReason}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2 flex-shrink-0">
                      <button
                        onClick={() => handleShowDetails(order)}
                        className="px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 flex items-center cursor-pointer"
                        aria-label="Xem chi tiết đơn hàng"
                      >
                        <Info className="w-3 h-3 mr-1" />
                        Chi tiết
                      </button>
                      <button
                        onClick={() => openStatusUpdateModal(order)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center ${
                          order.status === "cancelled" ||
                          order.status === "returned"
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                        }`}
                        disabled={
                          order.status === "cancelled" ||
                          order.status === "returned"
                        }
                        aria-label="Cập nhật trạng thái"
                      >
                        Cập nhật trạng thái
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {appliedSearchTerm ||
            appliedStatusFilter ||
            appliedPaymentMethodFilter
              ? "Không có đơn hàng nào phù hợp với điều kiện lọc"
              : "Chưa có đơn hàng nào"}
          </div>
        )}

        {totalOrders > (itemsPerPage || 1) && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
              <div className="text-sm text-gray-700">
                Hiển thị {(currentPage - 1) * (itemsPerPage || 1) + 1} -{" "}
                {Math.min(currentPage * (itemsPerPage || 1), totalOrders)} của{" "}
                {totalOrders} mục
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

export default Order;
