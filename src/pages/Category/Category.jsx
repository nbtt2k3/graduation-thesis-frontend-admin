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
  RotateCcw,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import * as apis from "../../apis";
import { CustomSkeletonCategory, CustomSelect } from "../../components";
import { AdminTechZoneContext } from "../../context/AdminTechZoneContext";

const Category = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [tempStatusFilter, setTempStatusFilter] = useState("");
  const [tempLevelFilter, setTempLevelFilter] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedStatusFilter, setAppliedStatusFilter] = useState("");
  const [appliedLevelFilter, setAppliedLevelFilter] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(null);
  const [totalCategories, setTotalCategories] = useState(0);
  const [activeCategories, setActiveCategories] = useState(0);
  const [inactiveCategories, setInactiveCategories] = useState(0);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmCategoryId, setConfirmCategoryId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  const { setError, navigate } = useContext(AdminTechZoneContext);

  const getAllCategory = async (page = 1) => {
    try {
      setLoading(true);
      const query = { page };
      if (appliedSearchTerm) query.name = appliedSearchTerm;
      if (appliedStatusFilter) query.isActive = appliedStatusFilter;
      if (appliedLevelFilter) query.level = appliedLevelFilter;

      const response = await apis.apiGetAllCategories(query);

      setCategories(response.categoryList || []);
      setTotalCategories(response.totalCategories || 0);
      setActiveCategories(response.activeCategories || 0);
      setInactiveCategories(response.inactiveCategories || 0);
      if (page === 1 && response.categoryList) {
        setItemsPerPage(response.categoryList.length || 1);
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
    setAppliedSearchTerm(tempSearchTerm);
    setAppliedStatusFilter(tempStatusFilter);
    setAppliedLevelFilter(tempLevelFilter);
    setCurrentPage(1);
  };

  const handleResetFilters = async () => {
    setTempSearchTerm("");
    setTempStatusFilter("");
    setTempLevelFilter("");
    setAppliedSearchTerm("");
    setAppliedStatusFilter("");
    setAppliedLevelFilter("");
    setCurrentPage(1);
  };

  useEffect(() => {
    getAllCategory(currentPage);
  }, [currentPage, appliedSearchTerm, appliedStatusFilter, appliedLevelFilter]);

  useEffect(() => {
    if (location.state?.categoryCreated) {
      getAllCategory(currentPage);
      toast.success(location.state.categoryCreated);
      navigate(location.pathname, { replace: true, state: {} });
    } else if (location.state?.categoryUpdated) {
      getAllCategory(currentPage);
      toast.success(location.state.categoryUpdated);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, currentPage]);

  const handleToggleConfirm = (categoryId, currentStatus) => {
    setConfirmCategoryId(categoryId);
    setConfirmAction(currentStatus ? "hide" : "show");
    setIsConfirmModalOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!confirmCategoryId || !confirmAction) return;

    try {
      setIsConfirmLoading(true);
      const response = await apis.apiUpdateCategoryVisibility(
        confirmCategoryId,
        {
          isActive: confirmAction === "show",
        }
      );

      toast.success(response.msg || "Thay đổi trạng thái thành công");

      setCategories((prev) =>
        prev.map((cat) =>
          cat._id === confirmCategoryId
            ? { ...cat, isActive: confirmAction === "show" }
            : cat
        )
      );
      setActiveCategories((prev) =>
        confirmAction === "show" ? prev + 1 : prev - 1
      );
      setInactiveCategories((prev) =>
        confirmAction === "show" ? prev - 1 : prev + 1
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
      setConfirmCategoryId(null);
      setConfirmAction(null);
    }
  };

  const totalPages = itemsPerPage
    ? Math.ceil(totalCategories / itemsPerPage)
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
    return <CustomSkeletonCategory />;
  }

  return (
    <div className="p-3 sm:p-6 bg-white h-auto">
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 p-6 border-b border-gray-200">
              Xác nhận {confirmAction === "show" ? "Hiển thị" : "Ẩn"} danh mục
            </h3>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-6">
                Bạn có chắc muốn {confirmAction === "show" ? "hiển thị" : "ẩn"}{" "}
                danh mục này?
              </p>
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 cursor-pointer transition-colors duration-200 w-full sm:w-auto"
                  onClick={() => setIsConfirmModalOpen(false)}
                  aria-label="Tiếp tục"
                  disabled={isConfirmLoading}
                >
                  Tiếp tục
                </button>
                <button
                  className={`px-4 py-2 text-white rounded-md flex items-center justify-center transition-colors duration-200 w-full sm:w-auto cursor-pointer ${
                    confirmAction === "show"
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-orange-500 hover:bg-orange-600"
                  } ${isConfirmLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={handleConfirmToggle}
                  aria-label={
                    confirmAction === "show"
                      ? "Xác nhận hiển thị"
                      : "Xác nhận ẩn"
                  }
                  disabled={isConfirmLoading}
                >
                  {isConfirmLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Đang xử lý...
                    </>
                  ) : confirmAction === "show" ? (
                    "Hiển thị"
                  ) : (
                    "Ẩn"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="mb-4 sm:mb-6">
        <div className="hidden sm:flex space-x-1 rounded-lg p-1">
          <Link
            to="add"
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-sm hover:bg-blue-600 flex items-center transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            THÊM DANH MỤC
          </Link>
          <Link
            to="/products/product-management"
            className="px-4 py-2 text-sm bg-orange-500 text-white rounded-sm hover:bg-orange-600 flex items-center transition-colors cursor-pointer"
          >
            <Package className="w-4 h-4 mr-2" />
            QUẢN LÝ SẢN PHẨM
          </Link>
        </div>

        <div className="sm:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-full px-4 py-3 bg-blue-500 text-white rounded-sm hover:bg-blue-600 flex items-center justify-center transition-colors cursor-pointer"
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
              >
                <Plus className="w-4 h-4 mr-2" />
                THÊM DANH MỤC
              </Link>
              <Link
                to="/products/product-management"
                className="w-full px-4 py-2 text-sm bg-orange-500 text-white rounded-sm hover:bg-orange-600 flex items-center justify-center transition-colors cursor-pointer"
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
              <p className="text-sm font-medium text-blue-600">Tổng danh mục</p>
              <p className="text-2xl font-bold text-blue-800">
                {totalCategories}
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
                {activeCategories}
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
                {inactiveCategories}
              </p>
            </div>
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <EyeOff className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-sm p-3 sm:p-4 mb-4 sm:mb-6 border-gray-100 border">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên danh mục
            </label>
            <input
              type="text"
              placeholder="Tên danh mục"
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              value={tempSearchTerm}
              onChange={(e) => setTempSearchTerm(e.target.value)}
            />
          </div>
          <CustomSelect
            name="levelFilter"
            options={[
              { value: "", label: "Tất cả" },
              { value: "1", label: "1" },
              { value: "2", label: "2" },
              { value: "3", label: "3" },
            ]}
            label="Cấp độ"
            placeholder="Tất cả"
            value={tempLevelFilter}
            onChange={(value) => setTempLevelFilter(value)}
            disabled={false}
            required={false}
            withSearch={false}
          />
          <CustomSelect
            name="statusFilter"
            options={[
              { value: "", label: "Tất cả" },
              { value: "true", label: "Hoạt động" },
              { value: "false", label: "Không hoạt động" },
            ]}
            label="Trạng thái"
            placeholder="Tất cả"
            value={tempStatusFilter}
            onChange={(value) => setTempStatusFilter(value)}
            disabled={false}
            required={false}
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
          <h2 className="text-base font-semibold">QUẢN LÝ DANH MỤC</h2>
        </div>

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  STT
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Hình ảnh
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Tên danh mục
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Cấp độ
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
              {categories.map((category, index) => (
                <tr key={category._id} className="hover:bg-gray-100">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {(currentPage - 1) * (itemsPerPage || 1) + index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-12 h-12 bg-gray-200 rounded border border-gray-300 flex items-center justify-center flex-shrink-0">
                      {category.logoUrl ? (
                        <img
                          src={category.logoUrl || "/placeholder.svg"}
                          alt={category.name}
                          className="w-full h-full object-contain rounded"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-full h-full bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs ${
                          category.logoUrl ? "hidden" : "flex"
                        }`}
                      >
                        <span>📷</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {category.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {category.level || "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        category.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {category.isActive ? "Hoạt động" : "Không hoạt động"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <Link
                        to={`edit/${category._id}`}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 flex items-center cursor-pointer"
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Sửa
                      </Link>
                      <button
                        onClick={() =>
                          handleToggleConfirm(category._id, category.isActive)
                        }
                        className={`px-3 py-1 rounded text-xs flex items-center cursor-pointer transition-colors ${
                          category.isActive
                            ? "bg-orange-500 text-white hover:bg-orange-600"
                            : "bg-green-500 text-white hover:bg-green-600"
                        }`}
                        aria-label={
                          category.isActive
                            ? "Ẩn danh mục"
                            : "Hiển thị danh mục"
                        }
                      >
                        {category.isActive ? (
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
            {categories.map((category, index) => (
              <div key={category._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start space-x-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-16 h-16 bg-gray-200 rounded border border-gray-300 flex items-center justify-center flex-shrink-0">
                          {category.logoUrl ? (
                            <img
                              src={category.logoUrl || "/placeholder.svg"}
                              alt={category.name}
                              className="w-full h-full object-contain rounded"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-full h-full bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm ${
                              category.logoUrl ? "hidden" : "flex"
                            }`}
                          >
                            <span>📷</span>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            #
                            {(currentPage - 1) * (itemsPerPage || 1) +
                              index +
                              1}{" "}
                            - {category.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Cấp độ: {category.level || "N/A"}
                          </div>
                          <div className="mt-1">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                category.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {category.isActive
                                ? "Hoạt động"
                                : "Không hoạt động"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 flex-shrink-0">
                        <Link
                          to={`edit/${category._id}`}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 flex items-center cursor-pointer"
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          Sửa
                        </Link>
                        <button
                          onClick={() =>
                            handleToggleConfirm(category._id, category.isActive)
                          }
                          className={`px-3 py-1 rounded text-xs flex items-center cursor-pointer transition-colors ${
                            category.isActive
                              ? "bg-orange-500 text-white hover:bg-orange-600"
                              : "bg-green-500 text-white hover:bg-green-600"
                          }`}
                          aria-label={
                            category.isActive
                              ? "Ẩn danh mục"
                              : "Hiển thị danh mục"
                          }
                        >
                          {category.isActive ? (
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
                </div>
              </div>
            ))}
          </div>
        </div>

        {categories.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {appliedSearchTerm || appliedStatusFilter || appliedLevelFilter
              ? "Không có danh mục nào phù hợp với điều kiện lọc"
              : "Chưa có danh mục nào"}
          </div>
        )}

        {totalCategories > (itemsPerPage || 1) && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
              <div className="text-sm text-gray-700">
                Hiển thị {(currentPage - 1) * (itemsPerPage || 1) + 1} -{" "}
                {Math.min(currentPage * (itemsPerPage || 1), totalCategories)}{" "}
                của {totalCategories} mục
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

export default Category;
