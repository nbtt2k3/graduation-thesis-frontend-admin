"use client";

import { useState, useEffect } from "react";
import { Trash2, Plus, Upload } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import CustomSelect from "../../CustomSelect/CustomSelect";

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
  itemIndex,
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
    name: `productItems[${itemIndex}].specifications[${index}].items`,
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Nhóm</label>
        <input
          {...register(
            `productItems[${itemIndex}].specifications[${index}].group`,
            {
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
            }
          )}
          placeholder="Tên nhóm"
          className={`w-full px-3 py-2 border rounded-sm ${
            errors.productItems?.[itemIndex]?.specifications?.[index]?.group
              ? "border-red-500"
              : "border-gray-300"
          }`}
          disabled={isLoading}
          onChange={(e) => {
            register(
              `productItems[${itemIndex}].specifications[${index}].group`
            ).onChange(e);
            if (e.target.value.trim()) {
              clearErrors(
                `productItems[${itemIndex}].specifications[${index}].group`
              );
            }
          }}
        />
        {errors.productItems?.[itemIndex]?.specifications?.[index]?.group && (
          <p className="text-red-500 text-sm mt-1">
            {errors.productItems[itemIndex].specifications[index].group.message}
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mục thông số
        </label>
        {items.length > 1 ? (
          <DragDropContext onDragEnd={handleSpecItemDragEnd}>
            <Droppable
              droppableId={`spec-items-${itemIndex}-${index}`}
              direction="vertical"
            >
              {(provided) => (
                <div
                  className="space-y-2"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {items.map((item, specItemIndex) => (
                    <Draggable
                      key={item.id}
                      draggableId={`spec-item-${itemIndex}-${index}-${item.id}`}
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
                                  `productItems[${itemIndex}].specifications[${index}].items[${specItemIndex}].label`,
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
                                  errors.productItems?.[itemIndex]
                                    ?.specifications?.[index]?.items?.[
                                    specItemIndex
                                  ]?.label
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                                disabled={isLoading}
                                onChange={(e) => {
                                  register(
                                    `productItems[${itemIndex}].specifications[${index}].items[${specItemIndex}].label`
                                  ).onChange(e);
                                  if (e.target.value.trim()) {
                                    clearErrors(
                                      `productItems[${itemIndex}].specifications[${index}].items[${specItemIndex}].label`
                                    );
                                  }
                                }}
                              />
                              {errors.productItems?.[itemIndex]?.specifications?.[
                                index
                              ]?.items?.[specItemIndex]?.label && (
                                <p className="text-red-500 text-sm mt-1">
                                  {
                                    errors.productItems[itemIndex].specifications[
                                      index
                                    ].items[specItemIndex].label.message
                                  }
                                </p>
                              )}
                            </div>
                            <div className="w-1/2">
                              <input
                                {...register(
                                  `productItems[${itemIndex}].specifications[${index}].items[${specItemIndex}].value`,
                                  {
                                    required: "Giá trị là bắt buộc",
                                    minLength: {
                                      value: 2,
                                      message: "Giá trị phải có ít nhất 2 ký tự",
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
                                  errors.productItems?.[itemIndex]
                                    ?.specifications?.[index]?.items?.[
                                    specItemIndex
                                  ]?.value
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                                disabled={isLoading}
                                onChange={(e) => {
                                  register(
                                    `productItems[${itemIndex}].specifications[${index}].items[${specItemIndex}].value`
                                  ).onChange(e);
                                  if (e.target.value.trim()) {
                                    clearErrors(
                                      `productItems[${itemIndex}].specifications[${index}].items[${specItemIndex}].value`
                                    );
                                  }
                                }}
                              />
                              {errors.productItems?.[itemIndex]?.specifications?.[
                                index
                              ]?.items?.[specItemIndex]?.value && (
                                <p className="text-red-500 text-sm mt-1">
                                  {
                                    errors.productItems[itemIndex].specifications[
                                      index
                                    ].items[specItemIndex].value.message
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
                        `productItems[${itemIndex}].specifications[${index}].items[${specItemIndex}].label`,
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
                        errors.productItems?.[itemIndex]?.specifications?.[index]
                          ?.items?.[specItemIndex]?.label
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      disabled={isLoading}
                      onChange={(e) => {
                        register(
                          `productItems[${itemIndex}].specifications[${index}].items[${specItemIndex}].label`
                        ).onChange(e);
                        if (e.target.value.trim()) {
                          clearErrors(
                            `productItems[${itemIndex}].specifications[${index}].items[${specItemIndex}].label`
                          );
                        }
                      }}
                    />
                    {errors.productItems?.[itemIndex]?.specifications?.[index]
                      ?.items?.[specItemIndex]?.label && (
                      <p className="text-red-500 text-sm mt-1">
                        {
                          errors.productItems[itemIndex].specifications[index]
                            .items[specItemIndex].label.message
                        }
                      </p>
                    )}
                  </div>
                  <div className="w-1/2">
                    <input
                      {...register(
                        `productItems[${itemIndex}].specifications[${index}].items[${specItemIndex}].value`,
                        {
                          required: "Giá trị là bắt buộc",
                          minLength: {
                            value: 2,
                            message: "Giá trị phải có ít nhất 2 ký tự",
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
                        errors.productItems?.[itemIndex]?.specifications?.[index]
                          ?.items?.[specItemIndex]?.value
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      disabled={isLoading}
                      onChange={(e) => {
                        register(
                          `productItems[${itemIndex}].specifications[${index}].items[${specItemIndex}].value`
                        ).onChange(e);
                        if (e.target.value.trim()) {
                          clearErrors(
                            `productItems[${itemIndex}].specifications[${index}].items[${specItemIndex}].value`
                          );
                        }
                      }}
                    />
                    {errors.productItems?.[itemIndex]?.specifications?.[index]
                      ?.items?.[specItemIndex]?.value && (
                      <p className="text-red-500 text-sm mt-1">
                        {
                          errors.productItems[itemIndex].specifications[index]
                            .items[specItemIndex].value.message
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

const CreateProductItemForm = ({
  itemIndex,
  control,
  register,
  errors,
  isLoading,
  removeProductItem,
  productItemsPreviews,
  setProductItemsPreviews,
  handleProductItemThumbChange,
  handleProductItemImageChange,
  setValue,
  setError,
  clearErrors,
  productItemsFields,
  suppliers,
  branches,
  watch,
  getValues,
}) => {
  const {
    fields: attributes,
    append: appendAttribute,
    remove: removeAttribute,
    move: moveAttribute,
  } = useFieldArray({
    control,
    name: `productItems[${itemIndex}].attributes`,
  });
  const {
    fields: specificationsFields,
    append: appendSpecification,
    remove: removeSpecification,
    move: moveSpecification,
  } = useFieldArray({
    control,
    name: `productItems[${itemIndex}].specifications`,
  });

  const [retailPriceDisplay, setRetailPriceDisplay] = useState("");
  const [purchasePriceDisplay, setPurchasePriceDisplay] = useState("");
  const [initialStockDisplay, setInitialStockDisplay] = useState("");

  useEffect(() => {
    const retailPrice =
      control._formValues.productItems[itemIndex]?.retailPrice || "";
    const purchasePrice =
      control._formValues.productItems[itemIndex]?.purchasePrice || "";
    const initialStock =
      control._formValues.productItems[itemIndex]?.initialStock || "";
    setRetailPriceDisplay(formatNumber(retailPrice));
    setPurchasePriceDisplay(formatNumber(purchasePrice));
    setInitialStockDisplay(formatNumber(initialStock));
  }, [control._formValues.productItems[itemIndex], itemIndex]);

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

  const handleAttributeDragEnd = (result) => {
    if (!result.destination) return;
    moveAttribute(result.source.index, result.destination.index);
  };

  const handleSpecificationDragEnd = (result) => {
    if (!result.destination) return;
    moveSpecification(result.source.index, result.destination.index);
  };

  const handleImageDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedImages = Array.from(
      productItemsPreviews[itemIndex]?.images || []
    );
    const reorderedFormImages = Array.from(
      getValues(`productItems[${itemIndex}].images`) || []
    );

    const [removedImage] = reorderedImages.splice(result.source.index, 1);
    reorderedImages.splice(result.destination.index, 0, removedImage);

    const [removedFormImage] = reorderedFormImages.splice(
      result.source.index,
      1
    );
    reorderedFormImages.splice(result.destination.index, 0, removedFormImage);

    setProductItemsPreviews((prev) => {
      const newPreviews = [...prev];
      newPreviews[itemIndex] = {
        ...newPreviews[itemIndex],
        images: reorderedImages,
      };
      return newPreviews;
    });
    setValue(`productItems[${itemIndex}].images`, reorderedFormImages);
  };

  const statusOptions = [
    { value: "active", label: "Hoạt động" },
    { value: "inactive", label: "Không hoạt động" },
    { value: "out_of_stock", label: "Hết hàng" },
  ];

  const supplierOptions = suppliers.map((supplier) => ({
    value: supplier._id,
    label: supplier.name,
  }));

  const branchOptions = branches.map((branch) => ({
    value: branch._id,
    label: branch.name,
  }));

  return (
    <div className="mb-6 border border-gray-300 p-6 rounded-sm">
      <div className="flex justify-between items-center mb-4">
        <span className="text-md font-medium">
          Mục sản phẩm {itemIndex + 1}
        </span>
        {productItemsFields.length > 1 && (
          <button
            type="button"
            onClick={() => {
              removeProductItem(itemIndex);
              setProductItemsPreviews((prev) =>
                prev.filter((_, i) => i !== itemIndex)
              );
            }}
            className="text-white bg-red-500 hover:bg-red-600 p-1 rounded-sm cursor-pointer"
            disabled={isLoading}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>
      <div className="mb-6">
        <h4 className="text-md font-medium mb-4">Thông tin mục sản phẩm</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên mục <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register(`productItems[${itemIndex}].name`, {
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
                  errors.productItems?.[itemIndex]?.name
                    ? "border-red-600"
                    : "border-gray-300"
                }`}
                disabled={isLoading}
                onChange={(e) => {
                  register(`productItems[${itemIndex}].name`).onChange(e);
                  if (e.target.value.trim())
                    clearErrors(`productItems[${itemIndex}].name`);
                }}
              />
              {errors.productItems?.[itemIndex]?.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.productItems[itemIndex].name.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Barcode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register(`productItems[${itemIndex}].barcode`, {
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
                  errors.productItems?.[itemIndex]?.barcode
                    ? "border-red-600"
                    : "border-gray-300"
                }`}
                disabled={isLoading}
                onChange={(e) => {
                  register(`productItems[${itemIndex}].barcode`).onChange(e);
                  if (e.target.value.trim())
                    clearErrors(`productItems[${itemIndex}].barcode`);
                }}
              />
              {errors.productItems?.[itemIndex]?.barcode && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.productItems[itemIndex].barcode.message}
                </p>
              )}
            </div>
            <CustomSelect
              name={`productItems[${itemIndex}].status`}
              options={statusOptions}
              label="Trạng thái"
              placeholder="Chọn trạng thái"
              value={watch(`productItems[${itemIndex}].status`)}
              onChange={(value) => {
                setValue(`productItems[${itemIndex}].status`, value, {
                  shouldValidate: true,
                });
                if (value) clearErrors(`productItems[${itemIndex}].status`);
              }}
              disabled={isLoading}
              withSearch={false}
              error={errors.productItems?.[itemIndex]?.status}
              register={register(`productItems[${itemIndex}].status`, {
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
                  errors.productItems?.[itemIndex]?.thumb
                    ? "border-red-600"
                    : "border-gray-300"
                }`}
              >
                {productItemsPreviews[itemIndex]?.thumb ? (
                  <div className="relative">
                    <img
                      src={
                        productItemsPreviews[itemIndex].thumb ||
                        "/placeholder.svg"
                      }
                      alt="Thumbnail"
                      className="mx-auto max-w-full max-h-48 object-contain rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setProductItemsPreviews((prev) => {
                          const newPreviews = [...prev];
                          newPreviews[itemIndex] = {
                            ...newPreviews[itemIndex],
                            thumb: "",
                          };
                          return newPreviews;
                        });
                        setValue(`productItems[${itemIndex}].thumb`, null);
                        setError(`productItems[${itemIndex}].thumb`, {
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
                      htmlFor={`item-thumb-${itemIndex}`}
                      className="cursor-pointer"
                    >
                      <span className="bg-blue-500 text-white px-4 py-2 rounded-sm hover:bg-blue-600 inline-block">
                        Chọn ảnh
                      </span>
                      <input
                        id={`item-thumb-${itemIndex}`}
                        type="file"
                        accept="image/png,image/jpeg,image/gif"
                        onChange={(e) =>
                          handleProductItemThumbChange(itemIndex, e)
                        }
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
              {errors.productItems?.[itemIndex]?.thumb && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.productItems[itemIndex].thumb.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình ảnh bổ sung <span className="text-red-500">*</span>
              </label>
              <div
                className={`border-2 border-dashed rounded-sm p-6 text-center ${
                  errors.productItems?.[itemIndex]?.images
                    ? "border-red-600"
                    : "border-gray-300"
                }`}
              >
                <div className="mb-4">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <label
                    htmlFor={`item-images-${itemIndex}`}
                    className="cursor-pointer"
                  >
                    <span className="bg-blue-500 text-white px-4 py-2 rounded-sm hover:bg-blue-600 inline-block">
                      Chọn nhiều ảnh
                    </span>
                    <input
                      id={`item-images-${itemIndex}`}
                      type="file"
                      accept="image/png,image/jpeg,image/gif"
                      multiple
                      onChange={(e) =>
                        handleProductItemImageChange(itemIndex, e)
                      }
                      className="hidden"
                      disabled={isLoading}
                    />
                  </label>
                  <div className="text-gray-400 text-sm mt-2">
                    PNG, JPG, GIF tối đa 10MB mỗi ảnh
                  </div>
                </div>
                {productItemsPreviews[itemIndex]?.images?.some(
                  (img) => img
                ) && (
                  productItemsPreviews[itemIndex].images.filter((img) => img).length > 1 ? (
                    <DragDropContext onDragEnd={handleImageDragEnd}>
                      <Droppable
                        droppableId={`item-images-${itemIndex}`}
                        direction="vertical"
                      >
                        {(provided) => (
                          <div
                            className="flex flex-col gap-4 max-w-full overflow-x-hidden"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            {productItemsPreviews[itemIndex].images.map(
                              (img, imageIndex) =>
                                img && (
                                  <Draggable
                                    key={`item-image-${itemIndex}-${imageIndex}`}
                                    draggableId={`item-image-${itemIndex}-${imageIndex}`}
                                    index={imageIndex}
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
                                          ...provided.draggableProps.style,
                                        }}
                                      >
                                        <img
                                          src={img || "/placeholder.svg"}
                                          alt={`Image ${imageIndex}`}
                                          className="w-full h-full object-contain rounded border border-gray-300 p-2"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setProductItemsPreviews((prev) => {
                                              const newPreviews = [...prev];
                                              newPreviews[itemIndex].images =
                                                newPreviews[
                                                  itemIndex
                                                ].images.filter(
                                                  (_, i) => i !== imageIndex
                                                );
                                              return newPreviews;
                                            });
                                            const newImages = getValues(
                                              `productItems[${itemIndex}].images`
                                            ).filter((_, i) => i !== imageIndex);
                                            setValue(
                                              `productItems[${itemIndex}].images`,
                                              newImages
                                            );
                                            if (newImages.length === 0) {
                                              setError(
                                                `productItems[${itemIndex}].images`,
                                                {
                                                  message:
                                                    "Ít nhất một hình ảnh bổ sung là bắt buộc",
                                                }
                                              );
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
                      {productItemsPreviews[itemIndex].images.map(
                        (img, imageIndex) =>
                          img && (
                            <div
                              key={`item-image-${itemIndex}-${imageIndex}`}
                              className="relative bg-white p-2 rounded-sm"
                              style={{ width: "100%", height: "200px" }}
                            >
                              <img
                                src={img || "/placeholder.svg"}
                                alt={`Image ${imageIndex}`}
                                className="w-full h-full object-contain rounded border border-gray-300 p-2"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setProductItemsPreviews((prev) => {
                                    const newPreviews = [...prev];
                                    newPreviews[itemIndex].images =
                                      newPreviews[itemIndex].images.filter(
                                        (_, i) => i !== imageIndex
                                      );
                                    return newPreviews;
                                  });
                                  const newImages = getValues(
                                    `productItems[${itemIndex}].images`
                                  ).filter((_, i) => i !== imageIndex);
                                  setValue(
                                    `productItems[${itemIndex}].images`,
                                    newImages
                                  );
                                  if (newImages.length === 0) {
                                    setError(
                                      `productItems[${itemIndex}].images`,
                                      {
                                        message:
                                          "Ít nhất một hình ảnh bổ sung là bắt buộc",
                                      }
                                    );
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
                  )
                )}
              </div>
              {errors.productItems?.[itemIndex]?.images && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.productItems[itemIndex].images.message}
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
              <Droppable
                droppableId={`attributes-${itemIndex}`}
                direction="vertical"
              >
                {(provided) => (
                  <div
                    className="space-y-4"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {attributes.map((attr, attrIndex) => (
                      <Draggable
                        key={attr.id}
                        draggableId={`attribute-${itemIndex}-${attr.id}`}
                        index={attrIndex}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`mb-4 border border-gray-300 p-4 rounded-sm cursor-move ${
                              snapshot.isDragging ? "shadow-lg opacity-80" : ""
                            }`}
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
                                  {...register(
                                    `productItems[${itemIndex}].attributes[${attrIndex}].code`,
                                    {
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
                                    }
                                  )}
                                  placeholder="Mã thuộc tính"
                                  className={`w-full px-3 py-2 border rounded-sm ${
                                    errors.productItems?.[itemIndex]?.attributes?.[
                                      attrIndex
                                    ]?.code
                                      ? "border-red-600"
                                      : "border-gray-300"
                                  }`}
                                  disabled={isLoading}
                                  onChange={(e) => {
                                    register(
                                      `productItems[${itemIndex}].attributes[${attrIndex}].code`
                                    ).onChange(e);
                                    if (e.target.value.trim())
                                      clearErrors(
                                        `productItems[${itemIndex}].attributes[${attrIndex}].code`
                                      );
                                  }}
                                />
                                {errors.productItems?.[itemIndex]?.attributes?.[
                                  attrIndex
                                ]?.code && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {
                                      errors.productItems[itemIndex].attributes[
                                        attrIndex
                                      ].code.message
                                    }
                                  </p>
                                )}
                              </div>
                              <div className="w-1/2">
                                <input
                                  type="text"
                                  {...register(
                                    `productItems[${itemIndex}].attributes[${attrIndex}].value`,
                                    {
                                      required: "Giá trị là bắt buộc",
                                      minLength: {
                                        value: 2,
                                        message:
                                          "Giá trị phải có ít nhất 2 ký tự",
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
                                    errors.productItems?.[itemIndex]?.attributes?.[
                                      attrIndex
                                    ]?.value
                                      ? "border-red-600"
                                      : "border-gray-300"
                                  }`}
                                  disabled={isLoading}
                                  onChange={(e) => {
                                    register(
                                      `productItems[${itemIndex}].attributes[${attrIndex}].value`
                                    ).onChange(e);
                                    if (e.target.value.trim())
                                      clearErrors(
                                        `productItems[${itemIndex}].attributes[${attrIndex}].value`
                                      );
                                  }}
                                />
                                {errors.productItems?.[itemIndex]?.attributes?.[
                                  attrIndex
                                ]?.value && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {
                                      errors.productItems[itemIndex].attributes[
                                        attrIndex
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
                        {...register(
                          `productItems[${itemIndex}].attributes[${attrIndex}].code`,
                          {
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
                          }
                        )}
                        placeholder="Mã thuộc tính"
                        className={`w-full px-3 py-2 border rounded-sm ${
                          errors.productItems?.[itemIndex]?.attributes?.[
                            attrIndex
                          ]?.code
                            ? "border-red-600"
                            : "border-gray-300"
                        }`}
                        disabled={isLoading}
                        onChange={(e) => {
                          register(
                            `productItems[${itemIndex}].attributes[${attrIndex}].code`
                          ).onChange(e);
                          if (e.target.value.trim())
                            clearErrors(
                              `productItems[${itemIndex}].attributes[${attrIndex}].code`
                            );
                        }}
                      />
                      {errors.productItems?.[itemIndex]?.attributes?.[attrIndex]
                        ?.code && (
                        <p className="text-red-500 text-sm mt-1">
                          {
                            errors.productItems[itemIndex].attributes[attrIndex]
                              .code.message
                          }
                        </p>
                      )}
                    </div>
                    <div className="w-1/2">
                      <input
                        type="text"
                        {...register(
                          `productItems[${itemIndex}].attributes[${attrIndex}].value`,
                          {
                            required: "Giá trị là bắt buộc",
                            minLength: {
                              value: 2,
                              message: "Giá trị phải có ít nhất 2 ký tự",
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
                          errors.productItems?.[itemIndex]?.attributes?.[
                            attrIndex
                          ]?.value
                            ? "border-red-600"
                            : "border-gray-300"
                        }`}
                        disabled={isLoading}
                        onChange={(e) => {
                          register(
                            `productItems[${itemIndex}].attributes[${attrIndex}].value`
                          ).onChange(e);
                          if (e.target.value.trim())
                            clearErrors(
                              `productItems[${itemIndex}].attributes[${attrIndex}].value`
                            );
                        }}
                      />
                      {errors.productItems?.[itemIndex]?.attributes?.[attrIndex]
                        ?.value && (
                        <p className="text-red-500 text-sm mt-1">
                          {
                            errors.productItems[itemIndex].attributes[attrIndex]
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
          {errors.productItems?.[itemIndex]?.attributes && (
            <p className="text-red-500 text-sm mt-1">
              {errors.productItems[itemIndex].attributes.message}
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
                droppableId={`specifications-${itemIndex}`}
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
                        draggableId={`specification-${itemIndex}-${field.id}`}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`cursor-move ${
                              snapshot.isDragging ? "shadow-lg opacity-80" : ""
                            }`}
                          >
                            <SpecificationGroup
                              index={index}
                              itemIndex={itemIndex}
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
                    itemIndex={itemIndex}
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
          {errors.productItems?.[itemIndex]?.specifications && (
            <p className="text-red-500 text-sm mt-1">
              {errors.productItems[itemIndex].specifications.message}
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
                  {...register(`productItems[${itemIndex}].retailPrice`, {
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
                    errors.productItems?.[itemIndex]?.retailPrice
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
                    let value = e.target.value;
                    value = value.replace(/[^0-9.]/g, "");
                    const parts = value.split(".");
                    if (parts.length > 2) {
                      value = parts[0] + "." + parts.slice(1).join("");
                    }
                    const rawValue = parseNumber(value);
                    setRetailPriceDisplay(formatNumber(rawValue));
                    setValue(
                      `productItems[${itemIndex}].retailPrice`,
                      rawValue,
                      { shouldValidate: true }
                    );
                    if (
                      rawValue &&
                      !isNaN(Number.parseFloat(rawValue)) &&
                      Number.parseFloat(rawValue) > 0
                    ) {
                      clearErrors(`productItems[${itemIndex}].retailPrice`);
                    }
                  }}
                  onBlur={(e) => {
                    const rawValue = parseNumber(e.target.value);
                    if (rawValue) {
                      const formattedValue = formatNumber(
                        Number.parseFloat(rawValue).toString()
                      );
                      setRetailPriceDisplay(formattedValue);
                      setValue(
                        `productItems[${itemIndex}].retailPrice`,
                        rawValue,
                        { shouldValidate: true }
                      );
                    } else {
                      setRetailPriceDisplay("");
                      setValue(`productItems[${itemIndex}].retailPrice`, "", {
                        shouldValidate: true,
                      });
                    }
                  }}
                />
                {errors.productItems?.[itemIndex]?.retailPrice && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.productItems[itemIndex].retailPrice.message}
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
                  {...register(`productItems[${itemIndex}].purchasePrice`, {
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
                    errors.productItems?.[itemIndex]?.purchasePrice
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
                    let value = e.target.value;
                    value = value.replace(/[^0-9.]/g, "");
                    const parts = value.split(".");
                    if (parts.length > 2) {
                      value = parts[0] + "." + parts.slice(1).join("");
                    }
                    const rawValue = parseNumber(value);
                    setPurchasePriceDisplay(formatNumber(rawValue));
                    setValue(
                      `productItems[${itemIndex}].purchasePrice`,
                      rawValue,
                      { shouldValidate: true }
                    );
                    if (
                      rawValue &&
                      !isNaN(Number.parseFloat(rawValue)) &&
                      Number.parseFloat(rawValue) > 0
                    ) {
                      clearErrors(`productItems[${itemIndex}].purchasePrice`);
                    }
                  }}
                  onBlur={(e) => {
                    const rawValue = parseNumber(e.target.value);
                    if (rawValue) {
                      const formattedValue = formatNumber(
                        Number.parseFloat(rawValue).toString()
                      );
                      setPurchasePriceDisplay(formattedValue);
                      setValue(
                        `productItems[${itemIndex}].purchasePrice`,
                        rawValue,
                        { shouldValidate: true }
                      );
                    } else {
                      setPurchasePriceDisplay("");
                      setValue(`productItems[${itemIndex}].purchasePrice`, "", {
                        shouldValidate: true,
                      });
                    }
                  }}
                />
                {errors.productItems?.[itemIndex]?.purchasePrice && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.productItems[itemIndex].purchasePrice.message}
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
                  {...register(`productItems[${itemIndex}].initialStock`, {
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
                    errors.productItems?.[itemIndex]?.initialStock
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
                    let value = e.target.value;
                    value = value.replace(/[^0-9]/g, "");
                    const rawValue = parseNumber(value);
                    setInitialStockDisplay(formatNumber(rawValue));
                    setValue(
                      `productItems[${itemIndex}].initialStock`,
                      rawValue,
                      { shouldValidate: true }
                    );
                    if (
                      rawValue &&
                      !isNaN(Number.parseInt(rawValue)) &&
                      Number.parseInt(rawValue) >= 0
                    ) {
                      clearErrors(`productItems[${itemIndex}].initialStock`);
                    }
                  }}
                  onBlur={(e) => {
                    const rawValue = parseNumber(e.target.value);
                    if (rawValue) {
                      const formattedValue = formatNumber(
                        Number.parseInt(rawValue).toString()
                      );
                      setInitialStockDisplay(formattedValue);
                      setValue(
                        `productItems[${itemIndex}].initialStock`,
                        rawValue,
                        { shouldValidate: true }
                      );
                    } else {
                      setInitialStockDisplay("");
                      setValue(`productItems[${itemIndex}].initialStock`, "", {
                        shouldValidate: true,
                      });
                    }
                  }}
                />
                {errors.productItems?.[itemIndex]?.initialStock && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.productItems[itemIndex].initialStock.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-6">
              <CustomSelect
                name={`productItems[${itemIndex}].supplier`}
                options={supplierOptions}
                label="Nhà cung cấp"
                placeholder="Chọn nhà cung cấp"
                value={watch(`productItems[${itemIndex}].supplier`)}
                onChange={(value) => {
                  setValue(`productItems[${itemIndex}].supplier`, value, {
                    shouldValidate: true,
                  });
                  if (value) clearErrors(`productItems[${itemIndex}].supplier`);
                }}
                disabled={isLoading}
                withSearch={true}
                error={errors.productItems?.[itemIndex]?.supplier}
                register={register(`productItems[${itemIndex}].supplier`, {
                  required: "Nhà cung cấp là bắt buộc",
                  pattern: {
                    value: objectIdRegex,
                    message: "Nhà cung cấp ID phải là ObjectId hợp lệ",
                  },
                })}
              />
              <CustomSelect
                name={`productItems[${itemIndex}].branch`}
                options={branchOptions}
                label="Chi nhánh"
                placeholder="Chọn chi nhánh"
                value={watch(`productItems[${itemIndex}].branch`)}
                onChange={(value) => {
                  setValue(`productItems[${itemIndex}].branch`, value, {
                    shouldValidate: true,
                  });
                  if (value) clearErrors(`productItems[${itemIndex}].branch`);
                }}
                disabled={isLoading}
                withSearch={true}
                error={errors.productItems?.[itemIndex]?.branch}
                register={register(`productItems[${itemIndex}].branch`, {
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
      </div>
    </div>
  );
};

export default CreateProductItemForm;