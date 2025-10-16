"use client";

import { useEffect, useState, useContext } from "react";
import { ArrowLeft, Plus, Upload, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CreateCategoryValidation } from "../../validations/category.validation";
import { toast } from "react-hot-toast";
import * as apis from "../../apis";
import {
  LoadingSpinner,
  ConfirmExitModal,
  CustomSelect,
} from "../../components";
import { AdminTechZoneContext } from "../../context/AdminTechZoneContext";

const CreateCategory = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      logo: null,
      name: "",
      parentId: "",
      isActive: true,
    },
    resolver: yupResolver(CreateCategoryValidation),
    mode: "onChange",
  });

  const [previewUrl, setPreviewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [parentCategories, setParentCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { setError, navigate } = useContext(AdminTechZoneContext);

  useEffect(() => {
    const fetchParentCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await apis.apiGetAllCategories({
          limit: 0,
          isActive: true,
        });
        const activeCategories =
          response?.categoryList?.filter(
            (category) =>
              category.isActive &&
              category._id &&
              (category.level === 1 || category.level === 2)
          ) || [];
        setParentCategories(activeCategories);
      } catch (error) {
        if (error?.msg) {
          toast.error(error.msg || "Không thể tải dữ liệu. Vui lòng thử lại.");
        } else {
          setError({ hasError: true, message: "Lỗi kết nối API" });
        }
        setParentCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchParentCategories();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue("logo", file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setValue("logo", null, { shouldValidate: true });
      setPreviewUrl("");
    }
  };

  const removeImage = () => {
    setValue("logo", null, { shouldValidate: true });
    setPreviewUrl("");
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("name", data.name.trim());
      formData.append("parentId", data.parentId);
      formData.append("logo", data.logo);
      formData.append("isActive", data.isActive);

      const response = await apis.apiCreateCategory(formData);
      navigate("/products/category-management", {
        state: { categoryCreated: response?.msg },
      });
    } catch (error) {
      toast.error(error?.msg || "Không thể tạo danh mục. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingCategories) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-3 sm:p-6 bg-white h-auto">
      <div className="mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-sm hover:bg-gray-300 inline-flex items-center cursor-pointer disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          QUẢN LÝ DANH MỤC
        </button>
      </div>

      <div className="bg-white rounded-sm shadow-md">
        <div className="bg-[#00D5BE] text-white p-4 rounded-t-sm">
          <h2 className="text-lg font-semibold">THÊM DANH MỤC</h2>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên danh mục <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("name")}
                    placeholder="Tên danh mục"
                    className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <CustomSelect
                  name="parentId"
                  options={parentCategories.map((category) => ({
                    value: category._id,
                    label: category.name || "Không có tên",
                  }))}
                  label="Danh mục cha"
                  placeholder="Chọn danh mục cha"
                  value={watch("parentId")}
                  onChange={(value) =>
                    setValue("parentId", value, { shouldValidate: true })
                  }
                  disabled={isLoading}
                  required={true}
                  withSearch={true}
                  error={errors.parentId}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái <span className="text-red-500">*</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      {...register("isActive")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                      disabled={isLoading}
                    />
                    <span className="ml-2 text-gray-700">Kích hoạt</span>
                  </label>
                  {errors.isActive && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.isActive.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hình ảnh danh mục <span className="text-red-500">*</span>
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-sm p-6 text-center hover:border-gray-400 ${
                      errors.logo ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    {previewUrl ? (
                      <div className="relative">
                        <img
                          src={previewUrl || "/placeholder.svg"}
                          alt="Preview"
                          className="mx-auto max-w-full max-h-48 object-contain rounded"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 cursor-pointer"
                          disabled={isLoading}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <div className="text-gray-600 mb-2">
                          Kéo thả ảnh vào đây hoặc
                        </div>
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer"
                        >
                          <span className="bg-blue-500 text-white px-4 py-2 rounded-sm hover:bg-blue-600 inline-block">
                            Chọn ảnh
                          </span>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/png,image/jpeg,image/gif"
                            onChange={handleImageChange}
                            className="hidden"
                            disabled={isLoading}
                          />
                        </label>
                        <div className="text-gray-400 text-sm mt-2">
                          PNG, JPG, GIF tối đa 10MB
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.logo && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.logo.message}
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
                className="px-6 py-2 bg-pink-500 text-white rounded-sm hover:bg-pink-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                disabled={isLoading}
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
          <ConfirmExitModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={() => {
              setIsModalOpen(false);
              navigate("/products/category-management");
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateCategory;
