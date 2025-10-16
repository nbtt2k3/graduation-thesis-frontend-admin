import * as yup from "yup";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const CreateCategoryValidation = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required("Trường này là bắt buộc")
    .min(2, "Tên danh mục phải có ít nhất ${min} ký tự")
    .typeError("Trường này phải là chuỗi"),

  parentId: yup
    .string()
    .trim()
    .required("Danh mục cha là bắt buộc")
    .matches(objectIdPattern, "Trường này phải là ObjectId hợp lệ")
    .typeError("Trường này phải là chuỗi"),

  isActive: yup
    .boolean()
    .required("isActive là bắt buộc")
    .typeError("isActive phải là true hoặc false"),

  logo: yup
    .mixed()
    .required("Hình ảnh danh mục là bắt buộc")
    .test("fileType", "Chỉ chấp nhận định dạng PNG, JPG, GIF", (value) => {
      if (!value) return false;
      return ["image/png", "image/jpeg", "image/gif"].includes(value.type);
    })
    .test("fileSize", "Hình ảnh không được vượt quá 10MB", (value) => {
      if (!value) return false;
      return value.size <= 10 * 1024 * 1024;
    }),
});

export const UpdateCategoryValidation = yup.object().shape({
  name: yup
    .string()
    .trim()
    .min(2, "Tên danh mục phải có ít nhất ${min} ký tự")
    .required("Trường này là bắt buộc")
    .nullable()
    .typeError("Trường này phải là chuỗi"),

  parentId: yup
    .string()
    .trim()
    .matches(objectIdPattern, "Trường này phải là ObjectId hợp lệ")
    .required("Trường này là bắt buộc")
    .nullable()
    .typeError("Trường này phải là chuỗi"),

  isActive: yup
    .boolean()
    .required("Trường này là bắt buộc")
    .typeError("isActive phải là true hoặc false"),

  logo: yup
    .mixed()
    .nullable()
    .test("fileType", "Chỉ chấp nhận định dạng PNG, JPG, GIF", (value) => {
      if (!value) return true;
      return ["image/png", "image/jpeg", "image/gif"].includes(value.type);
    })
    .test("fileSize", "Hình ảnh không được vượt quá 10MB", (value) => {
      if (!value) return true;
      return value.size <= 10 * 1024 * 1024;
    }),
});
