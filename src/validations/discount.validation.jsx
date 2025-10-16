import * as yup from "yup";

const DISCOUNT_TYPES = ["percentage", "fixed"];
const PERCENTAGE = "percentage";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const MAX_NUMBER = Number.MAX_SAFE_INTEGER;

const now = new Date();
now.setHours(0, 0, 0, 0);

const tomorrow = new Date(now);
tomorrow.setDate(tomorrow.getDate() + 1);

const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const createDiscountValidation = yup.object().shape({
  name: yup
    .string()
    .trim()
    .min(2, "Tên discount phải có ít nhất ${min} ký tự")
    .max(100, "Tên discount không được vượt quá ${max} ký tự")
    .required("Tên discount là bắt buộc")
    .typeError("Tên discount phải là chuỗi"),

  description: yup
    .string()
    .trim()
    .min(10, "Mô tả phải có ít nhất ${min} ký tự")
    .required("Mô tả là bắt buộc")
    .typeError("Mô tả phải là chuỗi"),

  type: yup
    .string()
    .oneOf(
      DISCOUNT_TYPES,
      `Loại giảm giá chỉ được là: ${DISCOUNT_TYPES.join(", ")}`
    )
    .required("Loại giảm giá là bắt buộc")
    .typeError("Loại giảm giá phải là chuỗi"),

  value: yup
    .number()
    .positive("Giá trị giảm phải lớn hơn 0")
    .max(MAX_NUMBER, "Giá trị giảm không được vượt quá 16 chữ số")
    .required("Giá trị giảm là bắt buộc")
    .typeError("Giá trị giảm phải là số")
    .when("type", {
      is: PERCENTAGE,
      then: (schema) =>
        schema.max(100, "Giá trị phần trăm không được lớn hơn 100"),
    }),

  productIds: yup
    .array()
    .of(
      yup
        .string()
        .matches(objectIdPattern, "Mỗi productId phải là ObjectId hợp lệ")
    )
    .min(1, "Danh sách sản phẩm phải có ít nhất ${min} phần tử")
    .required("Danh sách sản phẩm là bắt buộc")
    .typeError("Danh sách sản phẩm phải là một mảng"),

  validFrom: yup
    .date()
    .min(tomorrow, "Ngày bắt đầu phải từ ngày mai trở đi")
    .required("Ngày bắt đầu là bắt buộc")
    .typeError("Ngày bắt đầu phải là ngày hợp lệ")
    .transform((value) => normalizeDate(value)),

  validTo: yup
    .date()
    .required("Ngày kết thúc là bắt buộc")
    .typeError("Ngày kết thúc phải là ngày hợp lệ")
    .transform((value) => normalizeDate(value)),

  isActive: yup
    .boolean()
    .default(true)
    .typeError("Trạng thái phải là true hoặc false"),
});

export const updateDiscountValidation = yup.object().shape({
  name: yup
    .string()
    .trim()
    .min(2, "Tên discount phải có ít nhất ${min} ký tự")
    .max(100, "Tên discount không được vượt quá ${max} ký tự")
    .required("Tên discount là bắt buộc")
    .typeError("Tên discount phải là chuỗi"),

  description: yup
    .string()
    .trim()
    .min(10, "Mô tả phải có ít nhất ${min} ký tự")
    .required("Mô tả là bắt buộc")
    .typeError("Mô tả phải là chuỗi"),

  type: yup
    .string()
    .oneOf(
      DISCOUNT_TYPES,
      `Loại giảm giá chỉ được là: ${DISCOUNT_TYPES.join(", ")}`
    )
    .required("Loại giảm giá là bắt buộc")
    .typeError("Loại giảm giá phải là chuỗi"),

  value: yup
    .number()
    .positive("Giá trị giảm phải lớn hơn 0")
    .max(MAX_NUMBER, "Giá trị giảm không được vượt quá 16 chữ số")
    .required("Giá trị giảm là bắt buộc")
    .typeError("Giá trị giảm phải là số")
    .when("type", {
      is: PERCENTAGE,
      then: (schema) =>
        schema.max(100, "Giá trị phần trăm không được lớn hơn 100"),
    }),

  productIds: yup
    .array()
    .of(
      yup
        .string()
        .matches(objectIdPattern, "Mỗi productId phải là ObjectId hợp lệ")
    )
    .min(1, "Danh sách sản phẩm phải có ít nhất ${min} phần tử")
    .required("Danh sách sản phẩm là bắt buộc")
    .typeError("Danh sách sản phẩm phải là một mảng"),

  validFrom: yup
    .date()
    .required("Ngày bắt đầu là bắt buộc")
    .typeError("Ngày bắt đầu phải là ngày hợp lệ")
    .transform((value) => normalizeDate(value)),

  validTo: yup
    .date()
    .required("Ngày kết thúc là bắt buộc")
    .typeError("Ngày kết thúc phải là ngày hợp lệ")
    .transform((value) => normalizeDate(value)),

  isActive: yup
    .boolean()
    .default(true)
    .typeError("Trạng thái phải là true hoặc false"),
});
