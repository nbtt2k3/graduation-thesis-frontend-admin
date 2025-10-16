"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import * as apis from "../../../apis";
import { toast } from "react-hot-toast";
import { LoadingSpinner } from "../../../components";

// Define allowed reasons to avoid hardcoding
const EXPORT_RECEIPT_REASON = ["sale", "return", "damage", "other"];

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
  const [searchTerm, setSearchTerm] = useState("");
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
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (option) => {
    setSelectedOption(option.label);
    setValue(name, option.value, { shouldValidate: true });
    onChange({ target: { name, value: option.value } });
    setIsOpen(false);
    setSearchTerm("");
  };

  const filteredOptions =
    name === "reason"
      ? options
      : options.filter((option) =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase())
        );

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} <span className="text-red-500">*</span>
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
            {name !== "reason" && (
              <div className="p-2">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
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

const UpdateExportReceipt = () => {
  const navigate = useNavigate();
  const { exportReceiptId } = useParams();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productItems, setProductItems] = useState([]);
  const [branches, setBranches] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    control,
    reset,
    setValue,
    getValues,
  } = useForm({
    defaultValues: {
      branchId: "",
      items: [{ productItemId: "", quantity: "" }],
      reason: "",
      note: "",
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const handleNumericInput = (e) => {
    const charCode = e.charCode;
    if (charCode < 48 || charCode > 57) {
      e.preventDefault();
    }
  };

  const formatNumber = (value) => {
    if (!value) return "";
    const numericValue = value.replace(/[^0-9]/g, "");
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleFormattedNumericChange = (index) => (e) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, "");
    const formattedValue = rawValue ? formatNumber(rawValue) : "";
    setValue(`items[${index}].quantity`, formattedValue, {
      shouldValidate: true,
    });
    clearErrors(`items[${index}].quantity`);
  };

  const handleInputChange = (field) => (e) => {
    setValue(field, e.target.value, { shouldValidate: true });
    if (e.target.value.trim().length > 0) {
      clearErrors([field, "form"]);
    }
  };

  const handleInputBlur = (field) => (e) => {
    setValue(field, e.target.value.trim(), { shouldValidate: true });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productResponse, branchResponse, receiptResponse] =
          await Promise.all([
            apis.apiGetAllProductItems({ limit: 0 }),
            apis.apiGetAllBranches({ limit: 0, isActive: true }),
            exportReceiptId
              ? apis.apiGetExportReceipt(exportReceiptId)
              : Promise.resolve({}),
          ]);

        setProductItems(productResponse.productItemList || []);
        setBranches(branchResponse.branchList || []);

        if (exportReceiptId && receiptResponse.exportReceipt) {
          const { exportReceipt } = receiptResponse;

          if (["approved", "canceled"].includes(exportReceipt.status)) {
            toast.error(
              `Phiếu xuất kho đang ở trạng thái ${
                exportReceipt.status === "approved" ? "đã duyệt" : "đã hủy"
              } và không thể chỉnh sửa.`
            );
            navigate("/warehouse/export-receipt-management");
            return;
          }

          reset({
            branchId: exportReceipt.branchId?.trim() || "",
            items:
              exportReceipt.items &&
              Array.isArray(exportReceipt.items) &&
              exportReceipt.items.length > 0
                ? exportReceipt.items.map((item) => ({
                    productItemId: item.productItemId?.trim() || "",
                    quantity: item.quantity
                      ? formatNumber(item.quantity.toString())
                      : "",
                  }))
                : [{ productItemId: "", quantity: "" }],
            reason: exportReceipt.reason?.trim() || "",
            note: exportReceipt.note?.trim() || "",
          });
        }
      } catch (error) {
        if (error?.msg) {
          toast.error(error.msg || "Không thể tải dữ liệu. Vui lòng thử lại.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (exportReceiptId) {
      fetchData();
    }
  }, [exportReceiptId, reset, navigate]);

  const onSubmit = async (data) => {
    if (!data.items || data.items.length === 0) {
      setError("form", {
        message: "Danh sách sản phẩm phải có ít nhất 1 phần tử",
      });
      toast.error("Danh sách sản phẩm phải có ít nhất 1 phần tử");
      return;
    }

    try {
      setLoading(true);
      const formattedItems = data.items.map((item) => {
        const quantity = Number(item.quantity.replace(/[^0-9]/g, ""));
        return {
          productItemId: item.productItemId,
          quantity,
        };
      });

      const response = await apis.apiUpdateExportReceipt(exportReceiptId, {
        branchId: data.branchId,
        items: formattedItems,
        reason: data.reason,
        note: data.note.trim(),
      });

      navigate("/warehouse/export-receipt-management", {
        state: {
          exportReceiptUpdated: response?.msg,
        },
      });
    } catch (error) {
      if (error?.msg) {
        toast.error(
          error.msg || "Không thể cập nhật phiếu xuất kho. Vui lòng thử lại."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-3 sm:p-6 bg-white h-auto">
      <div className="mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-sm hover:bg-gray-300 flex items-center cursor-pointer disabled:cursor-not-allowed"
          disabled={loading}
          aria-label="Quay lại quản lý xuất kho"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          QUẢN LÝ XUẤT KHO
        </button>
      </div>
      <div className="bg-white rounded-sm shadow-md">
        <div className="bg-[#00D5BE] text-white p-4 rounded-t-sm">
          <h2 className="text-lg font-semibold">CẬP NHẬT PHIẾU XUẤT KHO</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <input
                    type="hidden"
                    {...register("branchId", {
                      required: "Chi nhánh là bắt buộc",
                      pattern: {
                        value: /^[0-9a-fA-F]{24}$/,
                        message: "Chi nhánh phải là ObjectId hợp lệ",
                      },
                    })}
                  />
                  <CustomSelect
                    name="branchId"
                    options={branches.map((branch) => ({
                      value: branch._id,
                      label: branch.name,
                    }))}
                    error={errors.branchId}
                    disabled={loading}
                    onChange={handleInputChange("branchId")}
                    setValue={setValue}
                    placeholder="Chọn chi nhánh"
                    label="Chi nhánh"
                    value={getValues("branchId")}
                  />
                </div>
                <div>
                  <input
                    type="hidden"
                    {...register("reason", {
                      required: "Lý do là bắt buộc",
                      validate: (value) =>
                        EXPORT_RECEIPT_REASON.includes(value) ||
                        `Lý do chỉ được là: ${EXPORT_RECEIPT_REASON.join(
                          ", "
                        )}`,
                    })}
                  />
                  <CustomSelect
                    name="reason"
                    options={EXPORT_RECEIPT_REASON.map((reason) => ({
                      value: reason,
                      label: {
                        sale: "Bán hàng",
                        return: "Trả hàng",
                        damage: "Hàng hỏng",
                        other: "Khác",
                      }[reason],
                    }))}
                    error={errors.reason}
                    disabled={loading}
                    onChange={handleInputChange("reason")}
                    setValue={setValue}
                    placeholder="Chọn lý do"
                    label="Lý do xuất kho"
                    value={getValues("reason")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register("note", {
                      required: "Ghi chú là bắt buộc",
                      maxLength: {
                        value: 500,
                        message: "Ghi chú không được vượt quá 500 ký tự",
                      },
                      validate: {
                        notOnlyWhitespace: (value) =>
                          value.trim().length > 0 ||
                          "Ghi chú không được chỉ chứa khoảng trắng",
                      },
                    })}
                    placeholder="Ghi chú phiếu xuất kho"
                    className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.note ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={loading}
                    onChange={handleInputChange("note")}
                    onBlur={handleInputBlur("note")}
                  />
                  {errors.note && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.note.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sản phẩm <span className="text-red-500">*</span>
                  </label>
                  {fields.map((item, index) => (
                    <div
                      key={item.id}
                      className="mb-4 p-4 border rounded-sm relative"
                    >
                      <CustomSelect
                        name={`items[${index}].productItemId`}
                        options={productItems
                          .filter(
                            (product) =>
                              !fields
                                .filter((_, i) => i !== index)
                                .map((field) => field.productItemId)
                                .includes(product._id)
                          )
                          .map((product) => ({
                            value: product._id,
                            label: `${product.name} (${
                              product.attributes
                                ?.map((attr) => `${attr.code}: ${attr.value}`)
                                .join(", ") || "No attributes"
                            })`,
                          }))}
                        error={errors.items?.[index]?.productItemId}
                        disabled={loading}
                        onChange={handleInputChange(
                          `items[${index}].productItemId`
                        )}
                        setValue={setValue}
                        placeholder="Chọn sản phẩm"
                        label="Sản phẩm"
                        value={getValues(`items[${index}].productItemId`)}
                        {...register(`items[${index}].productItemId`, {
                          required: "Sản phẩm là bắt buộc",
                          pattern: {
                            value: /^[0-9a-fA-F]{24}$/,
                            message: "Sản phẩm phải là ObjectId hợp lệ",
                          },
                        })}
                      />
                      <div className="mb-2 mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số lượng <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9,]*"
                          {...register(`items[${index}].quantity`, {
                            required: "Số lượng là bắt buộc",
                            pattern: {
                              value: /^[0-9,]+$/,
                              message: "Số lượng chỉ được chứa số nguyên dương",
                            },
                            validate: {
                              positiveInteger: (val) => {
                                const num = Number(val.replace(/[^0-9]/g, ""));
                                return Number.isInteger(num) && num > 0
                                  ? true
                                  : "Số lượng phải là số nguyên dương lớn hơn 0";
                              },
                            },
                          })}
                          placeholder="Số lượng"
                          className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.items?.[index]?.quantity
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          disabled={loading}
                          onKeyPress={handleNumericInput}
                          onChange={handleFormattedNumericChange(index)}
                        />
                        {errors.items?.[index]?.quantity && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.items[index].quantity.message}
                          </p>
                        )}
                      </div>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="absolute top-2 right-2 text-gray-500 hover:text-red-500 cursor-pointer"
                          disabled={loading}
                          aria-label="Xóa sản phẩm"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => append({ productItemId: "", quantity: "" })}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-sm hover:bg-blue-600 flex items-center cursor-pointer disabled:cursor-not-allowed"
                    disabled={loading}
                    aria-label="Thêm sản phẩm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm sản phẩm
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-2 bg-gray-500 text-white rounded-sm hover:bg-gray-600 cursor-pointer disabled:cursor-not-allowed"
                disabled={loading}
                aria-label="Hủy cập nhật phiếu xuất kho"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-pink-500 text-white rounded-sm hover:bg-pink-600 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                disabled={loading}
                aria-label="Cập nhật phiếu xuất kho"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang lưu...
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
                      aria-label="Tiếp tục chỉnh sửa"
                    >
                      Tiếp tục
                    </button>
                    <button
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 cursor-pointer transition-colors duration-200 w-full sm:w-auto"
                      onClick={() => {
                        setIsModalOpen(false);
                        navigate("/warehouse/export-receipt-management");
                      }}
                      aria-label="Xác nhận hủy"
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

export default UpdateExportReceipt;
