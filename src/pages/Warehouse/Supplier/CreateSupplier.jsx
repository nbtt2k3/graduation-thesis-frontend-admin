"use client";

import React, { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import * as apis from "../../../apis";
import AddressDropdown from "../../../components/AddressDropdown/AddressDropdown";
import { useNavigate } from "react-router-dom";

const CreateSupplier = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      shortName: "",
      contactPersonName: "",
      phone: "",
      email: "",
      addressLine: "",
      province: "",
      district: "",
      ward: "",
      description: "",
      isActive: true,
    },
    mode: "onChange",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [address, setAddress] = useState({
    province: "",
    district: "",
    ward: "",
  });

  const handleInputChange = (field) => {
    return (e) => {
      setValue(field, e.target.value, { shouldValidate: true });
      if (e.target.value.trim().length > 0) {
        clearErrors([field, "form"]);
      }
    };
  };

  const handleInputBlur = (field) => {
    return (e) => {
      setValue(field, e.target.value.trim(), { shouldValidate: true });
    };
  };

  const onSubmit = async (data) => {
    if (!data.province || !data.district || !data.ward) {
      setError("form", {
        message: "Vui lòng chọn đầy đủ tỉnh, quận/huyện, phường/xã",
      });
      toast.error("Vui lòng chọn đầy đủ tỉnh, quận/huyện, phường/xã");
      return;
    }

    try {
      setIsLoading(true);
      const formData = {
        name: data.name.trim(),
        shortName: data.shortName.trim(),
        contactPersonName: data.contactPersonName.trim(),
        phone: data.phone.trim(),
        email: data.email.trim(),
        province: address.province.trim(),
        district: address.district.trim(),
        ward: address.ward.trim(),
        addressLine: data.addressLine.trim(),
        description: data.description.trim(),
        isActive: data.isActive,
      };

      const response = await apis.apiCreateSupplier(formData);
      navigate("/warehouse/supplier-management", {
        state: { supplierCreated: response?.msg },
      });
    } catch (error) {
      if (error?.msg) {
        toast.error(
          error?.msg || "Không thể tạo nhà cung cấp. Vui lòng thử lại."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-3 sm:p-6 bg-white h-auto">
      <div className="mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-sm hover:bg-gray-300 flex items-center cursor-pointer disabled:cursor-not-allowed"
          disabled={isLoading}
          aria-label="Quay lại quản lý nhà cung cấp"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          QUẢN LÝ NHÀ CUNG CẤP
        </button>
      </div>

      <div className="bg-white rounded-sm shadow-md">
        <div className="bg-[#00D5BE] text-white p-4 rounded-t-sm">
          <h2 className="text-lg font-semibold">THÊM NHÀ CUNG CẤP</h2>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên nhà cung cấp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("name", {
                      required: "Tên nhà cung cấp là bắt buộc",
                      minLength: {
                        value: 2,
                        message: "Tên nhà cung cấp phải có ít nhất 2 ký tự",
                      },
                      maxLength: {
                        value: 150,
                        message:
                          "Tên nhà cung cấp không được vượt quá 150 ký tự",
                      },
                      validate: {
                        notOnlyWhitespace: (value) =>
                          value.trim().length > 0 ||
                          "Tên nhà cung cấp không được chỉ chứa khoảng trắng",
                      },
                    })}
                    placeholder="Tên nhà cung cấp"
                    className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isLoading}
                    onChange={handleInputChange("name")}
                    onBlur={handleInputBlur("name")}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên viết tắt <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("shortName", {
                      required: "Tên viết tắt là bắt buộc",
                      minLength: {
                        value: 2,
                        message: "Tên viết tắt phải có ít nhất 2 ký tự",
                      },
                      maxLength: {
                        value: 50,
                        message: "Tên viết tắt không được vượt quá 50 ký tự",
                      },
                      validate: {
                        notOnlyWhitespace: (value) =>
                          value.trim().length > 0 ||
                          "Tên viết tắt không được chỉ chứa khoảng trắng",
                      },
                    })}
                    placeholder="Tên viết tắt"
                    className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.shortName ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isLoading}
                    onChange={handleInputChange("shortName")}
                    onBlur={handleInputBlur("shortName")}
                  />
                  {errors.shortName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.shortName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Người liên hệ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("contactPersonName", {
                      required: "Tên người liên hệ là bắt buộc",
                      minLength: {
                        value: 2,
                        message: "Tên người liên hệ phải có ít nhất 2 ký tự",
                      },
                      maxLength: {
                        value: 100,
                        message:
                          "Tên người liên hệ không được vượt quá 100 ký tự",
                      },
                      validate: {
                        notOnlyWhitespace: (value) =>
                          value.trim().length > 0 ||
                          "Tên người liên hệ không được chỉ chứa khoảng trắng",
                      },
                    })}
                    placeholder="Tên người liên hệ"
                    className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.contactPersonName
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    disabled={isLoading}
                    onChange={handleInputChange("contactPersonName")}
                    onBlur={handleInputBlur("contactPersonName")}
                  />
                  {errors.contactPersonName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.contactPersonName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    pattern="[0-9]*"
                    {...register("phone", {
                      required: "Số điện thoại là bắt buộc",
                      pattern: {
                        value:
                          /^(0[3|5|7|8|9][0-9]{8}|\+84[3|5|7|8|9][0-9]{8})$/,
                        message:
                          "Số điện thoại không hợp lệ (VD: 0xxxxxxxxx hoặc +84xxxxxxxx)",
                      },
                      validate: {
                        notOnlyWhitespace: (value) =>
                          value.trim().length > 0 ||
                          "Số điện thoại không được chỉ chứa khoảng trắng",
                      },
                    })}
                    placeholder="Số điện thoại (VD: 0901234567 hoặc +84901234567)"
                    className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isLoading}
                    onChange={handleInputChange("phone")}
                    onBlur={handleInputBlur("phone")}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    {...register("email", {
                      required: "Email là bắt buộc",
                      pattern: {
                        value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/,
                        message:
                          "Email phải là chữ thường và không chứa khoảng trắng",
                      },
                      maxLength: {
                        value: 100,
                        message: "Email không được vượt quá 100 ký tự",
                      },
                      validate: {
                        noSpaces: (value) =>
                          !/\s/.test(value) ||
                          "Email không được chứa khoảng trắng",
                        lowercase: (value) =>
                          value === value.toLowerCase() ||
                          "Email phải là chữ thường",
                      },
                    })}
                    placeholder="Email"
                    className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isLoading}
                    onChange={handleInputChange("email")}
                    onBlur={handleInputBlur("email")}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <AddressDropdown
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  clearErrors={clearErrors}
                  watch={watch}
                  onAddressChange={setAddress}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ cụ thể <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("addressLine", {
                      required: "Địa chỉ cụ thể là bắt buộc",
                      minLength: {
                        value: 5,
                        message: "Địa chỉ cụ thể phải có ít nhất 5 ký tự",
                      },
                      maxLength: {
                        value: 200,
                        message: "Địa chỉ cụ thể không được vượt quá 200 ký tự",
                      },
                      validate: {
                        notOnlyWhitespace: (value) =>
                          value.trim().length > 0 ||
                          "Địa chỉ cụ thể không được chỉ chứa khoảng trắng",
                      },
                    })}
                    placeholder="Số nhà, đường"
                    className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.addressLine ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isLoading}
                    onChange={handleInputChange("addressLine")}
                    onBlur={handleInputBlur("addressLine")}
                  />
                  {errors.addressLine && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.addressLine.message}
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
                          value.trim().length > 0 ||
                          "Mô tả không được chỉ chứa khoảng trắng",
                      },
                    })}
                    placeholder="Mô tả nhà cung cấp"
                    className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.description ? "border-red-500" : "border-gray-300"
                    }`}
                    rows="4"
                    disabled={isLoading}
                    onChange={handleInputChange("description")}
                    onBlur={handleInputBlur("description")}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register("isActive", {
                        required: "Trạng thái là bắt buộc",
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                      disabled={isLoading}
                      onChange={handleInputChange("isActive")}
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Kích hoạt
                    </span>
                  </div>
                  {errors.isActive && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.isActive.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {errors.form && (
              <p className="text-red-500 text-sm mt-4">{errors.form.message}</p>
            )}

            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-2 bg-gray-500 text-white rounded-sm hover:bg-gray-600 cursor-pointer disabled:cursor-not-allowed"
                disabled={isLoading}
                aria-label="Hủy tạo nhà cung cấp"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-pink-500 text-white rounded-sm hover:bg-pink-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                disabled={isLoading}
                aria-label="Thêm nhà cung cấp"
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
            <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
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
                        navigate("/warehouse/supplier-management");
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

export default CreateSupplier;
