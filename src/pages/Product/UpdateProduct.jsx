"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Upload, Trash2, Edit, Play } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import * as apis from "../../apis";
import {
  MyEditor,
  ConfirmExitModal,
  UpdateProductItemForm,
  CustomSelect,
} from "../../components";
import { toast } from "react-hot-toast";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { LoadingSpinner } from "../../components";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const parseNumber = (value) => {
  if (!value && value !== 0) return "";
  const stringValue = String(value);
  return parseFloat(stringValue.replace(/,/g, ""));
};

const formatNumber = (value) => {
  if (!value && value !== 0) return "";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const getVideoEmbedUrl = (url) => {
  if (!url) return null;

  const youtubeRegex =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  if (url.match(/\.(mp4|webm|ogg)$/i)) {
    return url;
  }

  return null;
};

const VideoPreview = ({ url, className = "" }) => {
  const embedUrl = getVideoEmbedUrl(url);

  if (!embedUrl) return null;

  if (url.match(/\.(mp4|webm|ogg)$/i)) {
    return (
      <div className={`relative ${className}`}>
        <video
          controls
          className="w-full h-48 object-cover rounded"
          preload="metadata"
        >
          <source src={embedUrl} type="video/mp4" />
          Trình duyệt không hỗ trợ video.
        </video>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <iframe
        src={embedUrl}
        className="w-full h-48 rounded"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Video preview"
      />
    </div>
  );
};

const UpdateProduct = () => {
  const navigate = useNavigate();
  const params = useParams();
  const productId = params?.productId;
  const statusMapping = {
    inactive: "inactive",
    active: "active",
    out_of_stock: "out_of_stock",
  };
  const reverseStatusMapping = {
    inactive: "inactive",
    active: "active",
    out_of_stock: "out_of_stock",
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    setValue,
    control,
    reset,
    watch,
    getValues,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      product: {
        name: "",
        description: "",
        videoUrl: "",
        thumb: null,
        thumbUrl: "",
        thumbFileName: "",
        featuredImages: [],
        brandId: "",
        categoryId: "",
        isActive: false,
      },
      productItems: [
        {
          _id: "",
          name: "",
          barcode: "",
          thumb: null,
          thumbUrl: "",
          thumbFileName: "",
          images: [],
          attributes: [{ code: "", value: "" }],
          specifications: [{ group: "", items: [{ label: "", value: "" }] }],
          status: "inactive",
          retailPrice: "",
          branchId: "",
          prevCategoryId: "",
        },
      ],
    },
  });
  const videoUrl = watch("product.videoUrl");
  const categoryId = watch("product.categoryId");
  const {
    fields: productItemsFields,
    append: appendProductItem,
    move: moveProductItem,
  } = useFieldArray({
    control,
    name: "productItems",
  });
  const [thumbPreview, setThumbPreview] = useState("");
  const [featuredImagesPreviews, setFeaturedImagesPreviews] = useState([]);
  const [productItemsPreviews, setProductItemsPreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [featuredImagesDelete, setFeaturedImagesDelete] = useState([]);
  const [productItemImagesDelete, setProductItemImagesDelete] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId) return;

      try {
        setIsLoadingData(true);

        const [productResponse, brandRes, categoryRes, branchRes] =
          await Promise.all([
            apis.apiGetProductById(productId),
            apis.apiGetAllBrands({ limit: 0, isActive: true }),
            apis.apiGetAllCategories({ limit: 0, isActive: true }),
            apis.apiGetAllBranches({ limit: 0, isActive: true }),
          ]);

        const productData = productResponse.product;
        const level3Categories =
          categoryRes?.categoryList?.filter(
            (c) => c.isActive
          ) || [];

        setBrands(brandRes?.brandList?.filter((b) => b.isActive) || []);
        setCategories(level3Categories);
        setBranches(branchRes?.branchList?.filter((b) => b.isActive) || []);
        setLoadingOptions(false);

        const formData = {
          product: {
            name: productData.name || "",
            description: productData.description || "",
            videoUrl: productData.videoUrl || "",
            thumb: null,
            thumbUrl: productData.thumbUrl || "",
            thumbFileName: productData.thumbFileName || "",
            featuredImages: productData.featuredImages || [],
            brandId: productData.brandId || "",
            categoryId: productData.categoryId || "",
            isActive: productData.isActive || false,
          },
          productItems:
            productData.productItems?.map((item) => ({
              _id: item._id,
              name: item.name || "",
              barcode: item.barcode || "",
              thumb: null,
              thumbUrl: item.thumbUrl || "",
              thumbFileName: item.thumbFileName || "",
              images: item.images || [],
              attributes:
                item.attributes?.length > 0
                  ? item.attributes
                  : [{ code: "", value: "" }],
              specifications:
                item.specifications?.length > 0
                  ? item.specifications
                  : [{ group: "", items: [{ label: "", value: "" }] }],
              status: statusMapping[item.status] || "inactive",
              retailPrice: formatNumber(item.retailPrice) || "",
              branchId: item.inventory?.[0]?.branchId || "",
              prevCategoryId: productData.categoryId || "",
            })) || [],
        };
        reset(formData);

        setThumbPreview(productData.thumbUrl || "");
        setFeaturedImagesPreviews(
          productData.featuredImages?.map((img) => img.image) || []
        );

        const itemPreviews =
          productData.productItems?.map((item) => ({
            _id: item._id,
            thumb: item.thumbUrl || "",
            images: item.images?.map((img) => img.image) || [],
          })) || [];
        setProductItemsPreviews(itemPreviews);
      } catch (error) {
        if (error?.msg) {
          toast.error(error.msg || "Không thể tải dữ liệu. Vui lòng thử lại.");
        }
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchProductData();
  }, [productId, reset]);

  useEffect(() => {
    if (errors.form) {
      clearErrors("form");
    }
  }, [control._formValues, clearErrors, errors.form]);

  const handleThumbChange = (e) => {
    clearErrors("product.thumb");
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/png", "image/jpeg", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setError("product.thumb", { message: "Chỉ chấp nhận PNG, JPG, GIF" });
        setThumbPreview("");
        setValue("product.thumb", null);
        setValue("product.thumbUrl", "");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("product.thumb", { message: "Hình ảnh không vượt quá 10MB" });
        setThumbPreview("");
        setValue("product.thumb", null);
        setValue("product.thumbUrl", "");
        return;
      }
      setValue("product.thumb", file);
      setValue("product.thumbFileName", file.name);
      const url = URL.createObjectURL(file);
      setThumbPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setThumbPreview("");
      setValue("product.thumb", null);
      setValue("product.thumbUrl", "");
      setError("product.thumb", { message: "Hình ảnh sản phẩm là bắt buộc" });
    }
  };

  const handleFeaturedImageChange = (e) => {
    clearErrors("product.featuredImages");
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const validTypes = ["image/png", "image/jpeg", "image/gif"];
      const invalidFiles = files.filter(
        (file) =>
          !validTypes.includes(file.type) || file.size > 10 * 1024 * 1024
      );
      if (invalidFiles.length > 0) {
        setError("product.featuredImages", {
          message:
            "Một số hình ảnh không hợp lệ (chỉ chấp nhận PNG, JPG, GIF, tối đa 10MB)",
        });
        return;
      }
      const newImages = files.map((file) => ({
        image: file,
        imageFileName: file.name,
      }));
      const currentImages = getValues("product.featuredImages") || [];
      setValue("product.featuredImages", [...currentImages, ...newImages]);
      const previews = files.map((file) => URL.createObjectURL(file));
      setFeaturedImagesPreviews((prev) => [...prev, ...previews]);
      return () => previews.forEach((url) => URL.revokeObjectURL(url));
    }
  };

  const handleRemoveFeaturedImage = (index) => {
    const currentImages = getValues("product.featuredImages") || [];
    const imageToRemove = currentImages[index];

    if (
      imageToRemove &&
      imageToRemove.imageFileName &&
      typeof imageToRemove.image === "string"
    ) {
      setFeaturedImagesDelete((prev) => [...prev, imageToRemove.imageFileName]);
    }

    setFeaturedImagesPreviews((prev) => prev.filter((_, i) => i !== index));
    const newImages = currentImages.filter((_, i) => i !== index);
    setValue("product.featuredImages", newImages);
    clearErrors("product.featuredImages");
  };

  const handleFeaturedImagesDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedPreviews = Array.from(featuredImagesPreviews);
    const reorderedImages = Array.from(
      getValues("product.featuredImages") || []
    );

    const [removedPreview] = reorderedPreviews.splice(result.source.index, 1);
    reorderedPreviews.splice(result.destination.index, 0, removedPreview);

    const [removedImage] = reorderedImages.splice(result.source.index, 1);
    reorderedImages.splice(result.destination.index, 0, removedImage);

    setFeaturedImagesPreviews(reorderedPreviews);
    setValue("product.featuredImages", reorderedImages);
  };

  const handleProductItemDragEnd = (result) => {
    if (!result.destination) return;
    moveProductItem(result.source.index, result.destination.index);
    const reorderedPreviews = Array.from(productItemsPreviews);
    const [removedPreview] = reorderedPreviews.splice(result.source.index, 1);
    reorderedPreviews.splice(result.destination.index, 0, removedPreview);
    setProductItemsPreviews(reorderedPreviews);
  };

  const handleProductItemThumbChange = (itemIndex, e) => {
    clearErrors([`productItems[${itemIndex}].thumb`, "productItems"]);
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/png", "image/jpeg", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setError(`productItems[${itemIndex}].thumb`, {
          message: "Chỉ chấp nhận PNG, JPG, GIF",
        });
        setProductItemsPreviews((prev) => {
          const newPreviews = [...prev];
          newPreviews[itemIndex] = { ...newPreviews[itemIndex], thumb: "" };
          return newPreviews;
        });
        setValue(`productItems[${itemIndex}].thumb`, null);
        setValue(`productItems[${itemIndex}].thumbUrl`, "");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError(`productItems[${itemIndex}].thumb`, {
          message: "Hình ảnh không vượt quá 10MB",
        });
        setProductItemsPreviews((prev) => {
          const newPreviews = [...prev];
          newPreviews[itemIndex] = { ...newPreviews[itemIndex], thumb: "" };
          return newPreviews;
        });
        setValue(`productItems[${itemIndex}].thumb`, null);
        setValue(`productItems[${itemIndex}].thumbUrl`, "");
        return;
      }
      setValue(`productItems[${itemIndex}].thumb`, file);
      setValue(`productItems[${itemIndex}].thumbFileName`, file.name);
      const url = URL.createObjectURL(file);
      setProductItemsPreviews((prev) => {
        const newPreviews = [...prev];
        newPreviews[itemIndex] = {
          ...newPreviews[itemIndex],
          thumb: url,
        };
        return newPreviews;
      });
      return () => URL.revokeObjectURL(url);
    } else {
      setProductItemsPreviews((prev) => {
        const newPreviews = [...prev];
        newPreviews[itemIndex] = { ...newPreviews[itemIndex], thumb: "" };
        return newPreviews;
      });
      setValue(`productItems[${itemIndex}].thumb`, null);
      setValue(`productItems[${itemIndex}].thumbUrl`, "");
      setError(`productItems[${itemIndex}].thumb`, {
        message: "Hình ảnh mục sản phẩm là bắt buộc",
      });
    }
  };

  const handleProductItemImageChange = (itemIndex, e) => {
    clearErrors([`productItems[${itemIndex}].images`, "productItems"]);
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const validTypes = ["image/png", "image/jpeg", "image/gif"];
      const invalidFiles = files.filter(
        (file) =>
          !validTypes.includes(file.type) || file.size > 10 * 1024 * 1024
      );
      if (invalidFiles.length > 0) {
        setError(`productItems[${itemIndex}].images`, {
          message:
            "Một số hình ảnh không hợp lệ (chỉ chấp nhận PNG, JPG, GIF, tối đa 10MB)",
        });
        return;
      }
      const newImages = files.map((file) => ({
        image: file,
        imageFileName: file.name,
      }));
      const currentImages =
        getValues(`productItems[${itemIndex}].images`) || [];
      const updatedImages = [...currentImages, ...newImages];
      setValue(`productItems[${itemIndex}].images`, updatedImages);
      const previews = files.map((file) => URL.createObjectURL(file));
      setProductItemsPreviews((prev) => {
        const newPreviews = [...prev];
        newPreviews[itemIndex] = {
          ...newPreviews[itemIndex],
          images: [...(newPreviews[itemIndex].images || []), ...previews],
        };
        return newPreviews;
      });
      if (updatedImages.length > 0) {
        clearErrors(`productItems[${itemIndex}].images`);
      }
      return () => previews.forEach((url) => URL.revokeObjectURL(url));
    }
  };

  const onSubmit = async (data) => {
    // Validation cho product
    if (!data.product.name) {
      setError("product.name", { message: "Tên sản phẩm là bắt buộc" });
      return;
    }
    if (!data.product.description) {
      setError("product.description", { message: "Mô tả là bắt buộc" });
      return;
    }
    if (!data.product.thumbUrl && !data.product.thumb) {
      setError("product.thumb", { message: "Hình ảnh sản phẩm là bắt buộc" });
      return;
    }
    if (!data.product.brandId) {
      setError("product.brandId", { message: "Thương hiệu là bắt buộc" });
      return;
    }
    if (!data.product.categoryId) {
      setError("product.categoryId", { message: "Danh mục là bắt buộc" });
      return;
    }
    if (data.productItems.length === 0) {
      setError("productItems", {
        message: "Ít nhất một mục sản phẩm là bắt buộc",
      });
      return;
    }

    // Validation cho productItems
    for (let i = 0; i < data.productItems.length; i++) {
      const item = data.productItems[i];

      if (!item.name) {
        setError(`productItems[${i}].name`, {
          message: "Tên mục sản phẩm là bắt buộc",
        });
        return;
      }
      if (!item.barcode) {
        setError(`productItems[${i}].barcode`, {
          message: "Barcode là bắt buộc",
        });
        return;
      }
      if (!item.thumbUrl && !item.thumb) {
        setError(`productItems[${i}].thumb`, {
          message: "Hình ảnh mục sản phẩm là bắt buộc",
        });
        return;
      }
      if (!item.status) {
        setError(`productItems[${i}].status`, {
          message: "Trạng thái là bắt buộc",
        });
        return;
      }

      const hasExistingImages = item.images.some(
        (img) =>
          typeof img.image === "string" &&
          (!productItemImagesDelete.includes(img.imageFileName))
      );
      const hasNewImages = item.images.some((img) => img.image instanceof File);

      if (!hasExistingImages && !hasNewImages) {
        setError(`productItems[${i}].images`, {
          message: "Ít nhất một hình ảnh bổ sung là bắt buộc",
        });
        return;
      }

      if (item.attributes.length === 0) {
        setError(`productItems[${i}].attributes`, {
          message: "Ít nhất một thuộc tính là bắt buộc",
        });
        return;
      }

      for (let j = 0; j < item.attributes.length; j++) {
        if (!item.attributes[j].code) {
          setError(`productItems[${i}].attributes[${j}].code`, {
            message: "Mã thuộc tính là bắt buộc",
          });
          return;
        }
        if (!item.attributes[j].value) {
          setError(`productItems[${i}].attributes[${j}].value`, {
            message: "Giá trị thuộc tính là bắt buộc",
          });
          return;
        }
      }

      if (!item.specifications || item.specifications.length === 0) {
        setError(`productItems[${i}].specifications`, {
          message: "Ít nhất một nhóm thông số kỹ thuật là bắt buộc",
        });
        return;
      }
      for (let k = 0; k < item.specifications.length; k++) {
        if (!item.specifications[k].group) {
          setError(`productItems[${i}].specifications[${k}].group`, {
            message: "Nhóm là bắt buộc",
          });
          return;
        }
        if (
          !item.specifications[k].items ||
          item.specifications[k].items.length === 0
        ) {
          setError(`productItems[${i}].specifications[${k}].items`, {
            message: "Ít nhất một mục thông số là bắt buộc",
          });
          return;
        }
        for (let m = 0; m < item.specifications[k].items.length; m++) {
          if (!item.specifications[k].items[m].label) {
            setError(
              `productItems[${i}].specifications[${k}].items[${m}].label`,
              {
                message: "Nhãn là bắt buộc",
              }
            );
            return;
          }
          if (!item.specifications[k].items[m].value) {
            setError(
              `productItems[${i}].specifications[${k}].items[${m}].value`,
              {
                message: "Giá trị là bắt buộc",
              }
            );
            return;
          }
        }
      }

      const retailPriceRaw = parseNumber(item.retailPrice);
      if (
        retailPriceRaw === undefined ||
        isNaN(Number.parseFloat(retailPriceRaw)) ||
        Number.parseFloat(retailPriceRaw) <= 0
      ) {
        setError(`productItems[${i}].retailPrice`, {
          message: "Giá bán lẻ phải là số lớn hơn 0",
        });
        return;
      }

      if (!item.branchId) {
        setError(`productItems[${i}].branchId`, {
          message: "Chi nhánh là bắt buộc",
        });
        return;
      }
    }

    try {
      setIsLoading(true);

      const productData = {
        name: data.product.name.trim(),
        description: data.product.description
          ? data.product.description.trim()
          : "",
        videoUrl: data.product.videoUrl ? data.product.videoUrl.trim() : "",
        brandId: data.product.brandId || "",
        categoryId: data.product.categoryId || "",
        isActive: !!data.product.isActive,
      };

      const productItemsData = data.productItems.map((item) => ({
        _id: item._id || undefined,
        name: item.name ? item.name.trim() : "",
        barcode: item.barcode ? item.barcode.trim() : "",
        attributes: item.attributes.map((attr) => ({
          code: attr.code.trim(),
          value: attr.value.trim(),
        })),
        specifications: item.specifications.map((spec) => ({
          group: spec.group.trim(),
          items: spec.items.map((specItem) => ({
            label: specItem.label.trim(),
            value: specItem.value.trim(),
          })),
        })),
        status: reverseStatusMapping[item.status],
        retailPrice: Number.parseFloat(parseNumber(item.retailPrice)),
        branchId: item.branchId,
      }));

      const formData = new FormData();
      formData.append("product", JSON.stringify(productData));
      formData.append("productItems", JSON.stringify(productItemsData));

      if (data.product.thumb) {
        formData.append("thumbProduct", data.product.thumb);
      }

      const newFeaturedImages = data.product.featuredImages.filter(
        (img) => img.image instanceof File
      );
      newFeaturedImages.forEach((img) => {
        formData.append("featuredImages", img.image);
      });

      data.productItems.forEach((item) => {
        if (item._id && item.thumb && item.thumb instanceof File) {
          formData.append(`thumbProductItem[${item._id}]`, item.thumb);
        }
        if (item._id) {
          const newImages = item.images.filter(
            (img) => img.image instanceof File
          );
          newImages.forEach((img) => {
            formData.append(`productItemImages[${item._id}]`, img.image);
          });
        }
      });

      formData.append(
        "productItemImagesDelete",
        JSON.stringify(productItemImagesDelete.filter((filename) => filename))
      );
      formData.append(
        "featuredImagesDelete",
        JSON.stringify(featuredImagesDelete.filter((filename) => filename))
      );

      const response = await apis.apiUpdateProduct(productId, formData);
      navigate("/products/product-management", {
        state: { productUpdated: response?.msg },
      });
    } catch (error) {
      toast.error(
        error?.msg || "Không thể cập nhật sản phẩm. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData || loadingOptions) {
    return <LoadingSpinner />;
  }

  const brandOptions = brands.map((brand) => ({
    value: brand._id,
    label: brand.name,
  }));

  const categoryOptions = categories.map((category) => ({
    value: category._id,
    label: category.name,
  }));

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-sm hover:bg-gray-300 flex items-center cursor-pointer"
          disabled={isLoading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          QUẢN LÝ SẢN PHẨM
        </button>
      </div>
      <div className="bg-white rounded-sm shadow-md">
        <div className="bg-[#00D5BE] text-white p-4 rounded-t-sm">
          <h2 className="text-lg font-semibold">CẬP NHẬT SẢN PHẨM</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <h3 className="text-lg font-medium mb-4">Thông tin sản phẩm</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên sản phẩm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("product.name", {
                      required: "Tên sản phẩm là bắt buộc",
                      minLength: {
                        value: 2,
                        message: "Tên sản phẩm phải có ít nhất 2 ký tự",
                      },
                      validate: {
                        notOnlyWhitespace: (value) =>
                          value.trim().length > 0 ||
                          "Tên sản phẩm không được chỉ chứa khoảng trắng",
                      },
                    })}
                    placeholder="Tên sản phẩm"
                    className={`w-full px-3 py-2 border rounded-sm ${
                      errors.product?.name
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    disabled={isLoading}
                    onChange={(e) => {
                      register("product.name").onChange(e);
                      if (e.target.value.trim()) clearErrors("product.name");
                    }}
                  />
                  {errors.product?.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.product.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả <span className="text-red-500">*</span>
                  </label>
                  <MyEditor
                    value={getValues("product.description")}
                    onChange={(data) => {
                      setValue("product.description", data, {
                        shouldValidate: true,
                      });
                      if (data && data.trim()) {
                        clearErrors("product.description");
                      }
                    }}
                    disabled={isLoading}
                    error={errors.product?.description}
                  />
                  {errors.product?.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.product.description.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Video
                  </label>
                  <input
                    type="text"
                    {...register("product.videoUrl", {
                      pattern: {
                        value:
                          /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/|vimeo\.com\/|.*\.(mp4|webm|ogg)).*$/i,
                        message:
                          "URL Video không hợp lệ (hỗ trợ YouTube, Vimeo, hoặc file video trực tiếp)",
                      },
                    })}
                    placeholder="https://youtube.com/watch?v=... hoặc https://vimeo.com/..."
                    className={`w-full px-3 py-2 border rounded-sm ${
                      errors.product?.videoUrl
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    disabled={isLoading}
                    onChange={(e) => {
                      register("product.videoUrl").onChange(e);
                      clearErrors("product.videoUrl");
                    }}
                  />
                  {errors.product?.videoUrl && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.product.videoUrl.message}
                    </p>
                  )}
                  {videoUrl && !errors.product?.videoUrl && (
                    <div className="mt-3">
                      <div className="flex items-center mb-2">
                        <Play className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Xem trước video:
                        </span>
                      </div>
                      <VideoPreview
                        url={videoUrl}
                        className="border rounded-sm overflow-hidden"
                      />
                    </div>
                  )}
                </div>
                <CustomSelect
                  name="product.brandId"
                  options={brandOptions}
                  label="Thương hiệu"
                  placeholder="Chọn thương hiệu"
                  value={watch("product.brandId")}
                  onChange={(value) => {
                    setValue("product.brandId", value, {
                      shouldValidate: true,
                    });
                    if (value) clearErrors("product.brandId");
                  }}
                  disabled={isLoading || loadingOptions}
                  withSearch={true}
                  error={errors.product?.brandId}
                  register={register("product.brandId", {
                    required: "Thương hiệu là bắt buộc",
                    pattern: {
                      value: objectIdRegex,
                      message: "Thương hiệu ID phải là ObjectId hợp lệ",
                    },
                  })}
                />
                <CustomSelect
                  name="product.categoryId"
                  options={categoryOptions}
                  label="Danh mục"
                  placeholder="Chọn danh mục"
                  value={watch("product.categoryId")}
                  onChange={(value) => {
                    setValue("product.categoryId", value, {
                      shouldValidate: true,
                    });
                    if (value) clearErrors("product.categoryId");
                  }}
                  disabled={isLoading || loadingOptions}
                  withSearch={true}
                  error={errors.product?.categoryId}
                  register={register("product.categoryId", {
                    required: "Danh mục là bắt buộc",
                    pattern: {
                      value: objectIdRegex,
                      message: "Danh mục ID phải là ObjectId hợp lệ",
                    },
                  })}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register("product.isActive")}
                      className="h-4 w-4 text-blue-600 cursor-pointer"
                      disabled={isLoading}
                      onChange={(e) => {
                        register("product.isActive").onChange(e);
                        clearErrors("product.isActive");
                      }}
                    />
                    <span className="ml-2">Kích hoạt</span>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hình ảnh chính <span className="text-red-500">*</span>
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-sm p-6 text-center ${
                      errors.product?.thumb
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    {thumbPreview ? (
                      <div className="relative">
                        <img
                          src={thumbPreview || "/placeholder.svg"}
                          alt="Thumbnail"
                          className="mx-auto max-w-full max-h-48 object-contain rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setThumbPreview("");
                            setValue("product.thumb", null);
                            setValue("product.thumbUrl", "");
                            setValue("product.thumbFileName", "");
                            setError("product.thumb", {
                              message: "Hình ảnh sản phẩm là bắt buộc",
                            });
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-sm p-1 hover:bg-red-600 cursor-pointer"
                          disabled={isLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <label
                          htmlFor="thumb-upload"
                          className="cursor-pointer"
                        >
                          <span className="bg-blue-500 text-white px-4 py-2 rounded-sm hover:bg-blue-600 inline-block cursor-pointer">
                            Chọn ảnh
                          </span>
                          <input
                            id="thumb-upload"
                            type="file"
                            accept="image/png,image/jpeg,image/gif"
                            onChange={handleThumbChange}
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
                  {errors.product?.thumb && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.product.thumb.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hình ảnh nổi bật
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-sm p-6 text-center ${
                      errors.product?.featuredImages
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <div className="mb-4">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <label
                        htmlFor="featured-images-upload"
                        className="cursor-pointer"
                      >
                        <span className="bg-blue-500 text-white px-4 py-2 rounded-sm hover:bg-blue-600 inline-block cursor-pointer">
                          Chọn nhiều ảnh
                        </span>
                        <input
                          id="featured-images-upload"
                          type="file"
                          accept="image/png,image/jpeg,image/gif"
                          multiple
                          onChange={handleFeaturedImageChange}
                          className="hidden"
                          disabled={isLoading}
                        />
                      </label>
                      <div className="text-gray-400 text-sm mt-2">
                        PNG, JPG, GIF tối đa 10MB mỗi ảnh
                      </div>
                    </div>
                    {featuredImagesPreviews.length > 0 &&
                      (featuredImagesPreviews.filter((preview) => preview)
                        .length > 1 ? (
                        <DragDropContext
                          onDragEnd={handleFeaturedImagesDragEnd}
                        >
                          <Droppable
                            droppableId="featuredImages"
                            direction="vertical"
                          >
                            {(provided) => (
                              <div
                                className="flex flex-col gap-4 max-w-full overflow-x-hidden"
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                              >
                                {featuredImagesPreviews.map(
                                  (img, index) =>
                                    img && (
                                      <Draggable
                                        key={`featured-${index}`}
                                        draggableId={`featured-${index}`}
                                        index={index}
                                      >
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className={`relative cursor-move border border-gray-300 bg-white p-2 rounded-sm ${
                                              snapshot.isDragging
                                                ? "shadow-lg opacity-80"
                                                : ""
                                            }`}
                                            style={{
                                              width: "100%",
                                              height: "200px",
                                              ...provided.draggableProps.style,
                                            }}
                                          >
                                            <img
                                              src={img || "/placeholder.svg"}
                                              alt={`Featured Image ${index}`}
                                              className="w-full h-full object-contain rounded"
                                            />
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleRemoveFeaturedImage(index)
                                              }
                                              className="absolute top-2 right-2 bg-red-500 text-white rounded-sm p-1 hover:bg-red-600 cursor-pointer"
                                              disabled={isLoading}
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          </div>
                                        )}
                                      </Draggable>
                                    )
                                )}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </DragDropContext>
                      ) : (
                        <div className="flex flex-col gap-4 max-w-full overflow-x-hidden">
                          {featuredImagesPreviews.map(
                            (img, index) =>
                              img && (
                                <div
                                  key={`featured-${index}`}
                                  className="relative border border-gray-300 bg-white p-2 rounded-sm"
                                  style={{ width: "100%", height: "200px" }}
                                >
                                  <img
                                    src={img || "/placeholder.svg"}
                                    alt={`Featured Image ${index}`}
                                    className="w-full h-full object-contain rounded"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveFeaturedImage(index)
                                    }
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-sm p-1 hover:bg-red-600 cursor-pointer"
                                    disabled={isLoading}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )
                          )}
                        </div>
                      ))}
                  </div>
                  {errors.product?.featuredImages && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.product.featuredImages.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">
                Danh sách mục sản phẩm
              </h3>
              {errors.productItems && (
                <p className="text-red-500 text-sm mb-4">
                  {errors.productItems.message}
                </p>
              )}
              {productItemsFields.length > 1 ? (
                <DragDropContext onDragEnd={handleProductItemDragEnd}>
                  <Droppable droppableId="productItems" direction="vertical">
                    {(provided) => (
                      <div
                        className="space-y-4"
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        {productItemsFields.map((field, index) => (
                          <Draggable
                            key={field.id}
                            draggableId={`productItem-${field.id}`}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`border border-gray-300 p-4 rounded-sm cursor-move ${
                                  snapshot.isDragging
                                    ? "shadow-lg opacity-80"
                                    : ""
                                }`}
                              >
                                <UpdateProductItemForm
                                  itemIndex={index}
                                  control={control}
                                  register={register}
                                  errors={errors}
                                  isLoading={isLoading}
                                  productItemsPreviews={productItemsPreviews}
                                  setProductItemsPreviews={
                                    setProductItemsPreviews
                                  }
                                  handleProductItemThumbChange={
                                    handleProductItemThumbChange
                                  }
                                  handleProductItemImageChange={
                                    handleProductItemImageChange
                                  }
                                  setValue={setValue}
                                  productItemsFields={productItemsFields}
                                  setProductItemImagesDelete={
                                    setProductItemImagesDelete
                                  }
                                  clearErrors={clearErrors}
                                  setError={setError}
                                  watch={watch}
                                  branches={branches}
                                  categoryId={categoryId}
                                  categories={categories}
                                  getValues={getValues}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              ) : (
                <div className="space-y-4">
                  {productItemsFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="border border-gray-300 p-4 rounded-sm"
                    >
                      <UpdateProductItemForm
                        itemIndex={index}
                        control={control}
                        register={register}
                        errors={errors}
                        isLoading={isLoading}
                        productItemsPreviews={productItemsPreviews}
                        setProductItemsPreviews={setProductItemsPreviews}
                        handleProductItemThumbChange={
                          handleProductItemThumbChange
                        }
                        handleProductItemImageChange={
                          handleProductItemImageChange
                        }
                        setValue={setValue}
                        productItemsFields={productItemsFields}
                        setProductItemImagesDelete={setProductItemImagesDelete}
                        clearErrors={clearErrors}
                        setError={setError}
                        watch={watch}
                        branches={branches}
                        categoryId={categoryId}
                        categories={categories}
                        getValues={getValues}
                      />
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  appendProductItem({
                    name: "",
                    barcode: "",
                    thumb: null,
                    thumbUrl: "",
                    thumbFileName: "",
                    images: [],
                    attributes: [{ code: "", value: "" }],
                    specifications: [
                      { group: "", items: [{ label: "", value: "" }] },
                    ],
                    status: "inactive",
                    retailPrice: "",
                    branchId: "",
                    prevCategoryId: categoryId,
                  });
                  setProductItemsPreviews((prev) => [
                    ...prev,
                    { thumb: "", images: [] },
                  ]);
                }}
                className="text-blue-500 hover:text-blue-600 flex items-center cursor-pointer mt-4"
                disabled={isLoading}
              >
                <Plus className="w-4 h-4 mr-2" /> Thêm mục sản phẩm
              </button>
            </div>

            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-2 bg-gray-500 text-white rounded-sm hover:bg-gray-600 cursor-pointer"
                disabled={isLoading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-pink-500 text-white rounded-sm hover:bg-pink-600 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Cập nhật sản phẩm
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmExitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => navigate("/products/product-management")}
      />
    </div>
  );
};

export default UpdateProduct;