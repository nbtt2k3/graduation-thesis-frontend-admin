import * as yup from "yup";

const phoneRegex = /^(0[3|5|7|8|9][0-9]{8}|\+84[3|5|7|8|9][0-9]{8})$/;

export const createSupplierValidation = yup.object().shape({
  name: yup
    .string()
    .trim()
    .min(2, "Tên nhà cung cấp phải có ít nhất ${min} ký tự")
    .max(150, "Tên nhà cung cấp không được vượt quá ${max} ký tự")
    .required("Tên nhà cung cấp là bắt buộc")
    .typeError("Tên nhà cung cấp phải là chuỗi"),

  shortName: yup
    .string()
    .trim()
    .min(2, "Tên viết tắt phải có ít nhất ${min} ký tự")
    .max(50, "Tên viết tắt không được vượt quá ${max} ký tự")
    .required("Tên viết tắt là bắt buộc")
    .typeError("Tên viết tắt phải là chuỗi"),

  contactPersonName: yup
    .string()
    .trim()
    .min(2, "Tên người liên hệ phải có ít nhất ${min} ký tự")
    .max(100, "Tên người liên hệ không được vượt quá ${max} ký tự")
    .required("Tên người liên hệ là bắt buộc")
    .typeError("Tên người liên hệ phải là chuỗi"),

  phone: yup
    .string()
    .matches(
      phoneRegex,
      "Số điện thoại không hợp lệ (VD: 0xxxxxxxxx hoặc +84xxxxxxxx)"
    )
    .required("Số điện thoại là bắt buộc")
    .typeError("Số điện thoại phải là chuỗi"),

  email: yup
    .string()
    .email("Email không hợp lệ")
    .required("Email là bắt buộc")
    .typeError("Email phải là chuỗi"),

  addressLine: yup
    .string()
    .trim()
    .min(5, "Địa chỉ chi tiết phải có ít nhất ${min} ký tự")
    .max(200, "Địa chỉ chi tiết không được vượt quá ${max} ký tự")
    .required("Địa chỉ chi tiết là bắt buộc")
    .typeError("Địa chỉ chi tiết phải là chuỗi"),

  ward: yup
    .string()
    .trim()
    .min(2, "Phường/Xã phải có ít nhất ${min} ký tự")
    .max(100, "Phường/Xã không được vượt quá ${max} ký tự")
    .required("Phường/Xã là bắt buộc")
    .typeError("Phường/Xã phải là chuỗi"),

  district: yup
    .string()
    .trim()
    .min(2, "Quận/Huyện phải có ít nhất ${min} ký tự")
    .max(100, "Quận/Huyện không được vượt quá ${max} ký tự")
    .required("Quận/Huyện là bắt buộc")
    .typeError("Quận/Huyện phải là chuỗi"),

  province: yup
    .string()
    .trim()
    .min(2, "Tỉnh/Thành phố phải có ít nhất ${min} ký tự")
    .max(100, "Tỉnh/Thành phố không được vượt quá ${max} ký tự")
    .required("Tỉnh/Thành phố là bắt buộc")
    .typeError("Tỉnh/Thành phố phải là chuỗi"),

  description: yup
    .string()
    .trim()
    .min(10, "Mô tả phải có ít nhất ${min} ký tự")
    .required("Mô tả là bắt buộc")
    .typeError("Mô tả phải là chuỗi"),

  isActive: yup
    .boolean()
    .default(true)
    .typeError("Trạng thái phải là true hoặc false"),
});

export const updateSupplierValidation = yup.object().shape({
  name: yup
    .string()
    .trim()
    .min(2, "Tên nhà cung cấp phải có ít nhất ${min} ký tự")
    .max(150, "Tên nhà cung cấp không được vượt quá ${max} ký tự")
    .required("Tên nhà cung cấp là bắt buộc")
    .typeError("Tên nhà cung cấp phải là chuỗi"),

  shortName: yup
    .string()
    .trim()
    .min(2, "Tên viết tắt phải có ít nhất ${min} ký tự")
    .max(50, "Tên viết tắt không được vượt quá ${max} ký tự")
    .required("Tên viết tắt là bắt buộc")
    .typeError("Tên viết tắt phải là chuỗi"),

  contactPersonName: yup
    .string()
    .trim()
    .min(2, "Tên người liên hệ phải có ít nhất ${min} ký tự")
    .max(100, "Tên người liên hệ không được vượt quá ${max} ký tự")
    .required("Tên người liên hệ là bắt buộc")
    .typeError("Tên người liên hệ phải là chuỗi"),

  phone: yup
    .string()
    .matches(
      phoneRegex,
      "Số điện thoại không hợp lệ (VD: 0xxxxxxxxx hoặc +84xxxxxxxx)"
    )
    .required("Số điện thoại là bắt buộc")
    .typeError("Số điện thoại phải là chuỗi"),

  email: yup
    .string()
    .email("Email không hợp lệ")
    .required("Email là bắt buộc")
    .typeError("Email phải là chuỗi"),

  addressLine: yup
    .string()
    .trim()
    .min(5, "Địa chỉ chi tiết phải có ít nhất ${min} ký tự")
    .max(200, "Địa chỉ chi tiết không được vượt quá ${max} ký tự")
    .required("Địa chỉ chi tiết là bắt buộc")
    .typeError("Địa chỉ chi tiết phải là chuỗi"),

  ward: yup
    .string()
    .trim()
    .min(2, "Phường/Xã phải có ít nhất ${min} ký tự")
    .max(100, "Phường/Xã không được vượt quá ${max} ký tự")
    .required("Phường/Xã là bắt buộc")
    .typeError("Phường/Xã phải là chuỗi"),

  district: yup
    .string()
    .trim()
    .min(2, "Quận/Huyện phải có ít nhất ${min} ký tự")
    .max(100, "Quận/Huyện không được vượt quá ${max} ký tự")
    .required("Quận/Huyện là bắt buộc")
    .typeError("Quận/Huyện phải là chuỗi"),

  province: yup
    .string()
    .trim()
    .min(2, "Tỉnh/Thành phố phải có ít nhất ${min} ký tự")
    .max(100, "Tỉnh/Thành phố không được vượt quá ${max} ký tự")
    .required("Tỉnh/Thành phố là bắt buộc")
    .typeError("Tỉnh/Thành phố phải là chuỗi"),

  description: yup
    .string()
    .trim()
    .min(10, "Mô tả phải có ít nhất ${min} ký tự")
    .required("Mô tả là bắt buộc")
    .typeError("Mô tả phải là chuỗi"),

  isActive: yup
    .boolean()
    .default(true)
    .typeError("Trạng thái phải là true hoặc false"),
});
