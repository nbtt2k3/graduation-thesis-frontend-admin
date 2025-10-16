"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, MapPin, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import * as apis from "../../../apis";
import AddressDropdown from "../../../components/AddressDropdown/AddressDropdown";
import { useNavigate } from "react-router-dom";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const CreateBranch = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      addressLine: "",
      phone: "",
      province: "",
      district: "",
      ward: "",
      isActive: true,
      latitude: "10.7765",
      longitude: "106.7009",
    },
    mode: "onChange",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mapPosition, setMapPosition] = useState([10.7765, 106.7009]);
  const [address, setAddress] = useState({
    province: "",
    district: "",
    ward: "",
  });
  const [isGeocoding, setIsGeocoding] = useState(false);

  const watchedLatitude = watch("latitude");
  const watchedLongitude = watch("longitude");

  useEffect(() => {
    const lat = parseFloat(watchedLatitude);
    const lng = parseFloat(watchedLongitude);
    if (lat && lng && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      setMapPosition([lat, lng]);
    }
  }, [watchedLatitude, watchedLongitude]);

  const removePrefixes = (str) => {
    return str
      .replace(/^(Tỉnh|Thành phố|Thành Phố)\s+/i, "")
      .replace(/^(Huyện|Quận)\s+/i, "")
      .replace(/^(Xã|Phường|Thị trấn|Thị Trấn)\s+/i, "")
      .trim();
  };

  const geocodeAddress = async (addressString) => {
    if (!addressString.trim()) return null;

    setIsGeocoding(true);
    try {
      const apiKey = import.meta.env.VITE_OPENCAGE_API_KEY;
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          addressString
        )}&key=${apiKey}&countrycode=vn&limit=1&language=vi`
      );
      const data = await response.json();

      if (data && data.results && data.results.length > 0) {
        const lat = parseFloat(data.results[0].geometry.lat);
        const lng = parseFloat(data.results[0].geometry.lng);
        return { lat, lng };
      }
      return null;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    } finally {
      setIsGeocoding(false);
    }
  };

  const buildFullAddress = () => {
    const parts = [];
    const currentAddressLine = watch("addressLine");

    if (currentAddressLine && currentAddressLine.trim()) {
      parts.push(currentAddressLine.trim());
    }

    if (address.ward) parts.push(removePrefixes(address.ward));
    if (address.district) parts.push(removePrefixes(address.district));
    if (address.province) parts.push(removePrefixes(address.province));

    if (parts.length > 0) {
      parts.push("Việt Nam");
    }

    const fullAddress = parts.join(", ");
    return fullAddress;
  };

  const handleSearchLocation = async () => {
    const currentDistrict = watch("district");
    const currentProvince = watch("province");
    const currentAddressLine = watch("addressLine");

    const hasMinimumAddress = currentDistrict && currentProvince;
    const hasSpecificAddress = currentAddressLine && currentAddressLine.trim();

    if (!hasMinimumAddress && !hasSpecificAddress) {
      toast.error("Vui lòng nhập ít nhất tỉnh/thành phố và quận/huyện");
      return;
    }

    const fullAddress = buildFullAddress();
    if (!fullAddress) {
      toast.error("Vui lòng nhập địa chỉ để tìm kiếm");
      return;
    }

    if (!fullAddress.includes("Việt Nam")) {
      toast.error("Địa chỉ không hợp lệ, thiếu thông tin quốc gia");
      return;
    }

    const coordinates = await geocodeAddress(fullAddress);

    if (coordinates) {
      setMapPosition([coordinates.lat, coordinates.lng]);
      setValue("latitude", coordinates.lat.toString(), {
        shouldValidate: true,
      });
      setValue("longitude", coordinates.lng.toString(), {
        shouldValidate: true,
      });
      clearErrors(["latitude", "longitude"]);
      toast.success("Đã tìm thấy và cập nhật vị trí!");
    } else {
      if (hasSpecificAddress && hasMinimumAddress) {
        const fallbackAddress = `${removePrefixes(
          address.district
        )}, ${removePrefixes(address.province)}, Việt Nam`;

        const fallbackCoordinates = await geocodeAddress(fallbackAddress);
        if (fallbackCoordinates) {
          setMapPosition([fallbackCoordinates.lat, fallbackCoordinates.lng]);
          setValue("latitude", fallbackCoordinates.lat.toString(), {
            shouldValidate: true,
          });
          setValue("longitude", fallbackCoordinates.lng.toString(), {
            shouldValidate: true,
          });
          clearErrors(["latitude", "longitude"]);
          toast.success("Đã tìm thấy vị trí gần đúng");
        } else {
          toast.error("Không tìm thấy vị trí. Vui lòng kiểm tra lại địa chỉ.");
        }
      } else {
        toast.error("Không tìm thấy vị trí. Vui lòng kiểm tra lại địa chỉ.");
      }
    }
  };

  const MapUpdater = () => {
    const map = useMap();
    useEffect(() => {
      map.setView(mapPosition, 15);
    }, [mapPosition, map]);
    return null;
  };

  const MapClickHandler = () => {
    const map = useMap();

    useEffect(() => {
      const handleMapClick = (e) => {
        const { lat, lng } = e.latlng;
        setMapPosition([lat, lng]);
        setValue("latitude", lat.toString(), { shouldValidate: true });
        setValue("longitude", lng.toString(), { shouldValidate: true });
        clearErrors(["latitude", "longitude"]);
        toast.success("Đã cập nhật tọa độ từ bản đồ");
      };

      map.on("click", handleMapClick);
      return () => map.off("click", handleMapClick);
    }, [map]);

    return null;
  };

  const onSubmit = async (data) => {
    if (!data.province || !data.district || !data.ward) {
      setError("form", {
        message: "Vui lòng chọn đầy đủ tỉnh, quận/huyện, phường/xã",
      });
      return;
    }

    try {
      setIsLoading(true);
      const formData = {
        name: data.name.trim(),
        addressLine: data.addressLine.trim(),
        phone: data.phone.trim(),
        ward: address.ward,
        district: address.district,
        province: address.province,
        isActive: data.isActive,
        location: {
          type: "Point",
          coordinates: [parseFloat(data.longitude), parseFloat(data.latitude)],
        },
      };

      const response = await apis.apiCreateBranch(formData);
      navigate("/warehouse/branch-management", {
        state: { branchCreated: response?.msg },
      });
    } catch (error) {
      if (error?.msg) {
        toast.error(error.msg || "Không thể tạo chi nhánh. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field) => {
    return (e) => {
      setValue(field, e.target.value, { shouldValidate: true });
      if (e.target.value.trim().length > 0) {
        clearErrors(field);
      }
    };
  };

  const handleInputBlur = (field) => {
    return (e) => {
      setValue(field, e.target.value.trim(), { shouldValidate: true });
    };
  };

  return (
    <div className="p-3 sm:p-6 bg-white h-auto">
      <div className="mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-sm hover:bg-gray-300 flex items-center cursor-pointer disabled:cursor-not-allowed"
          disabled={isLoading}
          aria-label="Quay lại quản lý chi nhánh"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          QUẢN LÝ CHI NHÁNH
        </button>
      </div>

      <div className="bg-white rounded-sm shadow-md">
        <div className="bg-[#00D5BE] text-white p-4 rounded-t-sm">
          <h2 className="text-lg font-semibold">THÊM CHI NHÁNH</h2>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên chi nhánh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("name", {
                      required: "Tên chi nhánh là bắt buộc",
                      minLength: {
                        value: 2,
                        message: "Tên chi nhánh phải có ít nhất 2 ký tự",
                      },
                      maxLength: {
                        value: 100,
                        message: "Tên chi nhánh không được vượt quá 100 ký tự",
                      },
                      validate: {
                        notOnlyWhitespace: (value) =>
                          value.trim().length > 0 ||
                          "Tên chi nhánh không được chỉ chứa khoảng trắng",
                      },
                    })}
                    placeholder="Tên chi nhánh"
                    className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isLoading}
                    onChange={handleInputChange("name")}
                    onBlur={handleInputBlur("name")}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <AddressDropdown
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  clearErrors={clearErrors}
                  watch={watch}
                  onAddressChange={setAddress}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ cụ thể <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("addressLine", {
                      required: "Địa chỉ chi tiết là bắt buộc",
                      minLength: {
                        value: 5,
                        message: "Địa chỉ chi tiết phải có ít nhất 5 ký tự",
                      },
                      maxLength: {
                        value: 200,
                        message:
                          "Địa chỉ chi tiết không được vượt quá 200 ký tự",
                      },
                      validate: {
                        notOnlyWhitespace: (value) =>
                          value.trim().length > 0 ||
                          "Địa chỉ chi tiết không được chỉ chứa khoảng trắng",
                      },
                    })}
                    placeholder="Số nhà, đường"
                    className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.addressLine ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isLoading}
                    onChange={handleInputChange("addressLine")}
                    onBlur={handleInputBlur("addressLine")}
                  />
                  {errors.addressLine && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.addressLine.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    pattern="[0-9]*"
                    {...register("phone", {
                      required: "Số điện thoại là bắt buộc",
                      pattern: {
                        value: /^(0[3|5|7|8|9][0-9]{8}|\+84[3|5|7|8|9][0-9]{8})$/,
                        message:
                          "Số điện thoại không hợp lệ (VD: 0xxxxxxxxx hoặc +84xxxxxxxx)",
                      },
                      validate: {
                        notOnlyWhitespace: (value) =>
                          value.trim().length > 0 ||
                          "Số điện thoại không được chỉ chứa khoảng trắng",
                      },
                    })}
                    placeholder="Số điện thoại (VD: 0901234567 hoặc +84901234567)"
                    className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isLoading}
                    onChange={handleInputChange("phone")}
                    onBlur={handleInputBlur("phone")}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <input
                  type="hidden"
                  {...register("latitude", {
                    required: "Vĩ độ là bắt buộc",
                    validate: {
                      validNumber: (value) =>
                        !isNaN(parseFloat(value)) && value >= -90 && value <= 90
                          ? true
                          : "Vĩ độ phải là số hợp lệ từ -90 đến 90",
                    },
                  })}
                />
                <input
                  type="hidden"
                  {...register("longitude", {
                    required: "Kinh độ là bắt buộc",
                    validate: {
                      validNumber: (value) =>
                        !isNaN(parseFloat(value)) &&
                        value >= -180 &&
                        value <= 180
                          ? true
                          : "Kinh độ phải là số hợp lệ từ -180 đến 180",
                    },
                  })}
                />
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Bản đồ <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleSearchLocation}
                      disabled={isGeocoding || isLoading}
                      className="px-3 py-1 bg-blue-500 text-white rounded-sm hover:bg-blue-600 flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeocoding ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                          Đang tìm...
                        </>
                      ) : (
                        <div className="cursor-pointer flex items-center">
                          <Search className="w-3 h-3 mr-1" />
                          Tìm vị trí
                        </div>
                      )}
                    </button>
                  </div>
                  <div className="h-64 border rounded-sm relative z-0">
                    <MapContainer
                      center={mapPosition}
                      zoom={15}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Marker position={mapPosition} />
                      <MapUpdater />
                      <MapClickHandler />
                    </MapContainer>
                    <div className="absolute top-2 left-2 bg-white bg-opacity-90 p-2 rounded text-xs">
                      <p className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        Click để chọn vị trí
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Nhập địa chỉ rồi bấm "Tìm vị trí" để tự động cập nhật bản
                    đồ, hoặc click trực tiếp trên bản đồ.
                  </p>
                  {errors.latitude && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.latitude.message}
                    </p>
                  )}
                  {errors.longitude && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.longitude.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      {...register("isActive", {
                        required: "Trạng thái là bắt buộc",
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                      disabled={isLoading}
                      onChange={() => clearErrors("isActive")}
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Kích hoạt
                    </span>
                  </label>
                  {errors.isActive && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.isActive.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {errors.form && (
              <p className="text-red-500 text-sm mt-4">{errors.form.message}</p>
            )}

            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-2 bg-gray-500 text-white rounded-sm hover:bg-gray-600 cursor-pointer disabled:cursor-not-allowed"
                disabled={isLoading}
                aria-label="Hủy tạo chi nhánh"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-pink-500 text-white rounded-sm hover:bg-pink-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                disabled={isLoading || isGeocoding}
                aria-label="Thêm chi nhánh"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    THÊM
                  </>
                )}
              </button>
            </div>
          </form>

          {isModalOpen && (
            <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto">
                <h3 className="text-lg font-medium text-gray-900 p-6 border-b border-gray-200">
                  Xác nhận hủy
                </h3>
                <div className="p-6">
                  <p className="text-sm text-gray-500 mb-6">
                    Bạn có chắc muốn hủy? Dữ liệu sẽ không được lưu.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                    <button
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 cursor-pointer transition-colors duration-200 w-full sm:w-auto"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Tiếp tục
                    </button>
                    <button
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 cursor-pointer transition-colors duration-200 w-full sm:w-auto"
                      onClick={() => {
                        setIsModalOpen(false);
                        navigate("/warehouse/branch-management");
                      }}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateBranch;
