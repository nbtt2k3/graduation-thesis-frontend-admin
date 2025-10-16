"use client";

import React, { useEffect, useState, useContext } from "react";
import { FileText, Info, X, RotateCcw } from "lucide-react";
import * as apis from "../../../apis";
import { toast } from "react-hot-toast";
import { CustomSkeletonInventory, CustomSelect } from "../../../components";
import { AdminTechZoneContext } from "../../../context/AdminTechZoneContext";

const Inventory = () => {
  const [loading, setLoading] = useState(true);
  const [inventories, setInventories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [totalInventories, setTotalInventories] = useState(0);
  const [activeInventories, setActiveInventories] = useState(0);
  const [inactiveInventories, setInactiveInventories] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(null);
  const [tempNameFilter, setTempNameFilter] = useState("");
  const [tempSkuFilter, setTempSkuFilter] = useState("");
  const [tempBranchFilter, setTempBranchFilter] = useState("");
  const [tempStatusFilter, setTempStatusFilter] = useState("");
  const [appliedNameFilter, setAppliedNameFilter] = useState("");
  const [appliedSkuFilter, setAppliedSkuFilter] = useState("");
  const [appliedBranchFilter, setAppliedBranchFilter] = useState("");
  const [appliedStatusFilter, setAppliedStatusFilter] = useState("");
  const [branches, setBranches] = useState([]);
  const [branchesPage, setBranchesPage] = useState(1);
  const [totalBranches, setTotalBranches] = useState(0);

  const { setError } = useContext(AdminTechZoneContext);

  const getAllInventories = async (page = 1) => {
    try {
      setLoading(true);
      const query = { page };
      if (appliedNameFilter) query.name = appliedNameFilter.trim();
      if (appliedSkuFilter) query.sku = appliedSkuFilter.trim();
      if (appliedBranchFilter) query.branchId = appliedBranchFilter;
      if (appliedStatusFilter) query.isActive = appliedStatusFilter;

      const response = await apis.apiGetAllInventories(query);

      setInventories(response.inventoryList || []);
      setTotalInventories(response.summary?.totalInventories || 0);
      setActiveInventories(response.summary?.activeInventories || 0);
      setInactiveInventories(response.summary?.inactiveInventories || 0);
      if (page === 1 && response.inventoryList) {
        setItemsPerPage(response.inventoryList.length || 10);
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

  const fetchBranches = async (page = 1) => {
    try {
      const response = await apis.apiGetAllBranches({ page });
      setBranches(response.branchList || []);
      setTotalBranches(response.summary?.totalBranches || 0);
    } catch (error) {
      if (error?.msg) {
        toast.error(error.msg || "Không thể tải dữ liệu. Vui lòng thử lại.");
      } else {
        setError({ hasError: true, message: "Lỗi kết nối API" });
      }
    }
  };

  const getInventoryDetails = async (inventoryId) => {
    try {
      const [inventoryResponse, transactionResponse] = await Promise.all([
        apis.apiGetInventory(inventoryId),
        apis.apiGetInventoryTransaction(inventoryId),
      ]);
      setSelectedInventory(inventoryResponse.inventory);
      setTransactions(transactionResponse.transactions || []);
    } catch (error) {
      if (error?.msg) {
        toast.error(error.msg || "Không thể tải dữ liệu. Vui lòng thử lại.");
      } else {
        setError({ hasError: true, message: "Lỗi kết nối API" });
      }
    }
  };

  const handleApplyFilters = () => {
    setAppliedNameFilter(tempNameFilter);
    setAppliedSkuFilter(tempSkuFilter);
    setAppliedBranchFilter(tempBranchFilter);
    setAppliedStatusFilter(tempStatusFilter);
    setCurrentPage(1);
  };

  const handleShowDetails = async (inventory) => {
    setSelectedInventory(null);
    setTransactions([]);
    await getInventoryDetails(inventory._id);
  };

  const handleCloseDetails = () => {
    setSelectedInventory(null);
    setTransactions([]);
  };

  const handleResetFilters = async () => {
    setTempNameFilter("");
    setTempSkuFilter("");
    setTempBranchFilter("");
    setTempStatusFilter("");
    setAppliedNameFilter("");
    setAppliedSkuFilter("");
    setAppliedBranchFilter("");
    setAppliedStatusFilter("");
    setCurrentPage(1);
  };

  useEffect(() => {
    getAllInventories(currentPage);
    fetchBranches(branchesPage);
  }, [
    currentPage,
    appliedNameFilter,
    appliedSkuFilter,
    appliedBranchFilter,
    appliedStatusFilter,
    branchesPage,
  ]);

  const totalPages = itemsPerPage
    ? Math.ceil(totalInventories / itemsPerPage)
    : 1;

  const branchOptions = [
    { value: "", label: "Tất cả" },
    ...branches.map((branch) => ({
      value: branch._id,
      label: branch.name,
    })),
  ];

  const statusOptions = [
    { value: "", label: "Tất cả" },
    { value: "true", label: "Hoạt động" },
    { value: "false", label: "Không hoạt động" },
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
    return <CustomSkeletonInventory />;
  }

  return (
    <div className="p-3 sm:p-6 bg-white h-auto">
      {selectedInventory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Chi tiết kho hàng</h3>
                  <p className="text-blue-100 text-sm opacity-90">
                    Thông tin chi tiết về sản phẩm trong kho
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
                    {selectedInventory.productItemId.name}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      SKU: {selectedInventory.productItemId.sku}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedInventory.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedInventory.isActive
                        ? "Hoạt động"
                        : "Không hoạt động"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200">
                    Thông tin sản phẩm
                  </h5>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Mã vạch
                        </p>
                        <p className="text-gray-900 mt-1">
                          {selectedInventory.productItemId.barcode}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Info className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Thuộc tính
                        </p>
                        <p className="text-gray-900 mt-1">
                          {selectedInventory.productItemId.attributes
                            ?.map((attr) => `${attr.code}: ${attr.value}`)
                            .join(", ") || "Không có thuộc tính"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 font-bold text-sm">
                          ₫
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Giá bán lẻ
                        </p>
                        <p className="text-gray-900 mt-1 font-bold text-lg">
                          {selectedInventory.productItemId.retailPrice.toLocaleString()}{" "}
                          VNĐ
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h5 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200">
                    Thông tin kho
                  </h5>
                  <div className="space-y-3">
                    <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                      <p className="text-sm font-medium text-orange-800">
                        Số lượng tồn kho
                      </p>
                      <p className="text-orange-900 font-bold text-lg">
                        {selectedInventory.quantity}
                      </p>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                      <p className="text-sm font-medium text-indigo-800">
                        Chi nhánh
                      </p>
                      <p className="text-indigo-900 font-medium">
                        {selectedInventory.branchId?.name || "Không xác định"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h5 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-4">
                  Lịch sử giao dịch
                </h5>
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="bg-gray-50 rounded-xl p-4 mb-3 border border-gray-200"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Loại giao dịch
                          </p>
                          <p className="text-gray-900 font-medium">
                            {transaction.type === "import"
                              ? "Nhập kho"
                              : "Xuất kho"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Số lượng
                          </p>
                          <p className="text-gray-900 font-bold">
                            {transaction.quantity}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Giá nhập
                          </p>
                          <p className="text-gray-900 font-bold">
                            {transaction.purchasePrice?.toLocaleString() || "0"}{" "}
                            VNĐ
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Nhà cung cấp
                          </p>
                          <p className="text-gray-900">
                            {typeof transaction.supplierId === "object" &&
                            transaction.supplierId?.name
                              ? transaction.supplierId.name
                              : transaction.supplierId || "Không xác định"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-600">
                          Ghi chú
                        </p>
                        <p className="text-gray-900">
                          {transaction.note || "Không có ghi chú"}
                        </p>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-600">
                          Thời gian
                        </p>
                        <p className="text-gray-900">
                          {new Date(transaction.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center">
                    Không có giao dịch
                  </p>
                )}
              </div>
              <div className="mt-6">
                <h5 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-4">
                  Thời gian
                </h5>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">Tạo</p>
                      <p className="text-lg font-bold text-blue-600">
                        {new Date(
                          selectedInventory.createdAt
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
                          selectedInventory.updatedAt
                        ).toLocaleDateString("vi-VN")}
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
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 sm:mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Tổng kho hàng</p>
              <p className="text-2xl font-bold text-blue-800">
                {totalInventories}
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
                {activeInventories}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
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
                {inactiveInventories}
              </p>
            </div>
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-sm p-3 sm:p-4 mb-4 sm:mb-6 border-gray-100 border">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên sản phẩm
            </label>
            <input
              type="text"
              placeholder="Tên sản phẩm"
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              value={tempNameFilter}
              onChange={(e) => setTempNameFilter(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SKU
            </label>
            <input
              type="text"
              placeholder="SKU"
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              value={tempSkuFilter}
              onChange={(e) => setTempSkuFilter(e.target.value)}
            />
          </div>
          <div>
            <CustomSelect
              name="branchFilter"
              options={branchOptions}
              label="Chi nhánh"
              placeholder="Tất cả"
              value={tempBranchFilter}
              onChange={setTempBranchFilter}
              withSearch={true}
            />
          </div>
          <div>
            <CustomSelect
              name="statusFilter"
              options={statusOptions}
              label="Trạng thái"
              placeholder="Tất cả"
              value={tempStatusFilter}
              onChange={setTempStatusFilter}
              withSearch={false}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={handleApplyFilters}
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
        {totalBranches > 10 && (
          <div className="mt-2 flex justify-end space-x-2">
            <button
              onClick={() => setBranchesPage((prev) => Math.max(prev - 1, 1))}
              disabled={branchesPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50"
              aria-label="Trang chi nhánh trước"
            >
              Trước
            </button>
            <button
              onClick={() => setBranchesPage((prev) => prev + 1)}
              disabled={branches.length < 10}
              className="px-3 py-1 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50"
              aria-label="Trang chi nhánh sau"
            >
              Sau
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-sm shadow-md">
        <div className="bg-[#00D5BE] text-white p-3 rounded-t-sm flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <h2 className="text-base font-semibold">QUẢN LÝ KHO HÀNG</h2>
        </div>

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  STT
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Tên sản phẩm
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  SKU
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Số lượng
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Chi nhánh
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
              {inventories.map((inventory, index) => (
                <tr key={inventory._id} className="hover:bg-gray-100">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {(currentPage - 1) * (itemsPerPage || 10) + index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {inventory.productItemId.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {inventory.productItemId.sku}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {inventory.quantity}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {inventory.branchId?.name || "Không xác định"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        inventory.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {inventory.isActive ? "Hoạt động" : "Không hoạt động"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleShowDetails(inventory)}
                        className="px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 flex items-center cursor-pointer"
                        aria-label="Xem chi tiết mục kho"
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
            {inventories.map((inventory, index) => (
              <div key={inventory._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start space-x-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          #
                          {(currentPage - 1) * (itemsPerPage || 10) + index + 1}{" "}
                          - {inventory.productItemId.name}
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          <p>SKU: {inventory.productItemId.sku}</p>
                          <p>Số lượng: {inventory.quantity}</p>
                          <p>
                            Chi nhánh:{" "}
                            {inventory.branchId?.name || "Không xác định"}
                          </p>
                        </div>
                        <div className="mt-1">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              inventory.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {inventory.isActive
                              ? "Hoạt động"
                              : "Không hoạt động"}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2 flex-shrink-0">
                        <button
                          onClick={() => handleShowDetails(inventory)}
                          className="px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 flex items-center cursor-pointer"
                          aria-label="Xem chi tiết mục kho"
                        >
                          <Info className="w-3 h-3 mr-1" />
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {inventories.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {appliedNameFilter ||
            appliedSkuFilter ||
            appliedBranchFilter ||
            appliedStatusFilter
              ? "Không có mục kho nào phù hợp với điều kiện lọc"
              : "Chưa có mục kho nào"}
          </div>
        )}

        {totalInventories > (itemsPerPage || 10) && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
              <div className="text-sm text-gray-700">
                Hiển thị {(currentPage - 1) * (itemsPerPage || 10) + 1} -{" "}
                {Math.min(currentPage * (itemsPerPage || 10), totalInventories)}{" "}
                của {totalInventories} mục
              </div>
              <div className="flex items-center space-x-2 overflow-x-auto">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center cursor-pointer flex-shrink-0"
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
                      className={`px-2 sm:px-3 py-1 text-xs sm:text-sm border rounded cursor-pointer flex-shrink-0 ${
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
                  className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center cursor-pointer flex-shrink-0"
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

export default Inventory;
