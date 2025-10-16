import * as yup from "yup";

export const CreateBrandValidation = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required("Trường này là bắt buộc")
    .min(2, "Tên thương hiệu phải có ít nhất ${min} ký tự")
    .typeError("Trường này phải là chuỗi"),

  isActive: yup
    .boolean()
    .required("isActive là bắt buộc")
    .typeError("isActive phải là true hoặc false"),

  logo: yup
    .mixed()
    .required("Hình ảnh thương hiệu là bắt buộc")
    .test("fileType", "Chỉ chấp nhận định dạng PNG, JPG, GIF", (value) => {
      if (!value) return false;
      return ["image/png", "image/jpeg", "image/gif"].includes(value.type);
    })
    .test("fileSize", "Hình ảnh không được vượt quá 10MB", (value) => {
      if (!value) return false;
      return value.size <= 10 * 1024 * 1024;
    }),
});

export const UpdateBrandValidation = yup.object().shape({
  name: yup
    .string()
    .trim()
    .min(2, "Tên thương hiệu phải có ít nhất ${min} ký tự")
    .required("Trường này là bắt buộc")
    .nullable()
    .typeError("Trường này phải là chuỗi"),

  isActive: yup
    .boolean()
    .required("isActive là bắt buộc")
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
