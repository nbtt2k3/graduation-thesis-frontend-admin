import * as yup from "yup";

const phoneRegex = /^(0[3|5|7|8|9][0-9]{8}|\+84[3|5|7|8|9][0-9]{8})$/;

export const createBranchValidation = yup.object().shape({
  name: yup
    .string()
    .trim()
    .min(2, "Tên chi nhánh phải có ít nhất ${min} ký tự")
    .max(100, "Tên chi nhánh không vượt quá ${max} ký tự")
    .required("Tên chi nhánh là bắt buộc")
    .typeError("Tên chi nhánh phải là chuỗi"),

  phone: yup
    .string()
    .matches(
      phoneRegex,
      "Số điện thoại không hợp lệ (VD: 0xxxxxxxxx hoặc +84xxxxxxxx)"
    )
    .required("Số điện thoại là bắt buộc")
    .typeError("Số điện thoại phải là chuỗi"),

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

  location: yup
    .object({
      type: yup
        .string()
        .oneOf(["Point"], "Trường location.type phải là 'Point'")
        .required("Trường location.type là bắt buộc")
        .typeError("Loại địa chỉ phải là chuỗi"),
      coordinates: yup
        .array()
        .length(2, "Trường coordinates phải có đúng 2 phần tử [kinh độ, vĩ độ]")
        .of(yup.number().required().typeError("Kinh độ và vĩ độ phải là số"))
        .test(
          "coordinates-range",
          "Kinh độ phải từ -180 đến 180, vĩ độ phải từ -90 đến 90",
          function (value) {
            if (!value) return false;
            const [longitude, latitude] = value;
            return (
              longitude >= -180 &&
              longitude <= 180 &&
              latitude >= -90 &&
              latitude <= 90
            );
          }
        )
        .required("Trường coordinates là bắt buộc"),
    })
    .strict(true)
    .required("Trường location là bắt buộc"),

  isActive: yup
    .boolean()
    .default(true)
    .typeError("Trạng thái phải là true hoặc false"),
});

export const updateBranchValidation = yup.object().shape({
  name: yup
    .string()
    .trim()
    .min(2, "Tên chi nhánh phải có ít nhất ${min} ký tự")
    .max(100, "Tên chi nhánh không vượt quá ${max} ký tự")
    .required("Tên chi nhánh là bắt buộc")
    .typeError("Tên chi nhánh phải là chuỗi"),

  phone: yup
    .string()
    .matches(
      phoneRegex,
      "Số điện thoại không hợp lệ (VD: 0xxxxxxxxx hoặc +84xxxxxxxx)"
    )
    .required("Số điện thoại là bắt buộc")
    .typeError("Số điện thoại phải là chuỗi"),

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

  location: yup
    .object({
      type: yup
        .string()
        .oneOf(["Point"], "Trường location.type phải là 'Point'")
        .required("Trường location.type là bắt buộc")
        .typeError("Loại địa chỉ phải là chuỗi"),
      coordinates: yup
        .array()
        .length(2, "Trường coordinates phải có đúng 2 phần tử [kinh độ, vĩ độ]")
        .of(yup.number().required().typeError("Kinh độ và vĩ độ phải là số"))
        .test(
          "coordinates-range",
          "Kinh độ phải từ -180 đến 180, vĩ độ phải từ -90 đến 90",
          function (value) {
            if (!value) return false;
            const [longitude, latitude] = value;
            return (
              longitude >= -180 &&
              longitude <= 180 &&
              latitude >= -90 &&
              latitude <= 90
            );
          }
        )
        .required("Trường coordinates là bắt buộc"),
    })
    .strict(true)
    .required("Trường location là bắt buộc"),

  isActive: yup
    .boolean()
    .default(true)
    .typeError("Trạng thái phải là true hoặc false"),
});
