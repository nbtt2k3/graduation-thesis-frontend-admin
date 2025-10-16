"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import * as apis from "../../../apis";

const DISCOUNT_TYPES = ["percentage", "fixed"];
const MAX_NUMBER = 9999999999999999n;
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const CreateDiscount = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const wrapperRef = useRef(null);
  const [selectedType, setSelectedType] = useState("percentage");
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const typeWrapperRef = useRef(null);

  const formatLocalDate = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const normalizeDateTime = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    getValues,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      type: "percentage",
      value: "",
      validFrom: (() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return formatLocalDate(tomorrow);
      })(),
      validTo: (() => {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 31);
        endDate.setHours(0, 0, 0, 0);
        return formatLocalDate(endDate);
      })(),
      productIds: [],
      isActive: true,
    },
    mode: "onChange",
  });

  const watchedFields = watch();

  const formatNumber = (value) => {
    if (!value) return "";
    const numericValue = value.toString().replace(/[^0-9]/g, "");
    if (!numericValue) return "";
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const parseFormattedNumber = (value) => {
    if (!value) return "";
    return value.replace(/,/g, "").trim();
  };

  const handleFormattedNumericChange = (e) => {
    let rawValue = e.target.value.replace(/[^0-9]/g, "").trim();
    const type = getValues("type");

    if (rawValue.length > 16 || Number(rawValue) > MAX_NUMBER) {
      rawValue = String(Math.min(Number(rawValue), MAX_NUMBER)).slice(0, 16);
    }

    if (type === "percentage" && rawValue) {
      if (Number(rawValue) > 100) {
        rawValue = "100";
        toast.error("Giá trị phần trăm không được lớn hơn 100");
      }
    }

    const formattedValue = formatNumber(rawValue);

    setValue("value", rawValue, {
      shouldValidate: true,
      shouldDirty: true,
    });

    if (rawValue && Number(rawValue) > 0) {
      clearErrors("value");
    }

    setTimeout(() => {
      e.target.value = formattedValue;
      e.target.setSelectionRange(formattedValue.length, formattedValue.length);
    }, 0);
  };

  useEffect(() => {
    const fetchProductsAndDiscounts = async () => {
      try {
        setIsFetchingProducts(true);
        setLoading(true);
        const productResponse = await apis.apiGetAllProducts({
          limit: 0,
          isActive: true,
        });
        const productsList = productResponse.productList || [];

        const discountResponse = await apis.apiGetAllDiscounts({
          isActive: true,
        });
        const discounts = discountResponse.discountList || [];

        const currentDate = new Date();

        const discountedProductIds = new Set(
          discounts
            .filter((discount) => new Date(discount.validTo) >= currentDate)
            .flatMap((discount) => discount.productIds || [])
        );

        const availableProducts = productsList.filter(
          (product) => !discountedProductIds.has(product._id)
        );

        setProducts(availableProducts);
      } catch (error) {
        if (error?.msg) {
          toast.error(error.msg || "Không thể tải dữ liệu. Vui lòng thử lại.");
        }
      } finally {
        setIsFetchingProducts(false);
        setLoading(false);
      }
    };

    fetchProductsAndDiscounts();
  }, [setValue]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setProductSearchTerm("");
      }
      if (
        typeWrapperRef.current &&
        !typeWrapperRef.current.contains(event.target)
      ) {
        setIsTypeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleProductSelect = (productId) => {
    if (
      productId &&
      !selectedProducts.includes(productId) &&
      objectIdPattern.test(productId)
    ) {
      const newProductIds = [...selectedProducts, productId];
      setSelectedProducts(newProductIds);
      setValue("productIds", newProductIds, { shouldValidate: true });
      clearErrors("productIds");
      setProductSearchTerm("");
    } else {
      toast.error("productId không hợp lệ");
    }
  };

  const handleProductRemove = (productId) => {
    const newProductIds = selectedProducts.filter((id) => id !== productId);
    setSelectedProducts(newProductIds);
    setValue("productIds", newProductIds, { shouldValidate: true });
    clearErrors("productIds");
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setValue("type", type, { shouldValidate: true, shouldDirty: true });
    setIsTypeDropdownOpen(false);
    const currentValue = parseFormattedNumber(getValues("value"));
    if (currentValue) {
      setValue("value", formatNumber(currentValue), {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const payload = {
        name: data.name.trim(),
        description: data.description.trim(),
        type: data.type,
        value: Number(parseFormattedNumber(data.value)) || 0,
        validFrom: normalizeDateTime(data.validFrom),
        validTo: normalizeDateTime(data.validTo),
        productIds: data.productIds,
        isActive: data.isActive,
      };

      const response = await apis.apiCreateDiscount(payload);

      navigate("/promotions/discount-management", {
        state: { discountCreated: response?.msg },
      });
    } catch (error) {
      if (error?.msg) {
        toast.error(error.msg || "Không thể tạo discount. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      !selectedProducts.includes(product._id) &&
      product.name.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 bg-white h-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-500">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 bg-white h-auto">
      <div className="mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-sm hover:bg-gray-300 flex items-center cursor-pointer disabled:cursor-not-allowed"
          disabled={isLoading || isFetchingProducts}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          QUẢN LÝ DISCOUNT
        </button>
      </div>

      <div className="bg-white rounded-sm shadow-md">
        <div className="bg-[#00D5BE] text-white p-4 rounded-t-sm">
          <h2 className="text-lg font-semibold">TẠO DISCOUNT</h2>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên discount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("name", {
                      required: "Tên discount là bắt buộc",
                      minLength: {
                        value: 2,
                        message: "Tên discount phải có ít nhất 2 ký tự",
                      },
                      maxLength: {
                        value: 100,
                        message: "Tên discount không được vượt quá 100 ký tự",
                      },
                      validate: {
                        notOnlyWhitespace: (value) =>
                          value.trim().length > 0 || "Tên discount không được chỉ chứa khoảng trắng",
                        isString: (val) =>
                          typeof val === "string" || "Tên discount phải là chuỗi",
                      },
                    })}
                    value={watchedFields.name || ""}
                    placeholder="Tên discount"
                    className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isLoading || isFetchingProducts}
                    onChange={(e) => {
                      setValue("name", e.target.value, {
                        shouldValidate: true,
                      });
                      if (e.target.value.trim().length >= 2) {
                        clearErrors("name");
                      }
                    }}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register("description", {
                      required: "Mô tả là bắt buộc",
                      minLength: {
                        value: 10,
                        message: "Mô tả phải có ít nhất 10 ký tự",
                      },
                      validate: {
                        notOnlyWhitespace: (value) =>
                          value.trim().length > 0 || "Mô tả không được chỉ chứa khoảng trắng",
                        isString: (val) =>
                          typeof val === "string" || "Mô tả phải là chuỗi",
                      },
                    })}
                    value={watchedFields.description || ""}
                    placeholder="Mô tả discount"
                    className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.description ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isLoading || isFetchingProducts}
                    onChange={(e) => {
                      setValue("description", e.target.value, {
                        shouldValidate: true,
                      });
                      if (e.target.value.trim().length >= 10) {
                        clearErrors("description");
                      }
                    }}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại discount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="hidden"
                    {...register("type", {
                      required: "Loại discount là bắt buộc",
                      validate: (value) =>
                        DISCOUNT_TYPES.includes(value) ||
                        `Loại discount chỉ được là: ${DISCOUNT_TYPES.join(", ")}`,
                    })}
                  />
                  <div ref={typeWrapperRef} className="relative w-full">
                    <div
                      className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex items-center justify-between ${
                        errors.type ? "border-red-500" : "border-gray-300"
                      } ${isTypeDropdownOpen ? "ring-2 ring-blue-500" : ""}`}
                      onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                      disabled={isLoading || isFetchingProducts}
                    >
                      <span className="text-gray-700">
                        {selectedType
                          ? selectedType === "percentage"
                            ? "Phần trăm"
                            : "Cố định"
                          : "Chọn loại discount"}
                      </span>
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          isTypeDropdownOpen ? "rotate-180" : ""
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
                    {isTypeDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-sm shadow-lg max-h-40 overflow-y-auto">
                        {[
                          { value: "percentage", label: "Phần trăm" },
                          { value: "fixed", label: "Cố định" },
                        ].map((option) => (
                          <div
                            key={option.value}
                            className="type-option p-2 hover:bg-gray-100 cursor-pointer text-sm md:text-sm sm:text-[14px] sm:px-3 sm:py-2"
                            onClick={() => handleTypeSelect(option.value)}
                          >
                            {option.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.type && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.type.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá trị <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9,]*"
                    maxLength="16"
                    {...register("value", {
                      required: "Giá trị giảm là bắt buộc",
                      pattern: {
                        value: /^[0-9,]+$/,
                        message: "Giá trị giảm phải là số",
                      },
                      validate: {
                        notOnlyWhitespace: (value) =>
                          parseFormattedNumber(value).length > 0 ||
                          "Giá trị giảm không được chỉ chứa khoảng trắng",
                        positive: (val) =>
                          Number(parseFormattedNumber(val)) > 0 ||
                          "Giá trị giảm phải lớn hơn 0",
                        maxPercentage: (val) =>
                          getValues("type") !== "percentage" ||
                          Number(parseFormattedNumber(val)) <= 100 ||
                          "Giá trị phần trăm không được lớn hơn 100",
                        maxNumber: (val) =>
                          Number(parseFormattedNumber(val)) <= MAX_NUMBER ||
                          "Giá trị giảm không được vượt quá 16 chữ số",
                        maxLength: (val) =>
                          parseFormattedNumber(val).length <= 16 ||
                          "Giá trị không được vượt quá 16 ký tự",
                      },
                    })}
                    value={formatNumber(watchedFields.value || "")}
                    placeholder="Giá trị discount"
                    className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.value ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isLoading || isFetchingProducts}
                    onChange={handleFormattedNumericChange}
                  />
                  {errors.value && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.value.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hiệu lực từ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...register("validFrom", {
                      required: "Ngày bắt đầu là bắt buộc",
                      validate: (val) => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        tomorrow.setHours(0, 0, 0, 0);
                        return (
                          new Date(val) >= tomorrow ||
                          "Ngày bắt đầu phải từ ngày mai trở đi"
                        );
                      },
                    })}
                    value={watchedFields.validFrom || ""}
                    className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.validFrom ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isLoading || isFetchingProducts}
                    onChange={(e) => {
                      const normalizedDate = formatLocalDate(e.target.value);
                      setValue("validFrom", normalizedDate, {
                        shouldValidate: true,
                      });
                      if (e.target.value) {
                        clearErrors("validFrom");
                      }
                    }}
                  />
                  {errors.validFrom && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.validFrom.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hiệu lực đến <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...register("validTo", {
                      required: "Ngày kết thúc là bắt buộc",
                      validate: (val) => {
                        const validFrom = getValues("validFrom");
                        return (
                          !validFrom ||
                          !val ||
                          new Date(val) > new Date(validFrom) ||
                          "Ngày kết thúc phải lớn hơn ngày bắt đầu"
                        );
                      },
                    })}
                    value={watchedFields.validTo || ""}
                    className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.validTo ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isLoading || isFetchingProducts}
                    onChange={(e) => {
                      const normalizedDate = formatLocalDate(e.target.value);
                      setValue("validTo", normalizedDate, {
                        shouldValidate: true,
                      });
                      if (e.target.value && getValues("validFrom")) {
                        clearErrors("validTo");
                      }
                    }}
                  />
                  {errors.validTo && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.validTo.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sản phẩm áp dụng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="hidden"
                    {...register("productIds", {
                      validate: (value) =>
                        value.length > 0 ||
                        "Danh sách sản phẩm phải có ít nhất 1 phần tử",
                    })}
                  />
                  <div ref={wrapperRef} className="relative w-full">
                    <div
                      className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex flex-wrap items-center gap-2 ${
                        errors.productIds ? "border-red-500" : "border-gray-300"
                      } ${isDropdownOpen ? "ring-2 ring-blue-500" : ""}`}
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      {selectedProducts.length === 0 && (
                        <span className="text-gray-500">Chọn sản phẩm</span>
                      )}
                      {selectedProducts.map((productId) => {
                        const product = products.find(
                          (p) => p._id === productId
                        );
                        return product ? (
                          <div
                            key={productId}
                            className="flex items-center bg-gray-100 px-2 py-1 rounded-sm text-sm border border-gray-300"
                          >
                            <span className="mr-1">{product.name}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProductRemove(productId);
                              }}
                              className="text-gray-500 hover:text-red-500 focus:outline-none cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : null;
                      })}
                      <svg
                        className={`w-4 h-4 transition-transform ml-auto ${
                          isDropdownOpen ? "rotate-180" : ""
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
                    {isDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-sm shadow-lg max-h-60 overflow-y-auto">
                        <div className="p-2">
                          <input
                            type="text"
                            placeholder="Tìm sản phẩm..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                            value={productSearchTerm}
                            onChange={(e) =>
                              setProductSearchTerm(e.target.value)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        {isFetchingProducts ? (
                          <div className="p-2 text-gray-500">
                            Đang tải sản phẩm...
                          </div>
                        ) : filteredProducts.length > 0 ? (
                          filteredProducts.map((product) => (
                            <div
                              key={product._id}
                              className="p-2 hover:bg-gray-100 cursor-pointer text-sm md:text-sm sm:text-[14px] sm:px-3 sm:py-2"
                              onClick={() => handleProductSelect(product._id)}
                            >
                              {product.name}
                            </div>
                          ))
                        ) : (
                          <div className="p-2 text-gray-500">
                            Không có sản phẩm nào khả dụng
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {errors.productIds && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.productIds.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      {...register("isActive", {
                        required: "Trạng thái là bắt buộc",
                        validate: (val) =>
                          typeof val === "boolean" ||
                          "Trạng thái phải là true hoặc false",
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                      disabled={isLoading || isFetchingProducts}
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Kích hoạt
                    </span>
                  </label>
                  {errors.isActive && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.isActive.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-2 bg-gray-500 text-white rounded-sm hover:bg-gray-600 cursor-pointer disabled:cursor-not-allowed"
                disabled={isLoading || isFetchingProducts}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-pink-500 text-white rounded-sm hover:bg-pink-600 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                disabled={isLoading || isFetchingProducts}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    THÊM
                  </>
                )}
              </button>
            </div>
          </form>

          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto">
                <h3 className="text-lg font-medium text-gray-900 p-6 border-b border-gray-200">
                  Xác nhận hủy
                </h3>
                <div className="p-6">
                  <p className="text-sm text-gray-500 mb-6">
                    Bạn có chắc muốn hủy? Dữ liệu sẽ không được lưu.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                    <button
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 cursor-pointer transition-colors duration-200 w-full sm:w-auto"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Tiếp tục
                    </button>
                    <button
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 cursor-pointer transition-colors duration-200 w-full sm:w-auto"
                      onClick={() => {
                        setIsModalOpen(false);
                        navigate("/promotions/discount-management");
                      }}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateDiscount;