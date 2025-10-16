import * as yup from "yup";

const phoneRegex = /^(0[3|5|7|8|9][0-9]{8}|\+84[3|5|7|8|9][0-9]{8})$/;
const USER_GENDER = ["male", "female", "other"];

export const updateUserCurrentValidation = yup.object().shape({
  firstName: yup
    .string()
    .trim()
    .min(2, "Họ phải có ít nhất ${min} ký tự")
    .max(50, "Họ không được vượt quá ${max} ký tự")
    .optional()
    .nullable()
    .typeError("Họ phải là chuỗi"),

  lastName: yup
    .string()
    .trim()
    .min(2, "Tên phải có ít nhất ${min} ký tự")
    .max(50, "Tên không được vượt quá ${max} ký tự")
    .optional()
    .nullable()
    .typeError("Tên phải là chuỗi"),

  phone: yup
    .string()
    .matches(
      phoneRegex,
      "Số điện thoại không hợp lệ (VD: 0xxxxxxxxx hoặc +84xxxxxxxx)"
    )
    .optional()
    .nullable()
    .typeError("Số điện thoại phải là chuỗi"),

  gender: yup
    .string()
    .oneOf(USER_GENDER, `Giới tính chỉ được là: ${USER_GENDER.join(", ")}`)
    .optional()
    .nullable()
    .typeError("Giới tính phải là chuỗi"),

  dateOfBirth: yup
    .date()
    .max(new Date(), "Ngày sinh phải nhỏ hơn ngày hiện tại")
    .optional()
    .nullable()
    .typeError("Ngày sinh không hợp lệ"),

  avatar: yup
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
