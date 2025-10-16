import * as yup from "yup";

const VOUCHER_TYPES = ["percentage", "fixed"];
const VOUCHER_APPLY_TO = ["product", "shipping"];
const PERCENTAGE = "percentage";
const FIXED = "fixed";

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

export const createVoucherValidation = yup.object().shape({
  name: yup
    .string()
    .trim()
    .min(2, "Tên voucher phải có ít nhất ${min} ký tự")
    .max(100, "Tên voucher không được vượt quá ${max} ký tự")
    .required("Tên voucher là bắt buộc")
    .typeError("Tên voucher phải là chuỗi"),

  description: yup
    .string()
    .trim()
    .min(10, "Mô tả phải có ít nhất ${min} ký tự")
    .required("Mô tả là bắt buộc")
    .typeError("Mô tả phải là chuỗi"),

  type: yup
    .string()
    .trim()
    .oneOf(
      VOUCHER_TYPES,
      `Loại giảm giá chỉ được là: ${VOUCHER_TYPES.join(", ")}`
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

  minValue: yup
    .number()
    .min(0, "Giá trị tối thiểu không được âm")
    .max(MAX_NUMBER, "Giá trị tối thiểu không được vượt quá 16 chữ số")
    .required("Giá trị tối thiểu là bắt buộc")
    .typeError("Giá trị tối thiểu phải là số"),

  maxValue: yup
    .number()
    .min(0, "Giá trị tối đa phải >= 0")
    .max(MAX_NUMBER, "Giá trị tối đa không được vượt quá 16 chữ số")
    .required("Giá trị tối đa là bắt buộc")
    .typeError("Giá trị tối đa phải là số")
    .when("type", {
      is: FIXED,
      then: (schema) =>
        schema.test(
          "matchValue",
          "Với loại giảm cố định, giá trị tối đa phải bằng giá trị giảm",
          function (value) {
            return value === this.parent.value;
          }
        ),
    }),

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

  applyTo: yup
    .string()
    .trim()
    .oneOf(
      VOUCHER_APPLY_TO,
      `Trường áp dụng chỉ được là: ${VOUCHER_APPLY_TO.join(", ")}`
    )
    .required("Trường áp dụng là bắt buộc")
    .typeError("Trường áp dụng phải là chuỗi"),

  isActive: yup
    .boolean()
    .default(true)
    .typeError("Trạng thái phải là true hoặc false"),
});

export const updateVoucherValidation = yup.object().shape({
  name: yup
    .string()
    .trim()
    .min(2, "Tên voucher phải có ít nhất ${min} ký tự")
    .max(100, "Tên voucher không được vượt quá ${max} ký tự")
    .required("Tên voucher là bắt buộc")
    .typeError("Tên voucher phải là chuỗi"),

  description: yup
    .string()
    .trim()
    .min(10, "Mô tả phải có ít nhất ${min} ký tự")
    .required("Mô tả là bắt buộc")
    .typeError("Mô tả phải là chuỗi"),

  type: yup
    .string()
    .trim()
    .oneOf(
      VOUCHER_TYPES,
      `Loại giảm giá chỉ được là: ${VOUCHER_TYPES.join(", ")}`
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

  minValue: yup
    .number()
    .min(0, "Giá trị tối thiểu không được âm")
    .max(MAX_NUMBER, "Giá trị tối thiểu không được vượt quá 16 chữ số")
    .required("Giá trị tối thiểu là bắt buộc")
    .typeError("Giá trị tối thiểu phải là số"),

  maxValue: yup
    .number()
    .min(0, "Giá trị tối đa phải >= 0")
    .max(MAX_NUMBER, "Giá trị tối đa không được vượt quá 16 chữ số")
    .required("Giá trị tối đa là bắt buộc")
    .typeError("Giá trị tối đa phải là số")
    .when("type", {
      is: FIXED,
      then: (schema) =>
        schema.test(
          "matchValue",
          "Với loại giảm cố định, giá trị tối đa phải bằng giá trị giảm",
          function (value) {
            return value === this.parent.value;
          }
        ),
    }),

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

  applyTo: yup
    .string()
    .trim()
    .oneOf(
      VOUCHER_APPLY_TO,
      `Trường áp dụng chỉ được là: ${VOUCHER_APPLY_TO.join(", ")}`
    )
    .required("Trường áp dụng là bắt buộc")
    .typeError("Trường áp dụng phải là chuỗi"),

  isActive: yup
    .boolean()
    .default(true)
    .typeError("Trạng thái phải là true hoặc false"),
});
