"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import data from "../../assets/dvhcvn/dvhcvn.json";

const AddressDropdown = ({
  register,
  errors,
  setValue,
  clearErrors,
  watch,
  onAddressChange,
}) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProvinceDropdownOpen, setIsProvinceDropdownOpen] = useState(false);
  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false);
  const [isWardDropdownOpen, setIsWardDropdownOpen] = useState(false);
  const [provinceSearchTerm, setProvinceSearchTerm] = useState("");
  const [districtSearchTerm, setDistrictSearchTerm] = useState("");
  const [wardSearchTerm, setWardSearchTerm] = useState("");
  const provinceWrapperRef = useRef(null);
  const districtWrapperRef = useRef(null);
  const wardWrapperRef = useRef(null);

  const province = watch("province");
  const district = watch("district");
  const ward = watch("ward");

  // Quy tắc validation cố định
  const validations = {
    province: {
      required: "Tỉnh/Thành phố là bắt buộc",
      minLength: {
        value: 2,
        message: "Tỉnh/Thành phố phải có ít nhất 2 ký tự",
      },
      maxLength: {
        value: 100,
        message: "Tỉnh/Thành phố không được vượt quá 100 ký tự",
      },
      validate: {
        notOnlyWhitespace: (value) =>
          value.trim().length > 0 ||
          "Tỉnh/Thành phố không được chỉ chứa khoảng trắng",
      },
    },
    district: {
      required: province ? "Quận/Huyện là bắt buộc" : false,
      minLength: {
        value: 2,
        message: "Quận/Huyện phải có ít nhất 2 ký tự",
      },
      maxLength: {
        value: 100,
        message: "Quận/Huyện không được vượt quá 100 ký tự",
      },
      validate: {
        notOnlyWhitespace: (value) =>
          value.trim().length > 0 ||
          "Quận/Huyện không được chỉ chứa khoảng trắng",
      },
    },
    ward: {
      required: district ? "Phường/Xã là bắt buộc" : false,
      minLength: {
        value: 2,
        message: "Phường/Xã phải có ít nhất 2 ký tự",
      },
      maxLength: {
        value: 100,
        message: "Phường/Xã không được vượt quá 100 ký tự",
      },
      validate: {
        notOnlyWhitespace: (value) =>
          value.trim().length > 0 ||
          "Phường/Xã không được chỉ chứa khoảng trắng",
      },
    },
  };

  useEffect(() => {
    try {
      if (data && data.data && Array.isArray(data.data)) {
        setProvinces(data.data);
      } else {
        toast.error("Lỗi: Dữ liệu tỉnh/thành không hợp lệ");
      }
    } catch (error) {
      toast.error(error?.msg || "Lỗi khi tải danh sách tỉnh/thành");
    }
  }, []);

  useEffect(() => {
    if (provinces.length > 0 && !isInitialized) {
      if (province) {
        setSelectedProvince(province);
        const provinceData = provinces.find((p) => p.level1_id === province);
        if (provinceData && provinceData.level2s) {
          setDistricts(provinceData.level2s);
          if (
            district &&
            provinceData.level2s.some((d) => d.level2_id === district)
          ) {
            setSelectedDistrict(district);
            const districtData = provinceData.level2s.find(
              (d) => d.level2_id === district
            );
            if (districtData && districtData.level3s) {
              setWards(districtData.level3s);
            }
          }
        }
      }
    }
  }, [provinces, province, district, ward, isInitialized]);

  useEffect(() => {
    if (wards.length > 0 && !isInitialized && ward) {
      if (wards.some((w) => w.level3_id === ward)) {
        setSelectedWard(ward);
      }
      setIsInitialized(true);
    }
  }, [wards, ward, isInitialized]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        provinceWrapperRef.current &&
        !provinceWrapperRef.current.contains(event.target)
      ) {
        setIsProvinceDropdownOpen(false);
        setProvinceSearchTerm("");
      }
      if (
        districtWrapperRef.current &&
        !districtWrapperRef.current.contains(event.target)
      ) {
        setIsDistrictDropdownOpen(false);
        setDistrictSearchTerm("");
      }
      if (
        wardWrapperRef.current &&
        !wardWrapperRef.current.contains(event.target)
      ) {
        setIsWardDropdownOpen(false);
        setWardSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (selectedProvince && provinces.length > 0 && isInitialized) {
      try {
        const selectedProvinceData = provinces.find(
          (p) => p.level1_id === selectedProvince
        );

        if (
          selectedProvinceData &&
          selectedProvinceData.level2s &&
          Array.isArray(selectedProvinceData.level2s)
        ) {
          setDistricts(selectedProvinceData.level2s);
        } else {
          setDistricts([]);
        }

        if (
          selectedDistrict &&
          !selectedProvinceData?.level2s.some(
            (d) => d.level2_id === selectedDistrict
          )
        ) {
          setSelectedDistrict("");
          setValue("district", "");
          setWards([]);
          setSelectedWard("");
          setValue("ward", "");
        } else if (selectedDistrict) {
          const districtData = selectedProvinceData.level2s.find(
            (d) => d.level2_id === selectedDistrict
          );
          if (districtData && districtData.level3s) {
            setWards(districtData.level3s);
          } else {
            setWards([]);
          }
        } else {
          setWards([]);
          setSelectedWard("");
          setValue("ward", "");
        }
      } catch (error) {
        toast.error(error?.msg || "Lỗi khi tải danh sách quận/huyện");
        setDistricts([]);
        setWards([]);
        setSelectedDistrict("");
        setSelectedWard("");
        setValue("district", "");
        setValue("ward", "");
      }
    } else if (isInitialized) {
      setDistricts([]);
      setWards([]);
      setSelectedDistrict("");
      setSelectedWard("");
      setValue("district", "");
      setValue("ward", "");
    }
  }, [selectedProvince, provinces, setValue, selectedDistrict, isInitialized]);

  useEffect(() => {
    if (selectedDistrict && districts.length > 0 && isInitialized) {
      try {
        const selectedDistrictData = districts.find(
          (d) => d.level2_id === selectedDistrict
        );

        if (
          selectedDistrictData &&
          selectedDistrictData.level3s &&
          Array.isArray(selectedDistrictData.level3s)
        ) {
          setWards(selectedDistrictData.level3s);
        } else {
          setWards([]);
        }

        if (
          selectedWard &&
          !selectedDistrictData?.level3s.some(
            (w) => w.level3_id === selectedWard
          )
        ) {
          setSelectedWard("");
          setValue("ward", "");
        }
      } catch (error) {
        toast.error(error?.msg || "Lỗi khi tải danh sách phường/xã");
        setWards([]);
        setSelectedWard("");
        setValue("ward", "");
      }
    } else if (isInitialized) {
      setWards([]);
      setSelectedWard("");
      setValue("ward", "");
    }
  }, [selectedDistrict, districts, setValue, selectedWard, isInitialized]);

  const updateParentAddress = useCallback(() => {
    const selectedProvinceData = provinces.find(
      (p) => p.level1_id === selectedProvince
    );
    const selectedDistrictData = districts.find(
      (d) => d.level2_id === selectedDistrict
    );
    const selectedWardData = wards.find((w) => w.level3_id === selectedWard);

    const selectedProvinceName = selectedProvinceData
      ? selectedProvinceData.name
      : "";
    const selectedDistrictName = selectedDistrictData
      ? selectedDistrictData.name
      : "";
    const selectedWardName = selectedWardData ? selectedWardData.name : "";

    onAddressChange({
      province: selectedProvinceName,
      district: selectedDistrictName,
      ward: selectedWardName,
    });
  }, [
    selectedProvince,
    selectedDistrict,
    selectedWard,
    provinces,
    districts,
    wards,
    onAddressChange,
  ]);

  useEffect(() => {
    updateParentAddress();
  }, [updateParentAddress]);

  const handleProvinceSelect = (value) => {
    setSelectedProvince(value);
    setValue("province", value, { shouldValidate: true });
    clearErrors(["province", "form"]);
    setSelectedDistrict("");
    setValue("district", "", { shouldValidate: false });
    setSelectedWard("");
    setValue("ward", "", { shouldValidate: false });
    setIsProvinceDropdownOpen(false);
    setProvinceSearchTerm("");
  };

  const handleDistrictSelect = (value) => {
    setSelectedDistrict(value);
    setValue("district", value, { shouldValidate: true });
    clearErrors(["district", "form"]);
    setSelectedWard("");
    setValue("ward", "", { shouldValidate: false });
    setIsDistrictDropdownOpen(false);
    setDistrictSearchTerm("");
  };

  const handleWardSelect = (value) => {
    setSelectedWard(value);
    setValue("ward", value, { shouldValidate: true });
    clearErrors(["ward", "form"]);
    setIsWardDropdownOpen(false);
    setWardSearchTerm("");
  };

  const filteredProvinces = provinces.filter((p) =>
    p.name.toLowerCase().includes(provinceSearchTerm.toLowerCase())
  );
  const filteredDistricts = districts.filter((d) =>
    d.name.toLowerCase().includes(districtSearchTerm.toLowerCase())
  );
  const filteredWards = wards.filter((w) =>
    w.name.toLowerCase().includes(wardSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tỉnh/Thành <span className="text-red-500">*</span>
        </label>
        <input type="hidden" {...register("province", validations.province)} />
        <div ref={provinceWrapperRef} className="relative w-full">
          <div
            className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex items-center justify-between ${
              errors.province ? "border-red-500" : "border-gray-300"
            } ${isProvinceDropdownOpen ? "ring-2 ring-blue-500" : ""}`}
            onClick={() => setIsProvinceDropdownOpen(!isProvinceDropdownOpen)}
          >
            <span className="text-gray-700">
              {selectedProvince
                ? provinces.find((p) => p.level1_id === selectedProvince)?.name ||
                  "Chọn tỉnh/thành"
                : "Chọn tỉnh/thành"}
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${
                isProvinceDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          {isProvinceDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-sm shadow-lg max-h-60 overflow-y-auto">
              <div className="p-2">
                <input
                  type="text"
                  placeholder="Tìm tỉnh/thành..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={provinceSearchTerm}
                  onChange={(e) => setProvinceSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              {filteredProvinces.length > 0 ? (
                filteredProvinces.map((p) => (
                  <div
                    key={p.level1_id}
                    className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => handleProvinceSelect(p.level1_id)}
                  >
                    {p.name}
                  </div>
                ))
              ) : (
                <div className="p-2 text-gray-500">
                  Không tìm thấy tỉnh/thành
                </div>
              )}
            </div>
          )}
        </div>
        {errors.province && (
          <p className="text-red-500 text-sm mt-1">{errors.province.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quận/Huyện <span className="text-red-500">*</span>
        </label>
        <input type="hidden" {...register("district", validations.district)} />
        <div ref={districtWrapperRef} className="relative w-full">
          <div
            className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex items-center justify-between ${
              errors.district ? "border-red-500" : "border-gray-300"
            } ${isDistrictDropdownOpen ? "ring-2 ring-blue-500" : ""}`}
            onClick={() => setIsDistrictDropdownOpen(!isDistrictDropdownOpen)}
            disabled={!districts.length}
          >
            <span className="text-gray-700">
              {selectedDistrict
                ? districts.find((d) => d.level2_id === selectedDistrict)?.name ||
                  "Chọn quận/huyện"
                : "Chọn quận/huyện"}
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${
                isDistrictDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          {isDistrictDropdownOpen && districts.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-sm shadow-lg max-h-60 overflow-y-auto">
              <div className="p-2">
                <input
                  type="text"
                  placeholder="Tìm quận/huyện..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={districtSearchTerm}
                  onChange={(e) => setDistrictSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              {filteredDistricts.length > 0 ? (
                filteredDistricts.map((d) => (
                  <div
                    key={d.level2_id}
                    className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => handleDistrictSelect(d.level2_id)}
                  >
                    {d.name}
                  </div>
                ))
              ) : (
                <div className="p-2 text-gray-500">
                  Không tìm thấy quận/huyện
                </div>
              )}
            </div>
          )}
        </div>
        {errors.district && (
          <p className="text-red-500 text-sm mt-1">{errors.district.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phường/Xã <span className="text-red-500">*</span>
        </label>
        <input type="hidden" {...register("ward", validations.ward)} />
        <div ref={wardWrapperRef} className="relative w-full">
          <div
            className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex items-center justify-between ${
              errors.ward ? "border-red-500" : "border-gray-300"
            } ${isWardDropdownOpen ? "ring-2 ring-blue-500" : ""}`}
            onClick={() => setIsWardDropdownOpen(!isWardDropdownOpen)}
            disabled={!wards.length}
          >
            <span className="text-gray-700">
              {selectedWard
                ? wards.find((w) => w.level3_id === selectedWard)?.name ||
                  "Chọn phường/xã"
                : "Chọn phường/xã"}
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${
                isWardDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          {isWardDropdownOpen && wards.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-sm shadow-lg max-h-60 overflow-y-auto">
              <div className="p-2">
                <input
                  type="text"
                  placeholder="Tìm phường/xã..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={wardSearchTerm}
                  onChange={(e) => setWardSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              {filteredWards.length > 0 ? (
                filteredWards.map((w) => (
                  <div
                    key={w.level3_id}
                    className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => handleWardSelect(w.level3_id)}
                  >
                    {w.name}
                  </div>
                ))
              ) : (
                <div className="p-2 text-gray-500">
                  Không tìm thấy phường/xã
                </div>
              )}
            </div>
          )}
        </div>
        {errors.ward && (
          <p className="text-red-500 text-sm mt-1">{errors.ward.message}</p>
        )}
      </div>
    </div>
  );
};

export default AddressDropdown;