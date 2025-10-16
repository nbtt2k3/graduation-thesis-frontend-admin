"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Package,
  Star,
  ShoppingCart,
  Barcode,
  Check,
  Loader2,
  Edit,
  FileText,
  Info,
} from "lucide-react";
import * as apis from "../../apis";
import { toast } from "react-hot-toast";

const ProductDetailModal = ({
  product,
  isOpen,
  onClose,
  updateProductItems,
}) => {
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [productItems, setProductItems] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dropdownRef = useRef(null);

  const formatPrice = (price) => {
    if (!price && price !== 0) return "N/A";
    return price.toLocaleString("vi-VN") + "đ";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "out_of_stock":
        return "bg-red-100 text-red-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Hoạt động";
      case "out_of_stock":
        return "Hết hàng";
      case "inactive":
        return "Không hoạt động";
      default:
        return "Không xác định";
    }
  };

  const renderVideoPlayer = (videoUrl) => {
    if (!videoUrl) return null;

    if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
      let videoId = "";
      if (videoUrl.includes("youtube.com/watch?v=")) {
        videoId = videoUrl.split("v=")[1]?.split("&")[0];
      } else if (videoUrl.includes("youtu.be/")) {
        videoId = videoUrl.split("youtu.be/")[1]?.split("?")[0];
      }

      if (videoId) {
        return (
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="Product Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
    }

    if (videoUrl.includes("vimeo.com")) {
      const videoId = videoUrl.split("vimeo.com/")[1]?.split("?")[0];
      if (videoId) {
        return (
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              src={`https://player.vimeo.com/video/${videoId}`}
              title="Product Video"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
    }

    if (videoUrl.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) {
      return (
        <video className="w-full h-auto rounded-lg" controls preload="metadata">
          <source src={videoUrl} type="video/mp4" />
          Trình duyệt của bạn không hỗ trợ video.
        </video>
      );
    }

    return (
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="text-sm text-gray-600 mb-2">Video URL:</p>
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline break-all text-sm cursor-pointer"
        >
          {videoUrl}
        </a>
      </div>
    );
  };

  const handleStatusChange = async (productItemId, newStatus) => {
    try {
      setUpdatingStatus(productItemId);
      setIsRefreshing(true);
      const response = await apis.updateProductItemStatus(productItemId, {
        status: newStatus,
      });

      if (Array.isArray(response.productItems)) {
        setProductItems(response.productItems);
        if (product?._id) {
          updateProductItems(product._id, response.productItems);
        }
      } else {
        setProductItems((prevItems) =>
          prevItems.map((item) =>
            item?._id === productItemId ? { ...item, status: newStatus } : item
          )
        );
        if (product?._id) {
          updateProductItems(
            product._id,
            productItems.map((item) =>
              item?._id === productItemId
                ? { ...item, status: newStatus }
                : item
            )
          );
        }
      }
    } catch (error) {
      setProductItems((prevItems) =>
        prevItems.map((item) =>
          item?._id === productItemId ? { ...item, status: newStatus } : item
        )
      );
      if (product?._id) {
        updateProductItems(
          product._id,
          productItems.map((item) =>
            item?._id === productItemId ? { ...item, status: newStatus } : item
          )
        );
      }
      toast.error(error.msg || "Không thể cập nhật trạng thái hoặc tải lại dữ liệu");
    } finally {
      setUpdatingStatus(null);
      setIsRefreshing(false);
      setOpenDropdown(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (product && product.productItems) {
      setProductItems(product.productItems);
    }
  }, [product]);

  if (!isOpen) return null;

  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 rounded-t-2xl flex justify-between items-start sticky top-0 z-10">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-lg sm:text-xl font-bold">CHI TIẾT SẢN PHẨM</h2>
            <p className="text-sm opacity-90 mt-1 break-words text-blue-100">
              {product.name || "N/A"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200 cursor-pointer"
            aria-label="Đóng chi tiết"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {isRefreshing && (
            <div className="flex justify-center items-center mb-4">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="ml-2 text-sm text-gray-500">
                Đang tải lại dữ liệu...
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border-l-4 border-blue-500">
                <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                  Hình ảnh chính
                </h3>
                <img
                  src={product.thumbUrl || "/placeholder.svg"}
                  alt={product.name || "Product"}
                  className="w-full h-48 sm:h-64 object-contain border border-gray-300 rounded-lg bg-white"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 sm:p-6 border-l-4 border-blue-500">
                <h3 className="text-base sm:text-lg font-semibold mb-4">
                  Thông tin cơ bản
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Tên sản phẩm
                        </p>
                        <p className="text-gray-900 mt-1 font-semibold break-words">
                          {product.name || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Info className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Thương hiệu
                        </p>
                        <p className="text-blue-600 mt-1 font-semibold">
                          {product.brand?.name || "N/A"}
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
                          Danh mục
                        </p>
                        <p className="text-green-600 mt-1 font-semibold">
                          {product.category?.name || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Trạng thái
                        </p>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${
                            product.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.isActive ? "Hoạt động" : "Không hoạt động"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {product.videoUrl && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 sm:p-6 border-l-4 border-blue-500">
                  <h3 className="text-base sm:text-lg font-semibold mb-4">
                    Video giới thiệu
                  </h3>
                  {renderVideoPlayer(product.videoUrl)}
                </div>
              )}
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 sm:p-6 border-l-4 border-blue-500">
              <h3 className="text-base sm:text-lg font-semibold mb-4">
                Mô tả sản phẩm
              </h3>
              <div
                className="max-w-none leading-relaxed text-gray-700 text-sm sm:text-base space-y-3
    [&>h1]:text-lg [&>h1]:font-bold
    [&>h2]:text-base [&>h2]:font-semibold
    [&>ul]:list-disc [&>ul]:pl-5
    [&>ol]:list-decimal [&>ol]:pl-5
    [&>a]:text-blue-600 [&>a]:hover:underline
    [&>table]:w-full [&>table]:border [&>table]:border-gray-300 [&>table]:text-left [&>table]:border-collapse
    [&>thead>tr>th]:border [&>thead>tr>th]:border-gray-300 [&>thead>tr>th]:bg-gray-100 [&>thead>tr>th]:p-2 [&>thead>tr>th]:text-sm [&>thead>tr>th]:font-semibold
    [&>tbody>tr>td]:border [&>tbody>tr>td]:border-gray-300 [&>tbody>tr>td]:p-2 [&>tbody>tr>td]:text-sm"
                dangerouslySetInnerHTML={{ __html: product.description || "" }}
              />
            </div>
          </div>

          {product.featuredImages && product.featuredImages.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-semibold mb-4">
                Hình ảnh nổi bật
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {product.featuredImages.map((img, index) => (
                  <div key={index} className="bg-gray-50 p-2 rounded-lg">
                    <img
                      src={img?.image || "/placeholder.svg"}
                      alt={`Featured ${index + 1}`}
                      className="w-full h-24 sm:h-32 object-contain rounded border border-gray-300 bg-white"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.specifications && product.specifications.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-semibold mb-4">
                Thông số kỹ thuật
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {product.specifications.map((spec, index) => (
                  <div
                    key={index}
                    className="border rounded-xl p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-l-4 border-blue-500"
                  >
                    <h4 className="font-semibold mb-3 text-blue-600 text-base sm:text-lg">
                      {spec?.group || `Nhóm ${index + 1}`}
                    </h4>
                    <div className="space-y-2">
                      {spec.items?.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-300 last:border-b-0"
                        >
                          <span className="font-medium text-gray-700 text-sm">
                            {item?.label || "N/A"}:
                          </span>
                          <span className="text-gray-900 font-semibold text-sm break-words">
                            {item?.value || "N/A"}
                          </span>
                        </div>
                      )) || (
                        <p className="text-sm text-gray-500 italic">
                          Không có thông số chi tiết
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center">
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
              Mục sản phẩm ({productItems?.length || 0} mục)
            </h3>
            <div className="space-y-4 sm:space-y-6">
              {productItems?.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-300 rounded-xl p-4 sm:p-6 bg-white shadow-sm"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="lg:col-span-1">
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <img
                          src={item?.thumbUrl || "/placeholder.svg"}
                          alt={item?.name || "Item"}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-contain border border-gray-300 rounded bg-gray-50 flex-shrink-0"
                          loading="lazy"
                        />
                        <div className="flex-1 min-w-0 space-y-3">
                          <h4 className="font-semibold text-base sm:text-lg text-gray-800 break-words">
                            {item?.name || `Mục ${index + 1}`}
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center text-xs sm:text-sm">
                              <Barcode className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                              <span className="font-mono break-all">
                                {item?.barcode || "N/A"}
                              </span>
                            </div>
                            {item?.barcodeImageUrl && (
                              <img
                                src={item.barcodeImageUrl || "/placeholder.svg"}
                                alt={`Barcode ${item?.barcode || "N/A"}`}
                                className="h-12 sm:h-16 object-contain bg-white p-2 rounded border border-gray-300"
                                loading="lazy"
                              />
                            )}
                            <div className="text-xs sm:text-sm text-gray-600">
                              SKU: {item?.sku || "N/A"}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                item?.status
                              )}`}
                            >
                              {getStatusText(item?.status)}
                            </span>
                            <div className="relative">
                              <button
                                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-1 px-3 rounded-md flex items-center cursor-pointer"
                                onClick={() => {
                                  setOpenDropdown(
                                    openDropdown === item?._id
                                      ? null
                                      : item?._id
                                  );
                                }}
                                disabled={
                                  !item?._id ||
                                  updatingStatus === item?._id ||
                                  isRefreshing
                                }
                              >
                                {updatingStatus === item?._id ? (
                                  <>
                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                    Đang cập nhật...
                                  </>
                                ) : (
                                  <>
                                    <Edit className="w-3 h-3 mr-1" />
                                    Đổi trạng thái
                                  </>
                                )}
                              </button>
                              {openDropdown === item?._id && (
                                <div
                                  ref={dropdownRef}
                                  className="absolute left-0 mt-1 w-40 bg-white rounded-md shadow-lg z-10 dropdown-menu"
                                >
                                  <ul className="py-1 text-sm">
                                    <li>
                                      <button
                                        onClick={() => {
                                          if (item?._id) {
                                            handleStatusChange(
                                              item._id,
                                              "active"
                                            );
                                          }
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-green-50 flex items-center cursor-pointer"
                                        disabled={
                                          item?.status === "active" ||
                                          updatingStatus === item?._id ||
                                          isRefreshing ||
                                          !item?._id
                                        }
                                      >
                                        {item?.status === "active" && (
                                          <Check className="w-3 h-3 mr-1 text-green-600" />
                                        )}
                                        <span
                                          className={
                                            item?.status === "active"
                                              ? "font-medium text-green-600"
                                              : ""
                                          }
                                        >
                                          Hoạt động
                                        </span>
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                        onClick={() => {
                                          if (item?._id) {
                                            handleStatusChange(
                                              item._id,
                                              "out_of_stock"
                                            );
                                          }
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center cursor-pointer"
                                        disabled={
                                          item?.status === "out_of_stock" ||
                                          updatingStatus === item?._id ||
                                          isRefreshing ||
                                          !item?._id
                                        }
                                      >
                                        {item?.status === "out_of_stock" && (
                                          <Check className="w-3 h-3 mr-1 text-red-600" />
                                        )}
                                        <span
                                          className={
                                            item?.status === "out_of_stock"
                                              ? "font-medium text-red-600"
                                              : ""
                                          }
                                        >
                                          Hết hàng
                                        </span>
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                        onClick={() => {
                                          if (item?._id) {
                                            handleStatusChange(
                                              item._id,
                                              "inactive"
                                            );
                                          }
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center cursor-pointer"
                                        disabled={
                                          item?.status === "inactive" ||
                                          updatingStatus === item?._id ||
                                          isRefreshing ||
                                          !item?._id
                                        }
                                      >
                                        {item?.status === "inactive" && (
                                          <Check className="w-3 h-3 mr-1 text-gray-600" />
                                        )}
                                        <span
                                          className={
                                            item?.status === "inactive"
                                              ? "font-medium text-gray-600"
                                              : ""
                                          }
                                        >
                                          Không hoạt động
                                        </span>
                                      </button>
                                    </li>
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 flex flex-col items-center justify-center h-20">
                          <div className="text-sm sm:text-base font-semibold text-blue-600 flex items-center">
                            <svg
                              className="w-4 h-4 sm:w-5 sm:h-5 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              ></path>
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              ></path>
                            </svg>
                            {item?.viewCount || 0}
                          </div>
                          <div className="text-xs text-blue-800 mt-1">
                            Lượt xem
                          </div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200 flex flex-col items-center justify-center h-20">
                          <div className="text-sm sm:text-base font-semibold text-green-600 flex items-center">
                            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                            {item?.soldCount || 0}
                          </div>
                          <div className="text-xs text-green-800 mt-1">
                            Đã bán
                          </div>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 flex flex-col items-center justify-center h-20">
                          <div className="text-sm sm:text-base font-semibold text-yellow-600 flex items-center">
                            <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                            {(item?.ratingAvg || 0).toFixed(1)}
                          </div>
                          <div className="text-xs text-yellow-800 mt-1">
                            Đánh giá
                          </div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 flex flex-col items-center justify-center h-20">
                          <div className="text-sm sm:text-base font-semibold text-purple-600 flex items-center">
                            <svg
                              className="w-4 h-4 sm:w-5 sm:h-5 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5v-4a2 2 0 012-2h10a2 2 0 012 2v4h-4M12 4v6"
                              ></path>
                            </svg>
                            {item?.reviewCount || 0}
                          </div>
                          <div className="text-xs text-purple-800 mt-1">
                            Bình luận
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-1">
                      <div className="space-y-3">
                        <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200">
                          <span className="text-xs sm:text-sm text-gray-600 font-medium">
                            Giá bán lẻ:
                          </span>
                          <div className="text-base sm:text-lg font-bold text-green-600 mt-1">
                            {formatPrice(item?.retailPrice)}
                          </div>
                        </div>
                        <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border border-purple-200">
                          <span className="text-xs sm:text-sm text-gray-600 font-medium">
                            Tồn kho:
                          </span>
                          <div className="text-base sm:text-lg font-bold text-purple-600 mt-1">
                            {item?.inventory?.[0]?.quantity || 0} sản phẩm
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-1">
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                        <span className="text-xs sm:text-sm text-gray-600 font-medium">
                          Thuộc tính:
                        </span>
                        <div className="mt-2 space-y-2">
                          {item?.attributes?.length > 0 ? (
                            item.attributes.map((attr, attrIndex) => (
                              <div
                                key={attrIndex}
                                className="bg-gray-100 px-2 sm:px-3 py-2 rounded-lg flex justify-between"
                              >
                                <span className="font-medium text-gray-700 text-xs sm:text-sm">
                                  {attr?.code || "N/A"}:
                                </span>
                                <span className="ml-2 text-gray-900 text-xs sm:text-sm break-words">
                                  {attr?.value || "N/A"}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 italic">
                              Không có thuộc tính
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {item?.specifications && item.specifications.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <span className="text-xs sm:text-sm text-gray-600 font-medium">
                        Thông số kỹ thuật:
                      </span>
                      <div className="mt-2">
                        {item.specifications.map((spec, specIndex) => (
                          <div
                            key={spec._id || specIndex}
                            className="border rounded-xl p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-l-4 border-blue-500 mb-4"
                          >
                            <h4 className="font-semibold mb-3 text-blue-600 text-base sm:text-lg">
                              {spec?.group || `Nhóm ${specIndex + 1}`}
                            </h4>
                            <div className="space-y-2">
                              {spec.items?.map((specItem, itemIndex) => (
                                <div
                                  key={specItem._id || itemIndex}
                                  className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-300 last:border-b-0"
                                >
                                  <span className="font-medium text-gray-700 text-sm">
                                    {specItem?.label || "N/A"}:
                                  </span>
                                  <span className="text-gray-900 font-semibold text-sm break-words">
                                    {specItem?.value || "N/A"}
                                  </span>
                                </div>
                              )) || (
                                <p className="text-sm text-gray-500 italic">
                                  Không có thông số chi tiết
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {item?.images && item.images.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <span className="text-xs sm:text-sm text-gray-600 font-medium">
                        Hình ảnh bổ sung:
                      </span>
                      <div className="mt-2 grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {item.images.map((img, imgIndex) => (
                          <img
                            key={imgIndex}
                            src={img?.image || "/placeholder.svg"}
                            alt={`${item?.name || "Item"} ${imgIndex + 1}`}
                            className="w-full h-12 sm:h-16 object-contain border border-gray-300 rounded bg-gray-50"
                            loading="lazy"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-4 sm:px-6 py-4 border-t border-gray-300 rounded-b-2xl flex justify-end sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 sm:px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium cursor-pointer"
            aria-label="Đóng chi tiết"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
