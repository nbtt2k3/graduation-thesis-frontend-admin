"use client";

import React, { useState, useEffect, useContext } from "react";
import { ArrowLeft, Upload } from "lucide-react";
import * as apis from "../../apis";
import { toast } from "react-hot-toast";
import { AdminTechZoneContext } from "../../context/AdminTechZoneContext";
import { CustomSelect, CustomSkeletonUserProfile } from "../../components";
import { yupResolver } from "@hookform/resolvers/yup";
import { updateUserCurrentValidation } from "../../validations/user.validation";
import { useForm } from "react-hook-form";

const UserProfile = () => {
  const { userInfor, isLoadingUser, fetchUser, navigate } =
    useContext(AdminTechZoneContext);
  const [isUpdating, setIsUpdating] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(updateUserCurrentValidation),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      gender: "",
      dateOfBirth: "",
      avatar: null,
    },
  });

  const genderValue = watch("gender");

  const genderOptions = [
    { value: "male", label: "Nam" },
    { value: "female", label: "Nữ" },
    { value: "other", label: "Khác" },
  ];

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (userInfor) {
      reset({
        firstName: userInfor.firstName || "",
        lastName: userInfor.lastName || "",
        phone: userInfor.phone || "",
        gender: userInfor.gender || "",
        dateOfBirth: userInfor.dateOfBirth
          ? userInfor.dateOfBirth.split("T")[0]
          : "",
        avatar: null,
      });
      setPreviewAvatar(userInfor.avatarUrl || null);
    }
  }, [userInfor, reset]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue("avatar", file, { shouldValidate: true });
      setPreviewAvatar(URL.createObjectURL(file));
    } else {
      setValue("avatar", null, { shouldValidate: true });
      setPreviewAvatar(userInfor?.avatarUrl || null);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsUpdating(true);
      const formData = new FormData();
      formData.append("firstName", data.firstName?.trim() || "");
      formData.append("lastName", data.lastName?.trim() || "");
      formData.append("phone", data.phone?.trim() || "");
      formData.append("gender", data.gender || "");
      formData.append("dateOfBirth", data.dateOfBirth || "");

      if (data.avatar) formData.append("avatar", data.avatar);

      const response = await apis.apiUpdateCurrent(formData);

      toast.success(response?.msg || "Cập nhật hồ sơ thành công!");

      await fetchUser();
    } catch (error) {
      if (error?.msg) {
        toast.error(error.msg || "Có lỗi xảy ra khi cập nhật.");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoadingUser) {
    return <CustomSkeletonUserProfile />;
  }

  return (
    <div className="p-3 sm:p-6 bg-white h-auto">
      <div className="mb-4 sm:mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          aria-label="Quay lại bảng điều khiển"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          QUẢN LÝ HỒ SƠ
        </button>
      </div>

      <div className="bg-white rounded shadow">
        <div className="bg-[#00D5BE] text-white p-3 rounded-t">
          <h2 className="text-base font-semibold">THÔNG TIN HỒ SƠ</h2>
        </div>

        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="flex flex-col items-center">
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor="avatar-upload"
                >
                  Ảnh đại diện
                </label>
                <div className="relative flex flex-col items-center">
                  <div className="w-32 h-32 bg-gray-200 rounded border border-gray-300 flex items-center justify-center">
                    {previewAvatar ? (
                      <img
                        src={previewAvatar}
                        alt="Avatar"
                        className="w-full h-full object-contain rounded"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm">
                        <span>📷</span>
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="avatar-upload"
                    className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Chọn ảnh
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/png,image/jpeg,image/gif"
                      onChange={handleAvatarChange}
                      className="hidden"
                      disabled={isUpdating}
                      aria-label="Tải lên ảnh đại diện"
                    />
                  </label>
                  {errors.avatar && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.avatar.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {[
                  { label: "Họ", name: "firstName", required: false },
                  { label: "Tên", name: "lastName", required: false },
                  { label: "Số điện thoại", name: "phone", required: false },
                  {
                    label: "Giới tính",
                    name: "gender",
                    type: "select",
                    required: false,
                  },
                  {
                    label: "Ngày sinh",
                    name: "dateOfBirth",
                    type: "date",
                    required: false,
                  },
                ].map((field) => (
                  <div key={field.name}>
                    {field.type === "select" ? (
                      <CustomSelect
                        name={field.name}
                        options={genderOptions}
                        label={field.label}
                        placeholder="Chọn giới tính..."
                        value={genderValue}
                        onChange={(value) =>
                          setValue(field.name, value, { shouldValidate: true })
                        }
                        disabled={isUpdating}
                        required={field.required}
                        error={errors[field.name]}
                      />
                    ) : (
                      <>
                        <label
                          className="block text-sm font-medium text-gray-700 mb-2"
                          htmlFor={field.name}
                        >
                          {field.label}
                        </label>
                        <input
                          id={field.name}
                          type={field.type || "text"}
                          {...register(field.name)}
                          className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors[field.name]
                              ? "border-red-500"
                              : "border-gray-300"
                          } ${isUpdating ? "bg-gray-100" : ""}`}
                          disabled={isUpdating}
                          aria-label={field.label}
                        />
                        {errors[field.name] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[field.name].message}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={isUpdating}
                className={`px-6 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors cursor-pointer`}
                aria-label="Cập nhật hồ sơ"
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  "Cập nhật hồ sơ"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
