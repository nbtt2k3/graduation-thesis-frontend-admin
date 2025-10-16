import * as yup from "yup";

const EXPORT_RECEIPT_REASON = ["sale", "return", "damage", "other"];

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const createExportReceiptValidation = yup.object().shape({
  branchId: yup
    .string()
    .required("Branch ID là bắt buộc")
    .matches(objectIdPattern, "Branch ID phải là ObjectId hợp lệ")
    .typeError("Branch ID phải là chuỗi"),

  items: yup
    .array()
    .of(
      yup.object().shape({
        productItemId: yup
          .string()
          .required("Product Item ID là bắt buộc")
          .matches(objectIdPattern, "Product Item ID phải là ObjectId hợp lệ")
          .typeError("Product Item ID phải là chuỗi"),
        quantity: yup
          .number()
          .required("Số lượng là bắt buộc")
          .integer("Số lượng phải là số nguyên")
          .positive("Số lượng phải lớn hơn 0")
          .typeError("Số lượng phải là số"),
      })
    )
    .min(1, "Danh sách items phải có ít nhất ${min} phần tử")
    .required("Danh sách items là bắt buộc")
    .typeError("Danh sách items phải là một mảng"),

  reason: yup
    .string()
    .required("Lý do là bắt buộc")
    .oneOf(
      EXPORT_RECEIPT_REASON,
      `Lý do chỉ được là: ${EXPORT_RECEIPT_REASON.join(", ")}`
    )
    .typeError("Lý do phải là chuỗi"),

  note: yup
    .string()
    .trim()
    .required("Ghi chú là bắt buộc")
    .typeError("Ghi chú phải là chuỗi"),
});

export const updateExportReceiptValidation = yup.object().shape({
  branchId: yup
    .string()
    .required("Branch ID là bắt buộc")
    .matches(objectIdPattern, "Branch ID phải là ObjectId hợp lệ")
    .typeError("Branch ID phải là chuỗi"),

  items: yup
    .array()
    .of(
      yup.object().shape({
        productItemId: yup
          .string()
          .matches(objectIdPattern, "Product Item ID phải là ObjectId hợp lệ")
          .required("Product Item ID là bắt buộc")
          .typeError("Product Item ID phải là chuỗi"),
        quantity: yup
          .number()
          .integer("Số lượng phải là số nguyên")
          .positive("Số lượng phải lớn hơn 0")
          .required("Số lượng là bắt buộc")
          .typeError("Số lượng phải là số"),
      })
    )
    .min(1, "Danh sách items phải có ít nhất ${min} phần tử")
    .required("Danh sách items là bắt buộc")
    .typeError("Danh sách items phải là một mảng"),

  reason: yup
    .string()
    .oneOf(
      EXPORT_RECEIPT_REASON,
      `Lý do chỉ được là: ${EXPORT_RECEIPT_REASON.join(", ")}`
    )
    .required("Lý do là bắt buộc")
    .typeError("Lý do phải là chuỗi"),

  note: yup
    .string()
    .trim()
    .required("Ghi chú là bắt buộc")
    .typeError("Ghi chú phải là chuỗi"),
});
