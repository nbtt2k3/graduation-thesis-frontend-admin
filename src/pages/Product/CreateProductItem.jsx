"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Upload, Trash2 } from "lucide-react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import * as apis from "../../apis";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { CustomSelect, ConfirmExitModal } from "../../components";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { LoadingSpinner } from "../../components";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const parseNumber = (value) => {
  if (!value) return "";
  return value.replace(/,/g, "");
};

const formatNumber = (value) => {
  if (!value && value !== 0) return "";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const SpecificationGroup = ({
  index,
  control,
  register,
  errors,
  isLoading,
  removeSpecification,
  specificationsFields,
  clearErrors,
}) => {
  const {
    fields: items,
    append: appendItem,
    remove: removeItem,
    move: moveItem,
  } = useFieldArray({
    control,
    name: `specifications[${index}].items`,
  });

  const handleSpecItemDragEnd = (result) => {
    if (!result.destination) return;
    moveItem(result.source.index, result.destination.index);
  };

  return (
    <div className="mb-4 border border-gray-300 p-4 rounded-sm">
      <div className="flex justify-between items-center mb-2">
        <span>Nhóm thông số {index + 1}</span>
        {specificationsFields.length > 1 && (
          <button
            type="button"
            onClick={() => removeSpecification(index)}
            className="text-white bg-red-500 hover:bg-red-600 p-1 rounded-sm cursor-pointer"
            disabled={isLoading}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nhóm
        </label>
        <input
          {...register(`specifications[${index}].group`, {
            required: "Nhóm là bắt buộc",
            minLength: { value: 2, message: "Nhóm phải có ít nhất 2 ký tự" },
            maxLength: {
              value: 50,
              message: "Nhóm không được vượt quá 50 ký tự",
            },
            validate: {
              notOnlyWhitespace: (value) =>
                value.trim().length > 0 ||
                "Nhóm không được chỉ chứa khoảng trắng",
            },
          })}
          placeholder="Tên nhóm"
          className={`w-full px-3 py-2 border rounded-sm ${
            errors.specifications?.[index]?.group
              ? "border-red-500"
              : "border-gray-300"
          }`}
          disabled={isLoading}
          onChange={(e) => {
            register(`specifications[${index}].group`).onChange(e);
            if (e.target.value.trim()) {
              clearErrors(`specifications[${index}].group`);
            }
          }}
        />
        {errors.specifications?.[index]?.group && (
          <p className="text-red-500 text-sm mt-1">
            {errors.specifications[index].group.message}
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mục thông số
        </label>
        {items.length > 1 ? (
          <DragDropContext onDragEnd={handleSpecItemDragEnd}>
            <Droppable droppableId={`spec-items-${index}`} direction="vertical">
              {(provided) => (
                <div
                  className="space-y-2"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {items.map((item, specItemIndex) => (
                    <Draggable
                      key={item.id}
                      draggableId={`spec-item-${index}-${item.id}`}
                      index={specItemIndex}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`mb-2 p-2 border border-gray-300 rounded-sm cursor-move ${
                            snapshot.isDragging ? "shadow-lg opacity-80" : ""
                          }`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span>Mục thông số {specItemIndex + 1}</span>
                            {items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItem(specItemIndex)}
                                className="text-white bg-red-500 hover:bg-red-600 p-1 rounded-sm cursor-pointer"
                                disabled={isLoading}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <div className="w-1/2">
                              <input
                                {...register(
                                  `specifications[${index}].items[${specItemIndex}].label`,
                                  {
                                    required: "Nhãn là bắt buộc",
                                    minLength: {
                                      value: 2,
                                      message: "Nhãn phải có ít nhất 2 ký tự",
                                    },
                                    maxLength: {
                                      value: 50,
                                      message:
                                        "Nhãn không được vượt quá 50 ký tự",
                                    },
                                    validate: {
                                      notOnlyWhitespace: (value) =>
                                        value.trim().length > 0 ||
                                        "Nhãn không được chỉ chứa khoảng trắng",
                                    },
                                  }
                                )}
                                placeholder="Nhãn"
                                className={`w-full px-3 py-2 border rounded-sm ${
                                  errors.specifications?.[index]?.items?.[
                                    specItemIndex
                                  ]?.label
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                                disabled={isLoading}
                                onChange={(e) => {
                                  register(
                                    `specifications[${index}].items[${specItemIndex}].label`
                                  ).onChange(e);
                                  if (e.target.value.trim()) {
                                    clearErrors(
                                      `specifications[${index}].items[${specItemIndex}].label`
                                    );
                                  }
                                }}
                              />
                              {errors.specifications?.[index]?.items?.[
                                specItemIndex
                              ]?.label && (
                                <p className="text-red-500 text-sm mt-1">
                                  {
                                    errors.specifications[index].items[
                                      specItemIndex
                                    ].label.message
                                  }
                                </p>
                              )}
                            </div>
                            <div className="w-1/2">
                              <input
                                {...register(
                                  `specifications[${index}].items[${specItemIndex}].value`,
                                  {
                                    required: "Giá trị là bắt buộc",
                                    minLength: {
                                      value: 2,
                                      message:
                                        "Giá trị phải có ít nhất 2 ký tự",
                                    },
                                    maxLength: {
                                      value: 50,
                                      message:
                                        "Giá trị không được vượt quá 50 ký tự",
                                    },
                                    validate: {
                                      notOnlyWhitespace: (value) =>
                                        value.trim().length > 0 ||
                                        "Giá trị không được chỉ chứa khoảng trắng",
                                    },
                                  }
                                )}
                                placeholder="Giá trị"
                                className={`w-full px-3 py-2 border rounded-sm ${
                                  errors.specifications?.[index]?.items?.[
                                    specItemIndex
                                  ]?.value
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                                disabled={isLoading}
                                onChange={(e) => {
                                  register(
                                    `specifications[${index}].items[${specItemIndex}].value`
                                  ).onChange(e);
                                  if (e.target.value.trim()) {
                                    clearErrors(
                                      `specifications[${index}].items[${specItemIndex}].value`
                                    );
                                  }
                                }}
                              />
                              {errors.specifications?.[index]?.items?.[
                                specItemIndex
                              ]?.value && (
                                <p className="text-red-500 text-sm mt-1">
                                  {
                                    errors.specifications[index].items[
                                      specItemIndex
                                    ].value.message
                                  }
                                </p>
                              )}
                            </div>
                          </div>
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
          <div className="space-y-2">
            {items.map((item, specItemIndex) => (
              <div
                key={item.id}
                className="mb-2 p-2 border border-gray-300 rounded-sm"
              >
                <div className="flex justify-between items-center mb-2">
                  <span>Mục thông số {specItemIndex + 1}</span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(specItemIndex)}
                      className="text-white bg-red-500 hover:bg-red-600 p-1 rounded-sm cursor-pointer"
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex space-x-2">
                  <div className="w-1/2">
                    <input
                      {...register(
                        `specifications[${index}].items[${specItemIndex}].label`,
                        {
                          required: "Nhãn là bắt buộc",
                          minLength: {
                            value: 2,
                            message: "Nhãn phải có ít nhất 2 ký tự",
                          },
                          maxLength: {
                            value: 50,
                            message: "Nhãn không được vượt quá 50 ký tự",
                          },
                          validate: {
                            notOnlyWhitespace: (value) =>
                              value.trim().length > 0 ||
                              "Nhãn không được chỉ chứa khoảng trắng",
                          },
                        }
                      )}
                      placeholder="Nhãn"
                      className={`w-full px-3 py-2 border rounded-sm ${
                        errors.specifications?.[index]?.items?.[specItemIndex]
                          ?.label
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      disabled={isLoading}
                      onChange={(e) => {
                        register(
                          `specifications[${index}].items[${specItemIndex}].label`
                        ).onChange(e);
                        if (e.target.value.trim()) {
                          clearErrors(
                            `specifications[${index}].items[${specItemIndex}].label`
                          );
                        }
                      }}
                    />
                    {errors.specifications?.[index]?.items?.[specItemIndex]
                      ?.label && (
                      <p className="text-red-500 text-sm mt-1">
                        {
                          errors.specifications[index].items[specItemIndex]
                            .label.message
                        }
                      </p>
                    )}
                  </div>
                  <div className="w-1/2">
                    <input
                      {...register(
                        `specifications[${index}].items[${specItemIndex}].value`,
                        {
                          required: "Giá trị là bắt buộc",
                          minLength: {
                            value: 2,
                            message: "Giá trị phải có ít nhất 2 ký tự",
                          },
                          maxLength: {
                            value: 50,
                            message: "Giá trị không được vượt quá 50 ký tự",
                          },
                          validate: {
                            notOnlyWhitespace: (value) =>
                              value.trim().length > 0 ||
                              "Giá trị không được chỉ chứa khoảng trắng",
                          },
                        }
                      )}
                      placeholder="Giá trị"
                      className={`w-full px-3 py-2 border rounded-sm ${
                        errors.specifications?.[index]?.items?.[specItemIndex]
                          ?.value
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      disabled={isLoading}
                      onChange={(e) => {
                        register(
                          `specifications[${index}].items[${specItemIndex}].value`
                        ).onChange(e);
                        if (e.target.value.trim()) {
                          clearErrors(
                            `specifications[${index}].items[${specItemIndex}].value`
                          );
                        }
                      }}
                    />
                    {errors.specifications?.[index]?.items?.[specItemIndex]
                      ?.value && (
                      <p className="text-red-500 text-sm mt-1">
                        {
                          errors.specifications[index].items[specItemIndex]
                            .value.message
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => appendItem({ label: "", value: "" })}
          className="text-blue-500 hover:text-blue-600 flex items-center cursor-pointer mt-2"
          disabled={isLoading}
        >
          <Plus className="w-4 h-4 mr-2" /> Thêm mục
        </button>
      </div>
    </div>
  );
};

const CreateProductItem = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const statusOptions = [
    { value: "active", label: "Hoạt động" },
    { value: "inactive", label: "Không hoạt động" },
    { value: "out_of_stock", label: "Hết hàng" },
  ];

  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
      barcode: "",
      thumb: null,
      thumbFileName: "",
      images: [],
      attributes: [{ code: "", value: "" }],
      specifications: [{ group: "", items: [{ label: "", value: "" }] }],
      status: "active",
      retailPrice: "",
      purchasePrice: "",
      supplierId: "",
      branchId: "",
      initialStock: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    setValue,
    control,
    watch,
  } = methods;

  const {
    fields: attributes,
    append: appendAttribute,
    remove: removeAttribute,
    move: moveAttribute,
  } = useFieldArray({
    control,
    name: "attributes",
  });

  const {
    fields: specificationsFields,
    append: appendSpecification,
    remove: removeSpecification,
    move: moveSpecification,
  } = useFieldArray({
    control,
    name: "specifications",
  });

  const [thumbPreview, setThumbPreview] = useState("");
  const [imagesPreviews, setImagesPreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [retailPriceDisplay, setRetailPriceDisplay] = useState("");
  const [purchasePriceDisplay, setPurchasePriceDisplay] = useState("");
  const [initialStockDisplay, setInitialStockDisplay] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingOptions(true);
        const [productRes, supplierRes, branchRes, categoryRes] =
          await Promise.all([
            apis.apiGetProductById(productId),
            apis.apiGetAllSuppliers({ limit: 0, isActive: true }),
            apis.apiGetAllBranches({ limit: 0, isActive: true }),
            apis.apiGetAllCategories({ limit: 0, isActive: true }),
          ]);
        setProduct(productRes?.product || null);
        setSuppliers(
          supplierRes?.supplierList?.filter((s) => s.isActive) || []
        );
        setBranches(branchRes?.branchList?.filter((b) => b.isActive) || []);
        setCategories(
          categoryRes?.categoryList?.filter(
            (c) => c.isActive && c.level === 3
          ) || []
        );
      } catch (error) {
        if (error?.msg) {
          toast.error(error.msg || "Không thể tải dữ liệu. Vui lòng thử lại.");
        }
        setProduct(null);
        setSuppliers([]);
        setBranches([]);
        setCategories([]);
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchData();
  }, [productId]);

  useEffect(() => {
    const retailPrice = control._formValues.retailPrice || "";
    const purchasePrice = control._formValues.purchasePrice || "";
    const initialStock = control._formValues.initialStock || "";
    setRetailPriceDisplay(formatNumber(retailPrice));
    setPurchasePriceDisplay(formatNumber(purchasePrice));
    setInitialStockDisplay(formatNumber(initialStock));
  }, [
    control._formValues.retailPrice,
    control._formValues.purchasePrice,
    control._formValues.initialStock,
  ]);

  useEffect(() => {
    if (attributes.length === 0) {
      appendAttribute({ code: "", value: "" });
    }
    if (specificationsFields.length === 0) {
      appendSpecification({ group: "", items: [{ label: "", value: "" }] });
    }
  }, [
    attributes.length,
    appendAttribute,
    specificationsFields.length,
    appendSpecification,
  ]);

  const handleThumbChange = (e) => {
    clearErrors("thumb");
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/png", "image/jpeg", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setError("thumb", { message: "Chỉ chấp nhận PNG, JPG, GIF" });
        setThumbPreview("");
        setValue("thumb", null);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("thumb", { message: "Hình ảnh không vượt quá 10MB" });
        setThumbPreview("");
        setValue("thumb", null);
        return;
      }
      setValue("thumb", file);
      setValue("thumbFileName", file.name);
      const url = URL.createObjectURL(file);
      setThumbPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setThumbPreview("");
      setValue("thumb", null);
      setError("thumb", { message: "Hình ảnh mục sản phẩm là bắt buộc" });
    }
  };

  const handleImagesChange = (e) => {
    clearErrors("images");
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const validTypes = ["image/png", "image/jpeg", "image/gif"];
      const invalidFiles = files.filter(
        (file) =>
          !validTypes.includes(file.type) || file.size > 10 * 1024 * 1024
      );
      if (invalidFiles.length > 0) {
        setError("images", {
          message:
            "Một số hình ảnh không hợp lệ (chỉ chấp nhận PNG, JPG, GIF, tối đa 10MB)",
        });
        return;
      }
      const newImages = files.map((file) => ({
        image: file,
        imageFileName: file.name,
      }));
      const currentImages = control._formValues.images || [];
      setValue("images", [...currentImages, ...newImages]);
      const previews = files.map((file) => URL.createObjectURL(file));
      setImagesPreviews((prev) => [...prev, ...previews]);
      return () => previews.forEach((url) => URL.revokeObjectURL(url));
    } else {
      setError("images", {
        message: "Ít nhất một hình ảnh bổ sung là bắt buộc",
      });
    }
  };

  const handleImageDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedImages = Array.from(imagesPreviews);
    const reorderedFormImages = Array.from(control._formValues.images || []);

    const [removedImage] = reorderedImages.splice(result.source.index, 1);
    reorderedImages.splice(result.destination.index, 0, removedImage);

    const [removedFormImage] = reorderedFormImages.splice(
      result.source.index,
      1
    );
    reorderedFormImages.splice(result.destination.index, 0, removedFormImage);

    setImagesPreviews(reorderedImages);
    setValue("images", reorderedFormImages);
  };

  const handleAttributeDragEnd = (result) => {
    if (!result.destination) return;
    moveAttribute(result.source.index, result.destination.index);
  };

  const handleSpecificationDragEnd = (result) => {
    if (!result.destination) return;
    moveSpecification(result.source.index, result.destination.index);
  };

  const onSubmit = async (data) => {
    if (!data.supplierId) {
      setError("supplierId", { message: "Nhà cung cấp là bắt buộc" });
    }
    if (!data.branchId) {
      setError("branchId", { message: "Chi nhánh là bắt buộc" });
    }
    if (!data.supplierId || !data.branchId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      const itemId = uuidv4();
      const productItemData = {
        id: itemId,
        name: data.name.trim(),
        barcode: data.barcode.trim(),
        attributes: data.attributes.map((attr) => ({
          code: attr.code.trim(),
          value: attr.value.trim(),
        })),
        specifications: data.specifications.map((spec) => ({
          group: spec.group.trim(),
          items: spec.items.map((item) => ({
            label: item.label.trim(),
            value: item.value.trim(),
          })),
        })),
        status: data.status || "active",
        retailPrice: Number.parseFloat(parseNumber(data.retailPrice)),
        purchasePrice: Number.parseFloat(parseNumber(data.purchasePrice)),
        supplierId: data.supplierId,
        branchId: data.branchId,
        initialStock: Number.parseInt(parseNumber(data.initialStock)),
      };

      formData.append("productItem", JSON.stringify(productItemData));
      if (data.thumb) {
        formData.append(`thumbProductItem[${itemId}]`, data.thumb);
      }
      const validImages = data.images.filter(
        (img) => img.image instanceof File
      );
      if (validImages.length === 0) {
        setError("images", {
          message: "Ít nhất một hình ảnh bổ sung hợp lệ là bắt buộc",
        });
        setIsLoading(false);
        return;
      }
      validImages.forEach((img) => {
        formData.append(`productItemImages[${itemId}]`, img.image);
      });

      const response = await apis.apiCreateProductItem(formData, productId);
      navigate("/products/product-management", {
        state: { productCreated: response?.msg },
      });
    } catch (error) {
      if (error?.msg) {
        toast.error(error.msg || "Không thể tạo sản phẩm. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const supplierOptions = [
    ...suppliers.map((supplier) => ({
      value: supplier._id,
      label: supplier.name,
    })),
  ];

  const branchOptions = [
    ...branches.map((branch) => ({
      value: branch._id,
      label: branch.name,
    })),
  ];

  if (loadingOptions) {
    return <LoadingSpinner />;
  }

  return (
    <FormProvider {...methods}>
      <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
        <div className="mb-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-sm hover:bg-gray-300 flex items-center cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            QUẢN LÝ MỤC SẢN PHẨM
          </button>
        </div>

        <div className="bg-white rounded-sm shadow-md">
          <div className="bg-[#00D5BE] text-white p-4 rounded-t-sm">
            <h2 className="text-lg font-semibold">THÊM MỤC SẢN PHẨM</h2>
          </div>

          <div className="p-6">
            {product && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Thông tin sản phẩm</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tên sản phẩm
                    </label>
                    <p className="px-3 py-2 border border-gray-300 rounded-sm bg-gray-100">
                      {product.name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Danh mục
                    </label>
                    <p className="px-3 py-2 border border-gray-300 rounded-sm bg-gray-100">
                      {categories.find((cat) => cat._id === product.categoryId)
                        ?.name || "Không xác định"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <input
                type="hidden"
                {...register("attributes", {
                  validate: (value) =>
                    value.length > 0 || "Phải có ít nhất 1 thuộc tính",
                })}
              />
              <input
                type="hidden"
                {...register("specifications", {
                  validate: (value) =>
                    value.length > 0 || "Phải có ít nhất 1 nhóm thông số",
                })}
              />
              <h3 className="text-lg font-medium mb-4">
                Thông tin mục sản phẩm
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên mục <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("name", {
                        required: "Tên mục là bắt buộc",
                        minLength: {
                          value: 2,
                          message: "Tên mục phải có ít nhất 2 ký tự",
                        },
                        validate: {
                          notOnlyWhitespace: (value) =>
                            value.trim().length > 0 ||
                            "Tên mục không được chỉ chứa khoảng trắng",
                        },
                      })}
                      placeholder="Tên mục sản phẩm"
                      className={`w-full px-3 py-2 border rounded-sm ${
                        errors.name ? "border-red-600" : "border-gray-300"
                      }`}
                      disabled={isLoading}
                      onChange={(e) => {
                        register("name").onChange(e);
                        if (e.target.value.trim()) clearErrors("name");
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
                      Barcode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("barcode", {
                        required: "Barcode là bắt buộc",
                        minLength: {
                          value: 3,
                          message: "Barcode phải có ít nhất 3 ký tự",
                        },
                        maxLength: {
                          value: 100,
                          message: "Barcode không được vượt quá 100 ký tự",
                        },
                        validate: {
                          notOnlyWhitespace: (value) =>
                            value.trim().length > 0 ||
                            "Barcode không được chỉ chứa khoảng trắng",
                        },
                      })}
                      placeholder="Barcode"
                      className={`w-full px-3 py-2 border rounded-sm ${
                        errors.barcode ? "border-red-600" : "border-gray-300"
                      }`}
                      disabled={isLoading}
                      onChange={(e) => {
                        register("barcode").onChange(e);
                        if (e.target.value.trim()) clearErrors("barcode");
                      }}
                    />
                    {errors.barcode && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.barcode.message}
                      </p>
                    )}
                  </div>

                  <CustomSelect
                    name="status"
                    options={statusOptions}
                    label="Trạng thái"
                    placeholder="Chọn trạng thái"
                    value={watch("status")}
                    onChange={(value) => {
                      setValue("status", value, { shouldValidate: true });
                      if (value) clearErrors("status");
                    }}
                    disabled={isLoading}
                    withSearch={false}
                    error={errors.status}
                    register={register("status", {
                      required: "Trạng thái là bắt buộc",
                      validate: (value) =>
                        statusOptions.map((opt) => opt.value).includes(value) ||
                        `Trạng thái chỉ được là: ${statusOptions
                          .map((opt) => opt.value)
                          .join(", ")}`,
                    })}
                  />
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hình ảnh chính <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-sm p-6 text-center ${
                        errors.thumb ? "border-red-600" : "border-gray-300"
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
                              setValue("thumb", null);
                              setValue("thumbFileName", "");
                              setError("thumb", {
                                message: "Hình ảnh mục sản phẩm là bắt buộc",
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
                    {errors.thumb && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.thumb.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hình ảnh bổ sung <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-sm p-6 text-center ${
                        errors.images ? "border-red-600" : "border-gray-300"
                      }`}
                    >
                      <div className="mb-4">
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <label
                          htmlFor="images-upload"
                          className="cursor-pointer"
                        >
                          <span className="bg-blue-500 text-white px-4 py-2 rounded-sm hover:bg-blue-600 inline-block cursor-pointer">
                            Chọn nhiều ảnh
                          </span>
                          <input
                            id="images-upload"
                            type="file"
                            accept="image/png,image/jpeg,image/gif"
                            multiple
                            onChange={handleImagesChange}
                            className="hidden"
                            disabled={isLoading}
                          />
                        </label>
                        <div className="text-gray-400 text-sm mt-2">
                          PNG, JPG, GIF tối đa 10MB mỗi ảnh
                        </div>
                      </div>
                      {imagesPreviews.length > 0 &&
                        (imagesPreviews.filter((preview) => preview).length >
                        1 ? (
                          <DragDropContext onDragEnd={handleImageDragEnd}>
                            <Droppable
                              droppableId="images"
                              direction="vertical"
                            >
                              {(provided) => (
                                <div
                                  className="flex flex-col gap-4 max-w-full overflow-x-hidden"
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                >
                                  {imagesPreviews.map(
                                    (preview, index) =>
                                      preview && (
                                        <Draggable
                                          key={`image-${index}`}
                                          draggableId={`image-${index}`}
                                          index={index}
                                        >
                                          {(provided, snapshot) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              {...provided.dragHandleProps}
                                              className={`relative cursor-move bg-white p-2 rounded-sm ${
                                                snapshot.isDragging
                                                  ? "shadow-lg opacity-80"
                                                  : ""
                                              }`}
                                              style={{
                                                width: "100%",
                                                height: "200px",
                                                ...provided.draggableProps
                                                  .style,
                                              }}
                                            >
                                              <img
                                                src={
                                                  preview || "/placeholder.svg"
                                                }
                                                alt={`Image ${index}`}
                                                className="w-full h-full object-contain rounded border border-gray-300 p-2"
                                              />
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setImagesPreviews((prev) =>
                                                    prev.filter(
                                                      (_, i) => i !== index
                                                    )
                                                  );
                                                  const newImages =
                                                    control._formValues.images.filter(
                                                      (_, i) => i !== index
                                                    );
                                                  setValue("images", newImages);
                                                  if (newImages.length === 0) {
                                                    setError("images", {
                                                      message:
                                                        "Ít nhất một hình ảnh bổ sung là bắt buộc",
                                                    });
                                                  } else {
                                                    clearErrors("images");
                                                  }
                                                }}
                                                className="absolute top-5 right-4 bg-red-500 text-white rounded-sm p-1 hover:bg-red-600 cursor-pointer"
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
                            {imagesPreviews.map(
                              (preview, index) =>
                                preview && (
                                  <div
                                    key={`image-${index}`}
                                    className="relative bg-white p-2 rounded-sm"
                                    style={{ width: "100%", height: "200px" }}
                                  >
                                    <img
                                      src={preview || "/placeholder.svg"}
                                      alt={`Image ${index}`}
                                      className="w-full h-full object-contain rounded border border-gray-300 p-2"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setImagesPreviews((prev) =>
                                          prev.filter((_, i) => i !== index)
                                        );
                                        const newImages =
                                          control._formValues.images.filter(
                                            (_, i) => i !== index
                                          );
                                        setValue("images", newImages);
                                        if (newImages.length === 0) {
                                          setError("images", {
                                            message:
                                              "Ít nhất một hình ảnh bổ sung là bắt buộc",
                                          });
                                        } else {
                                          clearErrors("images");
                                        }
                                      }}
                                      className="absolute top-5 right-4 bg-red-500 text-white rounded-sm p-1 hover:bg-red-600 cursor-pointer"
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
                    {errors.images && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.images.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thuộc tính <span className="text-red-500">*</span>
                </label>
                {attributes.length > 1 ? (
                  <DragDropContext onDragEnd={handleAttributeDragEnd}>
                    <Droppable droppableId="attributes" direction="vertical">
                      {(provided) => (
                        <div
                          className="space-y-4"
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {attributes.map((attr, attrIndex) => (
                            <Draggable
                              key={attr.id}
                              draggableId={`attribute-${attr.id}`}
                              index={attrIndex}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`mb-4 border border-gray-300 p-4 rounded-sm cursor-move ${
                                    snapshot.isDragging
                                      ? "shadow-lg opacity-80"
                                      : ""
                                  }`}
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <span>Thuộc tính {attrIndex + 1}</span>
                                    {attributes.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeAttribute(attrIndex)
                                        }
                                        className="text-white bg-red-500 hover:bg-red-600 p-1 rounded-sm cursor-pointer"
                                        disabled={isLoading}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                  <div className="flex space-x-2">
                                    <div className="w-1/2">
                                      <input
                                        type="text"
                                        {...register(
                                          `attributes[${attrIndex}].code`,
                                          {
                                            required:
                                              "Mã thuộc tính là bắt buộc",
                                            minLength: {
                                              value: 2,
                                              message:
                                                "Mã thuộc tính phải có ít nhất 2 ký tự",
                                            },
                                            maxLength: {
                                              value: 50,
                                              message:
                                                "Mã thuộc tính không được vượt quá 50 ký tự",
                                            },
                                            validate: {
                                              notOnlyWhitespace: (value) =>
                                                value.trim().length > 0 ||
                                                "Mã thuộc tính không được chỉ chứa khoảng trắng",
                                            },
                                          }
                                        )}
                                        placeholder="Mã thuộc tính"
                                        className={`w-full px-3 py-2 border rounded-sm ${
                                          errors.attributes?.[attrIndex]?.code
                                            ? "border-red-600"
                                            : "border-gray-300"
                                        }`}
                                        disabled={isLoading}
                                        onChange={(e) => {
                                          register(
                                            `attributes[${attrIndex}].code`
                                          ).onChange(e);
                                          if (e.target.value.trim())
                                            clearErrors(
                                              `attributes[${attrIndex}].code`
                                            );
                                        }}
                                      />
                                      {errors.attributes?.[attrIndex]?.code && (
                                        <p className="text-red-500 text-sm mt-1">
                                          {
                                            errors.attributes[attrIndex].code
                                              .message
                                          }
                                        </p>
                                      )}
                                    </div>
                                    <div className="w-1/2">
                                      <input
                                        type="text"
                                        {...register(
                                          `attributes[${attrIndex}].value`,
                                          {
                                            required: "Giá trị là bắt buộc",
                                            minLength: {
                                              value: 2,
                                              message:
                                                "Giá trị phải có ít nhất 2 ký tự",
                                            },
                                            maxLength: {
                                              value: 50,
                                              message:
                                                "Giá trị không được vượt quá 50 ký tự",
                                            },
                                            validate: {
                                              notOnlyWhitespace: (value) =>
                                                value.trim().length > 0 ||
                                                "Giá trị không được chỉ chứa khoảng trắng",
                                            },
                                          }
                                        )}
                                        placeholder="Giá trị thuộc tính"
                                        className={`w-full px-3 py-2 border rounded-sm ${
                                          errors.attributes?.[attrIndex]?.value
                                            ? "border-red-600"
                                            : "border-gray-300"
                                        }`}
                                        disabled={isLoading}
                                        onChange={(e) => {
                                          register(
                                            `attributes[${attrIndex}].value`
                                          ).onChange(e);
                                          if (e.target.value.trim())
                                            clearErrors(
                                              `attributes[${attrIndex}].value`
                                            );
                                        }}
                                      />
                                      {errors.attributes?.[attrIndex]
                                        ?.value && (
                                        <p className="text-red-500 text-sm mt-1">
                                          {
                                            errors.attributes[attrIndex].value
                                              .message
                                          }
                                        </p>
                                      )}
                                    </div>
                                  </div>
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
                    {attributes.map((attr, attrIndex) => (
                      <div
                        key={attr.id}
                        className="mb-4 border border-gray-300 p-4 rounded-sm"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span>Thuộc tính {attrIndex + 1}</span>
                          {attributes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeAttribute(attrIndex)}
                              className="text-white bg-red-500 hover:bg-red-600 p-1 rounded-sm cursor-pointer"
                              disabled={isLoading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <div className="w-1/2">
                            <input
                              type="text"
                              {...register(`attributes[${attrIndex}].code`, {
                                required: "Mã thuộc tính là bắt buộc",
                                minLength: {
                                  value: 2,
                                  message:
                                    "Mã thuộc tính phải có ít nhất 2 ký tự",
                                },
                                maxLength: {
                                  value: 50,
                                  message:
                                    "Mã thuộc tính không được vượt quá 50 ký tự",
                                },
                                validate: {
                                  notOnlyWhitespace: (value) =>
                                    value.trim().length > 0 ||
                                    "Mã thuộc tính không được chỉ chứa khoảng trắng",
                                },
                              })}
                              placeholder="Mã thuộc tính"
                              className={`w-full px-3 py-2 border rounded-sm ${
                                errors.attributes?.[attrIndex]?.code
                                  ? "border-red-600"
                                  : "border-gray-300"
                              }`}
                              disabled={isLoading}
                              onChange={(e) => {
                                register(
                                  `attributes[${attrIndex}].code`
                                ).onChange(e);
                                if (e.target.value.trim())
                                  clearErrors(`attributes[${attrIndex}].code`);
                              }}
                            />
                            {errors.attributes?.[attrIndex]?.code && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.attributes[attrIndex].code.message}
                              </p>
                            )}
                          </div>
                          <div className="w-1/2">
                            <input
                              type="text"
                              {...register(`attributes[${attrIndex}].value`, {
                                required: "Giá trị là bắt buộc",
                                minLength: {
                                  value: 2,
                                  message: "Giá trị phải có ít nhất 2 ký tự",
                                },
                                maxLength: {
                                  value: 50,
                                  message:
                                    "Giá trị không được vượt quá 50 ký tự",
                                },
                                validate: {
                                  notOnlyWhitespace: (value) =>
                                    value.trim().length > 0 ||
                                    "Giá trị không được chỉ chứa khoảng trắng",
                                },
                              })}
                              placeholder="Giá trị thuộc tính"
                              className={`w-full px-3 py-2 border rounded-sm ${
                                errors.attributes?.[attrIndex]?.value
                                  ? "border-red-600"
                                  : "border-gray-300"
                              }`}
                              disabled={isLoading}
                              onChange={(e) => {
                                register(
                                  `attributes[${attrIndex}].value`
                                ).onChange(e);
                                if (e.target.value.trim())
                                  clearErrors(`attributes[${attrIndex}].value`);
                              }}
                            />
                            {errors.attributes?.[attrIndex]?.value && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.attributes[attrIndex].value.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {errors.attributes && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.attributes.message}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => appendAttribute({ code: "", value: "" })}
                  className="text-blue-500 hover:text-blue-600 flex items-center cursor-pointer mt-4"
                  disabled={isLoading}
                >
                  <Plus className="w-4 h-4 mr-2" /> Thêm thuộc tính
                </button>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thông số kỹ thuật <span className="text-red-500">*</span>
                </label>
                {specificationsFields.length > 1 ? (
                  <DragDropContext onDragEnd={handleSpecificationDragEnd}>
                    <Droppable
                      droppableId="specifications"
                      direction="vertical"
                    >
                      {(provided) => (
                        <div
                          className="space-y-4"
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {specificationsFields.map((field, index) => (
                            <Draggable
                              key={field.id}
                              draggableId={`specification-${field.id}`}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`cursor-move ${
                                    snapshot.isDragging
                                      ? "shadow-lg opacity-80"
                                      : ""
                                  }`}
                                >
                                  <SpecificationGroup
                                    index={index}
                                    control={control}
                                    register={register}
                                    errors={errors}
                                    isLoading={isLoading}
                                    removeSpecification={removeSpecification}
                                    specificationsFields={specificationsFields}
                                    clearErrors={clearErrors}
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
                    {specificationsFields.map((field, index) => (
                      <div key={field.id}>
                        <SpecificationGroup
                          index={index}
                          control={control}
                          register={register}
                          errors={errors}
                          isLoading={isLoading}
                          removeSpecification={removeSpecification}
                          specificationsFields={specificationsFields}
                          clearErrors={clearErrors}
                        />
                      </div>
                    ))}
                  </div>
                )}
                {errors.specifications && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.specifications.message}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() =>
                    appendSpecification({
                      group: "",
                      items: [{ label: "", value: "" }],
                    })
                  }
                  className="text-blue-500 hover:text-blue-600 flex items-center cursor-pointer mt-4"
                  disabled={isLoading}
                >
                  <Plus className="w-4 h-4 mr-2" /> Thêm nhóm thông số
                </button>
              </div>

              <div className="mt-6">
                <h4 className="text-md font-medium mb-4">Thông tin kho hàng</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giá bán lẻ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={retailPriceDisplay}
                        placeholder="Giá bán lẻ"
                        {...register("retailPrice", {
                          required: "Giá bán lẻ là bắt buộc",
                          validate: (value) => {
                            const rawValue = parseNumber(value);
                            return (
                              (!isNaN(Number.parseFloat(rawValue)) &&
                                Number.parseFloat(rawValue) > 0) ||
                              "Giá bán lẻ phải là số lớn hơn 0"
                            );
                          },
                        })}
                        className={`w-full px-3 py-2 border rounded-sm ${
                          errors.retailPrice
                            ? "border-red-600"
                            : "border-gray-300"
                        }`}
                        disabled={isLoading}
                        onKeyDown={(e) => {
                          if (
                            e.key === "-" ||
                            e.key === "+" ||
                            e.key === "e" ||
                            e.key === "E"
                          ) {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          let value = e.target.value.replace(/[^0-9.]/g, "");
                          const parts = value.split(".");
                          if (parts.length > 2)
                            value = parts[0] + "." + parts.slice(1).join("");
                          const rawValue = parseNumber(value);
                          setRetailPriceDisplay(formatNumber(rawValue));
                          setValue("retailPrice", rawValue, {
                            shouldValidate: true,
                          });
                        }}
                        onBlur={(e) => {
                          const rawValue = parseNumber(e.target.value);
                          if (rawValue) {
                            const formattedValue = formatNumber(
                              Number.parseFloat(rawValue).toString()
                            );
                            setRetailPriceDisplay(formattedValue);
                            setValue("retailPrice", rawValue, {
                              shouldValidate: true,
                            });
                          } else {
                            setRetailPriceDisplay("");
                            setValue("retailPrice", "", {
                              shouldValidate: true,
                            });
                          }
                        }}
                      />
                      {errors.retailPrice && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.retailPrice.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giá nhập <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={purchasePriceDisplay}
                        placeholder="Giá nhập"
                        {...register("purchasePrice", {
                          required: "Giá nhập là bắt buộc",
                          validate: (value) => {
                            const rawValue = parseNumber(value);
                            return (
                              (!isNaN(Number.parseFloat(rawValue)) &&
                                Number.parseFloat(rawValue) > 0) ||
                              "Giá nhập phải là số lớn hơn 0"
                            );
                          },
                        })}
                        className={`w-full px-3 py-2 border rounded-sm ${
                          errors.purchasePrice
                            ? "border-red-600"
                            : "border-gray-300"
                        }`}
                        disabled={isLoading}
                        onKeyDown={(e) => {
                          if (
                            e.key === "-" ||
                            e.key === "+" ||
                            e.key === "e" ||
                            e.key === "E"
                          ) {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          let value = e.target.value.replace(/[^0-9.]/g, "");
                          const parts = value.split(".");
                          if (parts.length > 2)
                            value = parts[0] + "." + parts.slice(1).join("");
                          const rawValue = parseNumber(value);
                          setPurchasePriceDisplay(formatNumber(rawValue));
                          setValue("purchasePrice", rawValue, {
                            shouldValidate: true,
                          });
                        }}
                        onBlur={(e) => {
                          const rawValue = parseNumber(e.target.value);
                          if (rawValue) {
                            const formattedValue = formatNumber(
                              Number.parseFloat(rawValue).toString()
                            );
                            setPurchasePriceDisplay(formattedValue);
                            setValue("purchasePrice", rawValue, {
                              shouldValidate: true,
                            });
                          } else {
                            setPurchasePriceDisplay("");
                            setValue("purchasePrice", "", {
                              shouldValidate: true,
                            });
                          }
                        }}
                      />
                      {errors.purchasePrice && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.purchasePrice.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tồn kho ban đầu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={initialStockDisplay}
                        placeholder="Tồn kho ban đầu"
                        {...register("initialStock", {
                          required: "Tồn kho ban đầu là bắt buộc",
                          validate: (value) => {
                            const rawValue = parseNumber(value);
                            return (
                              (!isNaN(Number.parseInt(rawValue)) &&
                                Number.parseInt(rawValue) >= 0) ||
                              "Tồn kho ban đầu phải là số nguyên không âm"
                            );
                          },
                        })}
                        className={`w-full px-3 py-2 border rounded-sm ${
                          errors.initialStock
                            ? "border-red-600"
                            : "border-gray-300"
                        }`}
                        disabled={isLoading}
                        onKeyDown={(e) => {
                          if (
                            e.key === "-" ||
                            e.key === "+" ||
                            e.key === "." ||
                            e.key === "e" ||
                            e.key === "E"
                          ) {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          let value = e.target.value.replace(/[^0-9]/g, "");
                          const rawValue = parseNumber(value);
                          setInitialStockDisplay(formatNumber(rawValue));
                          setValue("initialStock", rawValue, {
                            shouldValidate: true,
                          });
                        }}
                        onBlur={(e) => {
                          const rawValue = parseNumber(e.target.value);
                          if (rawValue) {
                            const formattedValue = formatNumber(
                              Number.parseInt(rawValue).toString()
                            );
                            setInitialStockDisplay(formattedValue);
                            setValue("initialStock", rawValue, {
                              shouldValidate: true,
                            });
                          } else {
                            setInitialStockDisplay("");
                            setValue("initialStock", "", {
                              shouldValidate: true,
                            });
                          }
                        }}
                      />
                      {errors.initialStock && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.initialStock.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <CustomSelect
                      name="supplierId"
                      options={supplierOptions}
                      label="Nhà cung cấp"
                      placeholder="Chọn nhà cung cấp"
                      value={watch("supplierId")}
                      onChange={(value) => {
                        setValue("supplierId", value, { shouldValidate: true });
                        if (value) clearErrors("supplierId");
                      }}
                      disabled={isLoading || loadingOptions}
                      withSearch={true}
                      error={errors.supplierId}
                      register={register("supplierId", {
                        required: "Nhà cung cấp là bắt buộc",
                        pattern: {
                          value: objectIdRegex,
                          message: "Nhà cung cấp ID phải là ObjectId hợp lệ",
                        },
                      })}
                    />
                    <CustomSelect
                      name="branchId"
                      options={branchOptions}
                      label="Chi nhánh"
                      placeholder="Chọn chi nhánh"
                      value={watch("branchId")}
                      onChange={(value) => {
                        setValue("branchId", value, { shouldValidate: true });
                        if (value) clearErrors("branchId");
                      }}
                      disabled={isLoading || loadingOptions}
                      withSearch={true}
                      error={errors.branchId}
                      register={register("branchId", {
                        required: "Chi nhánh là bắt buộc",
                        pattern: {
                          value: objectIdRegex,
                          message: "Chi nhánh ID phải là ObjectId hợp lệ",
                        },
                      })}
                    />
                  </div>
                </div>
              </div>

              {errors.form && (
                <p className="text-red-500 text-sm mt-4">
                  {errors.form.message}
                </p>
              )}

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
                      <Plus className="w-4 h-4 mr-2" />
                      THÊM
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
    </FormProvider>
  );
};

export default CreateProductItem;