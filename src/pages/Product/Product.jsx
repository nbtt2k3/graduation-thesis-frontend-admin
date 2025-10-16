"use client";

import { useEffect, useState, useContext } from "react";
import {
  FileText,
  Plus,
  Package,
  Eye,
  EyeOff,
  Info,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import * as apis from "../../apis";
import { Link, useLocation } from "react-router-dom";
import { ProductDetailModal } from "../../components";
import { toast } from "react-hot-toast";
import { CustomSkeletonProduct, CustomSelect } from "../../components";
import { AdminTechZoneContext } from "../../context/AdminTechZoneContext";

const Product = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [tempStatusFilter, setTempStatusFilter] = useState("");
  const [tempSelectedBrand, setTempSelectedBrand] = useState("");
  const [tempSelectedCategory, setTempSelectedCategory] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedStatusFilter, setAppliedStatusFilter] = useState("");
  const [appliedSelectedBrand, setAppliedSelectedBrand] = useState("");
  const [appliedSelectedCategory, setAppliedSelectedCategory] = useState("");
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeProducts, setActiveProducts] = useState(0);
  const [inactiveProducts, setInactiveProducts] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmProductId, setConfirmProductId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  const { setError, navigate } = useContext(AdminTechZoneContext);

  const getAllProducts = async (page = 1) => {
    try {
      setLoading(true);
      const query = { page };
      if (appliedSearchTerm) query.name = appliedSearchTerm;
      if (appliedSelectedBrand) query.brandId = appliedSelectedBrand;
      if (appliedSelectedCategory) query.categoryId = appliedSelectedCategory;
      if (appliedStatusFilter) query.isActive = appliedStatusFilter;

      const response = await apis.apiGetAllProducts(query);

      setProducts(response.productList || []);
      setActiveProducts(response.activeProducts || 0);
      setInactiveProducts(response.inactiveProducts || 0);
      setTotalProducts(response.totalProducts || 0);
      if (page === 1 && response.productList) {
        setItemsPerPage(response.productList.length || 1);
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

  const getAllBrands = async () => {
    try {
      const response = await apis.apiGetAllBrands({ limit: 0, isActive: true });
      setBrands(response.brandList || []);
    } catch (error) {
      if (error?.msg) {
        toast.error(error.msg || "Không thể tải dữ liệu. Vui lòng thử lại.");
      } else {
        setError({ hasError: true, message: "Lỗi kết nối API" });
      }
    }
  };

  const getAllCategories = async () => {
    try {
      const response = await apis.apiGetAllCategories({
        limit: 0,
        isActive: true,
      });

      const level2Categories = (response.categoryList || []).filter(
        (item) => item.level === 2
      );

      setCategories(level2Categories);
    } catch (error) {
      if (error?.msg) {
        toast.error(error.msg || "Không thể tải dữ liệu. Vui lòng thử lại.");
      } else {
        setError({ hasError: true, message: "Lỗi kết nối API" });
      }
    }
  };

  const updateProductItems = (productId, updatedProductItems) => {
    setProducts((prev) =>
      prev.map((product) =>
        product._id === productId
          ? { ...product, productItems: updatedProductItems }
          : product
      )
    );
    if (selectedProduct && selectedProduct._id === productId) {
      setSelectedProduct((prev) =>
        prev ? { ...prev, productItems: updatedProductItems } : prev
      );
    }
  };

  const handleSearch = () => {
    setAppliedSearchTerm(tempSearchTerm);
    setAppliedStatusFilter(tempStatusFilter);
    setAppliedSelectedBrand(tempSelectedBrand);
    setAppliedSelectedCategory(tempSelectedCategory);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setTempSearchTerm("");
    setTempStatusFilter("");
    setTempSelectedBrand("");
    setTempSelectedCategory("");
    setAppliedSearchTerm("");
    setAppliedStatusFilter("");
    setAppliedSelectedBrand("");
    setAppliedSelectedCategory("");
    setCurrentPage(1);
  };

  const handleToggleConfirm = (productId, currentStatus) => {
    setConfirmProductId(productId);
    setConfirmAction(currentStatus ? "hide" : "show");
    setIsConfirmModalOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!confirmProductId || !confirmAction) return;

    try {
      setIsConfirmLoading(true);
      const response = await apis.apiUpdateProductVisibility(confirmProductId, {
        isActive: confirmAction === "show",
      });

      toast.success(response.msg || "Thay đổi trạng thái thành công");

      setProducts((prev) =>
        prev.map((product) =>
          product._id === confirmProductId
            ? { ...product, isActive: confirmAction === "show" }
            : product
        )
      );
      if (selectedProduct && selectedProduct._id === confirmProductId) {
        setSelectedProduct((prev) =>
          prev ? { ...prev, isActive: confirmAction === "show" } : prev
        );
      }

      await getAllProducts(currentPage);
    } catch (error) {
      if (error?.msg) {
        toast.error(
          error.msg || "Không thể thay đổi trạng thái. Vui lòng thử lại."
        );
      }
    } finally {
      setIsConfirmLoading(false);
      setIsConfirmModalOpen(false);
      setConfirmProductId(null);
      setConfirmAction(null);
    }
  };

  useEffect(() => {
    getAllProducts(currentPage);
    getAllBrands();
    getAllCategories();
  }, [
    currentPage,
    appliedSearchTerm,
    appliedStatusFilter,
    appliedSelectedBrand,
    appliedSelectedCategory,
  ]);

  useEffect(() => {
    if (location.state?.productCreated) {
      getAllProducts(currentPage);
      toast.success(location.state.productCreated);
      navigate(location.pathname, { replace: true, state: {} });
    } else if (location.state?.productUpdated) {
      getAllProducts(currentPage);
      toast.success(location.state.productUpdated);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, currentPage]);

  const brandOptions = [
    { value: "", label: "Tất cả" },
    ...brands.map((brand) => ({
      value: brand._id,
      label: brand.name,
    })),
  ];

  const categoryOptions = [
    { value: "", label: "Tất cả" },
    ...categories.map((category) => ({
      value: category._id,
      label: category.name,
    })),
  ];

  const statusOptions = [
    { value: "", label: "Tất cả" },
    { value: "true", label: "Hoạt động" },
    { value: "false", label: "Không hoạt động" },
  ];

  const totalPages = itemsPerPage ? Math.ceil(totalProducts / itemsPerPage) : 1;

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const handleShowDetails = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseDetails = () => {
    setSelectedProduct(null);
  };

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
    return <CustomSkeletonProduct />;
  }

  return (
    <div className="p-3 sm:p-6 bg-white h-auto">
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 p-6 border-b border-gray-200">
              Xác nhận {confirmAction === "show" ? "Hiển thị" : "Ẩn"} sản phẩm
            </h3>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-6">
                Bạn có chắc muốn {confirmAction === "show" ? "hiển thị" : "ẩn"}{" "}
                sản phẩm này?
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
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Chi tiết sản phẩm</h3>
                  <p className="text-blue-100 text-sm opacity-90">
                    Thông tin chi tiết về sản phẩm
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
                    {selectedProduct.name}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedProduct.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedProduct.isActive
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
                          Thương hiệu
                        </p>
                        <p className="text-gray-900 mt-1">
                          {selectedProduct.brand?.name || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Info className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Danh mục
                        </p>
                        <p className="text-gray-900 mt-1 font-medium">
                          {selectedProduct.category?.name || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h5 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200">
                    Hình ảnh
                  </h5>
                  <div className="space-y-3">
                    <div className="w-32 h-32 bg-gray-200 rounded border flex items-center justify-center flex-shrink-0">
                      <img
                        src={selectedProduct.thumbUrl || "/placeholder.svg"}
                        alt={selectedProduct.name}
                        className="w-full h-full object-contain rounded"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div
                        className={`w-full h-full bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm ${
                          selectedProduct.thumbUrl ? "hidden" : "flex"
                        }`}
                      >
                        <span>📷</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {selectedProduct.productItems?.length > 0 && (
                <div className="mt-6">
                  <h5 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-4">
                    Biến thể sản phẩm
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedProduct.productItems.map((item, index) => (
                      <div
                        key={index}
                        className="bg-blue-50 rounded-lg p-3 border border-blue-200"
                      >
                        <p className="text-sm font-medium text-blue-800">
                          Biến thể {index + 1}
                        </p>
                        <p className="text-blue-900">
                          Giá: {item.price?.toLocaleString()} VNĐ
                        </p>
                        <p className="text-blue-900">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                  to={`edit/${selectedProduct._id}`}
                  className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center transition-colors duration-200 font-medium cursor-pointer"
                  aria-label="Chỉnh sửa sản phẩm"
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
            aria-label="Thêm sản phẩm mới"
          >
            <Plus className="w-4 h-4 mr-2" />
            THÊM SẢN PHẨM
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 sm:mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Tổng sản phẩm</p>
              <p className="text-2xl font-bold text-blue-800">
                {totalProducts}
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
                {activeProducts}
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
                {inactiveProducts}
              </p>
            </div>
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <EyeOff className="w-4 h-4 text-white" />
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
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Tên sản phẩm"
                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                value={tempSearchTerm}
                onChange={(e) => setTempSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>
          <div>
            <CustomSelect
              key={`brandFilter-${tempSelectedBrand}`}
              name="brandFilter"
              options={brandOptions}
              label="Thương hiệu"
              placeholder="Tất cả"
              value={tempSelectedBrand}
              onChange={(value) => setTempSelectedBrand(value)}
              withSearch={true}
            />
          </div>
          <div>
            <CustomSelect
              key={`categoryFilter-${tempSelectedCategory}`}
              name="categoryFilter"
              options={categoryOptions}
              label="Danh mục"
              placeholder="Tất cả"
              value={tempSelectedCategory}
              onChange={(value) => setTempSelectedCategory(value)}
              withSearch={true}
            />
          </div>
          <div>
            <CustomSelect
              key={`statusFilter-${tempStatusFilter}`}
              name="statusFilter"
              options={statusOptions}
              label="Trạng thái"
              placeholder="Tất cả"
              value={tempStatusFilter}
              onChange={(value) => setTempStatusFilter(value)}
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
        <div className="bg-[#00D5BE] text-white p-3 rounded-t-sm">
          <h2 className="text-base font-semibold">QUẢN LÝ SẢN PHẨM</h2>
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
                  Tên sản phẩm
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Thương hiệu
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Danh mục
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
              {products.map((product, index) => (
                <tr key={product._id} className="hover:bg-gray-100">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {(currentPage - 1) * (itemsPerPage || 1) + index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-12 h-12 bg-gray-200 rounded border border-gray-300 flex items-center justify-center flex-shrink-0">
                      <img
                        src={product.thumbUrl || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-contain rounded"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div
                        className={`w-full h-full bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs ${
                          product.thumbUrl ? "hidden" : "flex"
                        }`}
                      >
                        <span>📷</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium max-w-xs">
                    <span title={product.name}>
                      {truncateText(product.name, 40)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {product.brand?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {product.category?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.isActive ? "Hoạt động" : "Không hoạt động"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <Link
                        to={`add-variant/${product._id}`}
                        className="px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 flex items-center cursor-pointer"
                        aria-label="Thêm biến thể"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Thêm biến thể
                      </Link>
                      <Link
                        to={`edit/${product._id}`}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 flex items-center cursor-pointer"
                        aria-label="Sửa sản phẩm"
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Sửa
                      </Link>
                      <button
                        onClick={() => handleShowDetails(product)}
                        className="px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 flex items-center cursor-pointer"
                        aria-label="Xem chi tiết sản phẩm"
                      >
                        <Info className="w-3 h-3 mr-1" />
                        Chi tiết
                      </button>
                      <button
                        onClick={() =>
                          handleToggleConfirm(product._id, product.isActive)
                        }
                        className={`px-3 py-1 rounded text-xs flex items-center cursor-pointer transition-colors ${
                          product.isActive
                            ? "bg-orange-500 text-white hover:bg-orange-600"
                            : "bg-green-500 text-white hover:bg-green-600"
                        }`}
                        aria-label={
                          product.isActive ? "Ẩn sản phẩm" : "Hiển thị sản phẩm"
                        }
                      >
                        {product.isActive ? (
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
            {products.map((product, index) => (
              <div key={product._id} className="p-4 hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        #{(currentPage - 1) * (itemsPerPage || 1) + index + 1} -{" "}
                        {truncateText(product.name, 30)}
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        <p>Thương hiệu: {product.brand?.name || "N/A"}</p>
                        <p>Danh mục: {product.category?.name || "N/A"}</p>
                      </div>
                      <div className="mt-1">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.isActive ? "Hoạt động" : "Không hoạt động"}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2 flex-shrink-0">
                      <Link
                        to={`add-variant/${product._id}`}
                        className="px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 flex items-center cursor-pointer"
                        aria-label="Thêm biến thể"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Thêm biến thể
                      </Link>
                      <Link
                        to={`edit/${product._id}`}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 flex items-center cursor-pointer"
                        aria-label="Sửa sản phẩm"
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Sửa
                      </Link>
                      <button
                        onClick={() => handleShowDetails(product)}
                        className="px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 flex items-center cursor-pointer"
                        aria-label="Xem chi tiết sản phẩm"
                      >
                        <Info className="w-3 h-3 mr-1" />
                        Chi tiết
                      </button>
                      <button
                        onClick={() =>
                          handleToggleConfirm(product._id, product.isActive)
                        }
                        className={`px-3 py-1 rounded text-xs flex items-center cursor-pointer transition-colors ${
                          product.isActive
                            ? "bg-orange-500 text-white hover:bg-orange-600"
                            : "bg-green-500 text-white hover:bg-green-600"
                        }`}
                        aria-label={
                          product.isActive ? "Ẩn sản phẩm" : "Hiển thị sản phẩm"
                        }
                      >
                        {product.isActive ? (
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
            ))}
          </div>
        </div>
        {products.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {appliedSearchTerm ||
            appliedStatusFilter ||
            appliedSelectedBrand ||
            appliedSelectedCategory
              ? "Không có sản phẩm nào phù hợp với điều kiện lọc"
              : "Chưa có sản phẩm nào"}
          </div>
        )}
        {totalProducts > (itemsPerPage || 1) && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
              <div className="text-sm text-gray-700">
                Hiển thị {(currentPage - 1) * (itemsPerPage || 1) + 1} -{" "}
                {Math.min(currentPage * (itemsPerPage || 1), totalProducts)} của{" "}
                {totalProducts} mục
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
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => {
          setSelectedProduct(null);
        }}
        updateProductItems={updateProductItems}
      />
    </div>
  );
};

export default Product;