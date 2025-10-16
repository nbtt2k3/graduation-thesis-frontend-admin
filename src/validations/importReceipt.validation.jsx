import * as yup from "yup";

const IMPORT_RECEIPT_PAYMENT_METHOD = ["cash", "bank_transfer", "other"];

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const createImportReceiptValidation = yup.object().shape({
  supplierId: yup
    .string()
    .matches(objectIdPattern, "Supplier ID phải là ObjectId hợp lệ")
    .required("Supplier ID là bắt buộc")
    .typeError("Supplier ID phải là chuỗi"),

  branchId: yup
    .string()
    .matches(objectIdPattern, "Branch ID phải là ObjectId hợp lệ")
    .required("Branch ID là bắt buộc")
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
        purchasePrice: yup
          .number()
          .positive("Giá nhập phải lớn hơn 0")
          .required("Giá nhập là bắt buộc")
          .typeError("Giá nhập phải là số"),
      })
    )
    .min(1, "Danh sách items phải có ít nhất ${min} phần tử")
    .required("Danh sách items là bắt buộc")
    .typeError("Danh sách items phải là một mảng"),

  totalAmount: yup
    .number()
    .positive("Tổng tiền phải lớn hơn 0")
    .required("Tổng tiền là bắt buộc")
    .typeError("Tổng tiền phải là số"),

  paymentMethod: yup
    .string()
    .oneOf(
      IMPORT_RECEIPT_PAYMENT_METHOD,
      `Phương thức thanh toán chỉ được là: ${IMPORT_RECEIPT_PAYMENT_METHOD.join(
        ", "
      )}`
    )
    .required("Phương thức thanh toán là bắt buộc")
    .typeError("Phương thức thanh toán phải là chuỗi"),

  note: yup
    .string()
    .trim()
    .required("Ghi chú là bắt buộc")
    .typeError("Ghi chú phải là chuỗi"),
});

export const updateImportReceiptValidation = yup.object().shape({
  supplierId: yup
    .string()
    .matches(objectIdPattern, "Supplier ID phải là ObjectId hợp lệ")
    .required("Supplier ID là bắt buộc")
    .typeError("Supplier ID phải là chuỗi"),

  branchId: yup
    .string()
    .matches(objectIdPattern, "Branch ID phải là ObjectId hợp lệ")
    .required("Branch ID là bắt buộc")
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
        purchasePrice: yup
          .number()
          .positive("Giá nhập phải lớn hơn 0")
          .required("Giá nhập là bắt buộc")
          .typeError("Giá nhập phải là số"),
      })
    )
    .min(1, "Danh sách items phải có ít nhất ${min} phần tử")
    .required("Danh sách items là bắt buộc")
    .typeError("Danh sách items phải là một mảng"),

  totalAmount: yup
    .number()
    .positive("Tổng tiền phải lớn hơn 0")
    .required("Tổng tiền là bắt buộc")
    .typeError("Tổng tiền phải là số"),

  paymentMethod: yup
    .string()
    .oneOf(
      IMPORT_RECEIPT_PAYMENT_METHOD,
      `Phương thức thanh toán chỉ được là: ${IMPORT_RECEIPT_PAYMENT_METHOD.join(
        ", "
      )}`
    )
    .required("Phương thức thanh toán là bắt buộc")
    .typeError("Phương thức thanh toán phải là chuỗi"),

  note: yup
    .string()
    .trim()
    .required("Ghi chú là bắt buộc")
    .typeError("Ghi chú phải là chuỗi"),
});
