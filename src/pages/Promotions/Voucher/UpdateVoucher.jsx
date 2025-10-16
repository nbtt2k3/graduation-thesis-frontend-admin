"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as apis from "../../../apis";
import { toast } from "react-hot-toast";
import { LoadingSpinner } from "../../../components";

const COUPON_TYPES = ["percentage", "fixed"];
const COUPON_APPLY_TO = ["product", "shipping"];
const PERCENTAGE = "percentage";
const FIXED = "fixed";
const MAX_NUMBER = 9999999999999999n;

const UpdateVoucher = () => {
  const navigate = useNavigate();
  const { voucherId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("percentage");
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const typeWrapperRef = useRef(null);
  const [selectedApplyTo, setSelectedApplyTo] = useState("product");
  const [isApplyToDropdownOpen, setIsApplyToDropdownOpen] = useState(false);
  const applyToWrapperRef = useRef(null);
  const [originalValidFrom, setOriginalValidFrom] = useState(null);
  const [originalValidTo, setOriginalValidTo] = useState(null);
  const [isValidFromDisabled, setIsValidFromDisabled] = useState(false);
  const [isValidToDisabled, setIsValidToDisabled] = useState(false);

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
    getValues,
    setValue,
    clearErrors,
    reset,
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      type: "percentage",
      value: "",
      minValue: "",
      maxValue: "",
      validFrom: "",
      validTo: "",
      applyTo: "product",
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

  const handleFormattedNumericChange = async (e, fieldName) => {
    let rawValue = e.target.value.replace(/[^0-9]/g, "").trim();
    const type = getValues("type");

    if (rawValue.length > 16 || Number(rawValue) > MAX_NUMBER) {
      rawValue = String(Math.min(Number(rawValue), MAX_NUMBER)).slice(0, 16);
    }

    if (fieldName === "value" && type === "percentage" && rawValue) {
      if (Number(rawValue) > 100) {
        rawValue = "100";
        toast.error("Giá trị phần trăm không được lớn hơn 100");
      }
    }

    const formattedValue = formatNumber(rawValue);

    setValue(fieldName, rawValue, {
      shouldValidate: true,
      shouldDirty: true,
    });

    if (fieldName === "value" && type === "fixed") {
      setValue("maxValue", rawValue, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }

    if (rawValue && Number(rawValue) > 0) {
      clearErrors(fieldName);
    }

    setTimeout(() => {
      e.target.value = formattedValue;
      e.target.setSelectionRange(formattedValue.length, formattedValue.length);
    }, 0);
  };

  useEffect(() => {
    const fetchVoucher = async () => {
      try {
        setIsLoading(true);
        const response = await apis.apiGetVoucher(voucherId);
        const voucher = response.voucher;
        const formattedValidFrom = formatLocalDate(new Date(voucher.validFrom));
        const formattedValidTo = formatLocalDate(new Date(voucher.validTo));
        setSelectedType(voucher.type);
        setSelectedApplyTo(voucher.applyTo);
        setOriginalValidFrom(formattedValidFrom);
        setOriginalValidTo(formattedValidTo);
        reset({
          name: voucher.name,
          description: voucher.description,
          type: voucher.type,
          value: voucher.value.toString(),
          minValue: voucher.minValue.toString(),
          maxValue: voucher.maxValue.toString(),
          validFrom: formattedValidFrom,
          validTo: formattedValidTo,
          applyTo: voucher.applyTo,
          isActive: voucher.isActive,
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const validFromDate = new Date(formattedValidFrom);
        validFromDate.setHours(0, 0, 0, 0);
        const validToDate = new Date(formattedValidTo);
        validToDate.setHours(0, 0, 0, 0);
        if (validFromDate <= today) {
          setIsValidFromDisabled(true);
        }
        if (validToDate <= today) {
          setIsValidToDisabled(true);
          toast.error("Voucher đã hết hạn, không thể chỉnh sửa.");
          navigate("/promotions/voucher-management");
          return;
        }
      } catch (error) {
        if (error?.msg) {
          toast.error(error?.msg || "Không thể tải dữ liệu. Vui lòng thử lại.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    if (voucherId) {
      fetchVoucher();
    }
  }, [voucherId, reset, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        typeWrapperRef.current &&
        !typeWrapperRef.current.contains(event.target)
      ) {
        setIsTypeDropdownOpen(false);
      }
      if (
        applyToWrapperRef.current &&
        !applyToWrapperRef.current.contains(event.target)
      ) {
        setIsApplyToDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleTypeSelect = async (type) => {
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
    if (type === "fixed") {
      const formattedValue = formatNumber(currentValue || "");
      setValue("maxValue", formattedValue, {
        shouldValidate: false,
        shouldDirty: true,
      });
    } else {
      const currentMaxValue = parseFormattedNumber(getValues("maxValue"));
      setValue("maxValue", formatNumber(currentMaxValue), {
        shouldValidate: false,
        shouldDirty: true,
      });
    }
  };

  const handleApplyToSelect = (applyTo) => {
    setSelectedApplyTo(applyTo);
    setValue("applyTo", applyTo, { shouldValidate: true, shouldDirty: true });
    setIsApplyToDropdownOpen(false);
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const payload = {
        name: data.name.trim(),
        description: data.description.trim(),
        type: data.type,
        value: Number(parseFormattedNumber(data.value)) || 0,
        minValue: Number(parseFormattedNumber(data.minValue)) || 0,
        maxValue: Number(parseFormattedNumber(data.maxValue)) || 0,
        validFrom: normalizeDateTime(data.validFrom),
        validTo: normalizeDateTime(data.validTo),
        applyTo: data.applyTo,
        isActive: data.isActive,
      };
      const response = await apis.apiUpdateVoucher(voucherId, payload);
      navigate("/promotions/voucher-management", {
        state: { voucherUpdated: response?.msg },
      });
    } catch (error) {
      if (error?.msg) {
        toast.error(error?.msg || "Có lỗi xảy ra. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="p-3 sm:p-6 bg-white h-auto">
      <div className="mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-sm hover:bg-gray-300 flex items-center cursor-pointer disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          QUẢN LÝ VOUCHER
        </button>
      </div>
      <div className="bg-white rounded-sm shadow-md">
        <div className="bg-[#00D5BE] text-white p-4 rounded-t-sm">
          <h2 className="text-lg font-semibold">CẬP NHẬT VOUCHER</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên voucher <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("name", {
                      required: "Tên voucher là bắt buộc",
                      minLength: {
                        value: 2,
                        message: "Tên voucher phải có ít nhất 2 ký tự",
                      },
                      maxLength: {
                        value: 100,
                        message: "Tên voucher không được vượt quá 100 ký tự",
                      },
                      validate: {
                        notOnlyWhitespace: (value) =>
                          value.trim().length > 0 || "Tên voucher không được chỉ chứa khoảng trắng",
                      },
                    })}
                    value={watchedFields.name || ""}
                    placeholder="Tên voucher"
                    className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isLoading}
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
                      },
                    })}
                    value={watchedFields.description || ""}
                    placeholder="Mô tả voucher"
                    className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.description ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isLoading}
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
                    Loại voucher <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="hidden"
                    {...register("type", {
                      required: "Loại voucher là bắt buộc",
                      validate: (value) =>
                        COUPON_TYPES.includes(value) ||
                        `Loại voucher chỉ được là: ${COUPON_TYPES.join(", ")}`,
                    })}
                  />
                  <div ref={typeWrapperRef} className="relative w-full">
                    <div
                      className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex items-center justify-between ${
                        errors.type ? "border-red-500" : "border-gray-300"
                      } ${isTypeDropdownOpen ? "ring-2 ring-blue-500" : ""}`}
                      onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                      disabled={isLoading}
                    >
                      <span className="text-gray-700">
                        {selectedType
                          ? selectedType === "percentage"
                            ? "Phần trăm"
                            : "Cố định"
                          : "Chọn loại voucher"}
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
                            className="type-option p-2 hover:bg-gray-100 cursor-pointer text-sm"
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
                          getValues("type") !== PERCENTAGE ||
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
                    placeholder="Giá trị voucher"
                    className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.value ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isLoading}
                    onChange={(e) => handleFormattedNumericChange(e, "value")}
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
                    Giá trị đơn hàng tối thiểu{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9,]*"
                    maxLength="16"
                    {...register("minValue", {
                      required: "Giá trị tối thiểu là bắt buộc",
                      pattern: {
                        value: /^[0-9,]+$/,
                        message: "Giá trị tối thiểu phải là số",
                      },
                      validate: {
                        notOnlyWhitespace: (value) =>
                          parseFormattedNumber(value).length > 0 ||
                          "Giá trị tối thiểu không được chỉ chứa khoảng trắng",
                        nonNegative: (val) =>
                          Number(parseFormattedNumber(val)) >= 0 ||
                          "Giá trị tối thiểu không được âm",
                        maxNumber: (val) =>
                          Number(parseFormattedNumber(val)) <= MAX_NUMBER ||
                          "Giá trị tối thiểu không được vượt quá 16 chữ số",
                        maxLength: (val) =>
                          parseFormattedNumber(val).length <= 16 ||
                          "Giá trị không được vượt quá 16 ký tự",
                      },
                    })}
                    value={formatNumber(watchedFields.minValue || "")}
                    placeholder="Giá trị đơn hàng tối thiểu"
                    className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.minValue ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isLoading}
                    onChange={(e) =>
                      handleFormattedNumericChange(e, "minValue")
                    }
                  />
                  {errors.minValue && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.minValue.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá trị giảm tối đa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9,]*"
                    maxLength="16"
                    {...register("maxValue", {
                      required: "Giá trị tối đa là bắt buộc",
                      pattern: {
                        value: /^[0-9,]+$/,
                        message: "Giá trị tối đa phải là số",
                      },
                      validate: {
                        notOnlyWhitespace: (value) =>
                          parseFormattedNumber(value).length > 0 ||
                          "Giá trị tối đa không được chỉ chứa khoảng trắng",
                        nonNegative: (val) =>
                          Number(parseFormattedNumber(val)) >= 0 ||
                          "Giá trị tối đa phải ≥ 0",
                        maxNumber: (val) =>
                          Number(parseFormattedNumber(val)) <= MAX_NUMBER ||
                          "Giá trị tối đa không được vượt quá 16 chữ số",
                        matchFixedValue: (val) =>
                          getValues("type") !== FIXED ||
                          Number(parseFormattedNumber(val)) ===
                            Number(parseFormattedNumber(getValues("value"))) ||
                          "Với loại giảm cố định, giá trị tối đa phải bằng giá trị giảm",
                        maxLength: (val) =>
                          parseFormattedNumber(val).length <= 16 ||
                          "Giá trị không được vượt quá 16 ký tự",
                      },
                    })}
                    value={formatNumber(watchedFields.maxValue || "")}
                    placeholder="Giá trị giảm tối đa"
                    className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.maxValue ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isLoading}
                    onChange={(e) =>
                      handleFormattedNumericChange(e, "maxValue")
                    }
                  />
                  {errors.maxValue && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.maxValue.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hiệu lực từ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...register("validFrom", {
                      required: "Ngày bắt đầu là bắt buộc",
                      validate: {
                        validDate: (val) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const selectedDate = new Date(val);
                          selectedDate.setHours(0, 0, 0, 0);
                          if (!originalValidFrom) return true;
                          const originalDate = new Date(originalValidFrom);
                          originalDate.setHours(0, 0, 0, 0);
                          if (originalDate <= today) {
                            return (
                              val === originalValidFrom ||
                              "Voucher đã bắt đầu, không thể chỉnh sửa ngày bắt đầu."
                            );
                          }
                          return (
                            selectedDate > today ||
                            "Ngày bắt đầu phải lớn hơn ngày hiện tại"
                          );
                        },
                      },
                    })}
                    value={watchedFields.validFrom || ""}
                    className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.validFrom ? "border-red-500" : "border-gray-300"
                    } ${
                      isValidFromDisabled
                        ? "bg-gray-200 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={isLoading || isValidFromDisabled}
                    onChange={(e) => {
                      if (!isValidFromDisabled) {
                        const normalizedDate = formatLocalDate(e.target.value);
                        setValue("validFrom", normalizedDate, {
                          shouldValidate: true,
                        });
                        if (e.target.value) {
                          clearErrors("validFrom");
                        }
                      }
                    }}
                  />
                  {errors.validFrom && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.validFrom.message}
                    </p>
                  )}
                  {isValidFromDisabled && !errors.validFrom && (
                    <p className="text-gray-500 text-sm mt-1">
                      Voucher đã bắt đầu, không thể chỉnh sửa ngày bắt đầu.
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
                      validate: {
                        afterValidFrom: (val) => {
                          const validFrom = getValues("validFrom");
                          return (
                            !validFrom ||
                            !val ||
                            new Date(val) > new Date(validFrom) ||
                            "Ngày kết thúc phải lớn hơn ngày bắt đầu"
                          );
                        },
                        notChangeIfExpired: (val) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          if (!originalValidTo) return true;
                          const originalDate = new Date(originalValidTo);
                          originalDate.setHours(0, 0, 0, 0);
                          if (originalDate <= today) {
                            return (
                              val === originalValidTo ||
                              "Voucher đã hết hạn, không thể chỉnh sửa ngày kết thúc."
                            );
                          }
                          return true;
                        },
                        afterToday: (val) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const selectedDate = new Date(val);
                          selectedDate.setHours(0, 0, 0, 0);
                          return (
                            selectedDate > today ||
                            "Ngày kết thúc phải lớn hơn hôm nay."
                          );
                        },
                      },
                    })}
                    value={watchedFields.validTo || ""}
                    className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.validTo ? "border-red-500" : "border-gray-300"
                    } ${
                      isValidToDisabled ? "bg-gray-200 cursor-not-allowed" : ""
                    }`}
                    disabled={isLoading || isValidToDisabled}
                    onChange={(e) => {
                      if (!isValidToDisabled) {
                        const normalizedDate = formatLocalDate(e.target.value);
                        setValue("validTo", normalizedDate, {
                          shouldValidate: true,
                        });
                        if (e.target.value && getValues("validFrom")) {
                          clearErrors("validTo");
                        }
                      }
                    }}
                  />
                  {errors.validTo && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.validTo.message}
                    </p>
                  )}
                  {isValidToDisabled && !errors.validTo && (
                    <p className="text-gray-500 text-sm mt-1">
                      Voucher đã hết hạn, không thể chỉnh sửa ngày kết thúc.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Áp dụng cho <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="hidden"
                    {...register("applyTo", {
                      required: "Trường áp dụng là bắt buộc",
                      validate: (value) =>
                        COUPON_APPLY_TO.includes(value) ||
                        `Trường áp dụng chỉ được là: ${COUPON_APPLY_TO.join(", ")}`,
                    })}
                  />
                  <div ref={applyToWrapperRef} className="relative w-full">
                    <div
                      className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex items-center justify-between ${
                        errors.applyTo ? "border-red-500" : "border-gray-300"
                      } ${isApplyToDropdownOpen ? "ring-2 ring-blue-500" : ""}`}
                      onClick={() =>
                        setIsApplyToDropdownOpen(!isApplyToDropdownOpen)
                      }
                      disabled={isLoading}
                    >
                      <span className="text-gray-700">
                        {selectedApplyTo
                          ? selectedApplyTo === "product"
                            ? "Sản phẩm"
                            : "Vận chuyển"
                          : "Chọn đối tượng áp dụng"}
                      </span>
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          isApplyToDropdownOpen ? "rotate-180" : ""
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
                    {isApplyToDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-sm shadow-lg max-h-40 overflow-y-auto">
                        {[
                          { value: "product", label: "Sản phẩm" },
                          { value: "shipping", label: "Vận chuyển" },
                        ].map((option) => (
                          <div
                            key={option.value}
                            className="apply-to-option p-2 hover:bg-gray-100 cursor-pointer text-sm"
                            onClick={() => handleApplyToSelect(option.value)}
                          >
                            {option.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.applyTo && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.applyTo.message}
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
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                      disabled={isLoading}
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
                disabled={isLoading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-pink-500 text-white rounded-sm hover:bg-pink-600 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    CẬP NHẬT
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
                        navigate("/promotions/voucher-management");
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

export default UpdateVoucher;