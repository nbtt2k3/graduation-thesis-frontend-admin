"use client";

import { useEffect, useState, useContext } from "react";
import {
  FileText,
  Plus,
  Package,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  MapPin,
  RotateCcw,
} from "lucide-react";
import * as apis from "../../../apis";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { CustomSkeletonBranch, CustomSelect } from "../../../components";
import { AdminTechZoneContext } from "../../../context/AdminTechZoneContext";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const Branch = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState([]);
  const [nameFilter, setNameFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [appliedNameFilter, setAppliedNameFilter] = useState("");
  const [appliedPhoneFilter, setAppliedPhoneFilter] = useState("");
  const [appliedStatusFilter, setAppliedStatusFilter] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [totalBranches, setTotalBranches] = useState(0);
  const [activeBranches, setActiveBranches] = useState(0);
  const [inactiveBranches, setInactiveBranches] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmBranchId, setConfirmBranchId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  const { setError, navigate } = useContext(AdminTechZoneContext);

  const statusOptions = [
    { value: "", label: "Tất cả" },
    { value: "true", label: "Hoạt động" },
    { value: "false", label: "Không hoạt động" },
  ];

  const getAllBranches = async (page = 1) => {
    try {
      setLoading(true);
      const query = { page };
      if (appliedNameFilter) query.name = appliedNameFilter;
      if (appliedPhoneFilter) query.phone = appliedPhoneFilter;
      if (appliedStatusFilter) query.isActive = appliedStatusFilter;
      const response = await apis.apiGetAllBranches(query);

      setBranches(response.branchList || []);
      setTotalBranches(response.totalBranches || 0);
      setActiveBranches(response.activeBranches || 0);
      setInactiveBranches(response.inactiveBranches || 0);
      if (page === 1 && response.branchList) {
        setItemsPerPage(response.branchList.length || 1);
      }
    } catch (error) {
      if (error?.msg) {
        toast.error(error.msg || "Không thể tải dữ liệu. Vui lòng thử lại.");
      } else {
        setError({ hasError: true, message: "Lỗi kết nối API" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (phoneFilter) {
      if (!/^\d+$/.test(phoneFilter)) {
        toast.error("Số điện thoại chỉ được chứa các chữ số.");
        return;
      }
      if (phoneFilter.length < 8 || phoneFilter.length > 15) {
        toast.error("Số điện thoại phải có 8-15 chữ số.");
        return;
      }
    }
    setAppliedNameFilter(nameFilter);
    setAppliedPhoneFilter(phoneFilter);
    setAppliedStatusFilter(statusFilter);
    setCurrentPage(1);
  };

  const handleResetFilters = async () => {
    setNameFilter("");
    setPhoneFilter("");
    setStatusFilter("");
    setAppliedNameFilter("");
    setAppliedPhoneFilter("");
    setAppliedStatusFilter("");
    setCurrentPage(1);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhoneFilter(value);
  };

  const handlePhoneKeyPress = (e) => {
    const charCode = e.charCode || e.keyCode;
    if (charCode < 48 || charCode > 57) {
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const cleanedValue = pastedData.replace(/[^0-9]/g, "");
    setPhoneFilter(cleanedValue);
  };

  useEffect(() => {
    getAllBranches(currentPage);
  }, [currentPage, appliedNameFilter, appliedPhoneFilter, appliedStatusFilter]);

  useEffect(() => {
    if (location.state?.branchCreated) {
      getAllBranches(currentPage);
      toast.success(location.state.branchCreated);
      navigate(location.pathname, { replace: true, state: {} });
    } else if (location.state?.branchUpdated) {
      getAllBranches(currentPage);
      toast.success(location.state.branchUpdated);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, currentPage]);

  const handleToggleConfirm = (branchId, currentStatus) => {
    setConfirmBranchId(branchId);
    setConfirmAction(currentStatus ? "hide" : "show");
    setIsConfirmModalOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!confirmBranchId || !confirmAction) return;

    try {
      setIsConfirmLoading(true);
      const newStatus = confirmAction === "hide";
      const response = await apis.apiUpdateBranchVisibility(confirmBranchId, {
        isActive: !newStatus,
      });

      setBranches((prev) =>
        prev.map((branch) =>
          branch._id === confirmBranchId
            ? { ...branch, isActive: !newStatus }
            : branch
        )
      );
      setActiveBranches((prev) => (newStatus ? prev - 1 : prev + 1));
      setInactiveBranches((prev) => (newStatus ? prev + 1 : prev - 1));
      toast.success(
        response?.msg || "Không thể tải dữ liệu. Vui lòng thử lại."
      );
    } catch (error) {
      if (error?.msg) {
        toast.error(error.msg || "Không thể tải dữ liệu. Vui lòng thử lại.");
      }
    } finally {
      setIsConfirmLoading(false);
      setIsConfirmModalOpen(false);
      setConfirmBranchId(null);
      setConfirmAction(null);
    }
  };

  const handleShowMap = (branch) => {
    setSelectedBranch(branch);
  };

  const handleCloseMap = () => {
    setSelectedBranch(null);
  };

  const totalPages = itemsPerPage ? Math.ceil(totalBranches / itemsPerPage) : 1;

  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 3;

    if (totalPages > 0) {
      items.push(1);
    }

    const start = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
    if (start > 2) {
      items.push("...");
    }

    const end = Math.min(
      totalPages - 1,
      currentPage + Math.floor(maxVisiblePages / 2)
    );

    for (let i = start; i <= end; i++) {
      items.push(i);
    }

    if (end < totalPages - 1) {
      items.push("...");
    }

    if (totalPages > 1) {
      items.push(totalPages);
    }

    return items;
  };

  if (loading) {
    return <CustomSkeletonBranch />;
  }

  return (
    <div className="p-3 sm:p-6 bg-white h-auto">
      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 p-6 border-b border-gray-200">
              Xác nhận {confirmAction === "hide" ? "Ẩn" : "Hiển thị"} chi nhánh
            </h3>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-6">
                Bạn có chắc muốn {confirmAction === "hide" ? "ẩn" : "hiển thị"}{" "}
                chi nhánh này?
              </p>
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 cursor-pointer transition-colors duration-200 w-full sm:w-auto"
                  onClick={() => setIsConfirmModalOpen(false)}
                  aria-label="Hủy"
                  disabled={isConfirmLoading}
                >
                  Hủy
                </button>
                <button
                  className={`px-4 py-2 text-white rounded-md flex items-center justify-center transition-colors duration-200 w-full sm:w-auto cursor-pointer ${
                    confirmAction === "hide"
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "bg-green-500 hover:bg-green-600"
                  } ${isConfirmLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={handleConfirmToggle}
                  aria-label={
                    confirmAction === "hide"
                      ? "Xác nhận ẩn"
                      : "Xác nhận hiển thị"
                  }
                  disabled={isConfirmLoading}
                >
                  {isConfirmLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Đang xử lý...
                    </>
                  ) : confirmAction === "hide" ? (
                    "Ẩn"
                  ) : (
                    "Hiển thị"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {selectedBranch && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Vị trí: {selectedBranch.name}
              </h3>
              <button
                onClick={handleCloseMap}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
                aria-label="Đóng bản đồ"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              {selectedBranch.location &&
              selectedBranch.location.coordinates ? (
                <div className="h-96">
                  <MapContainer
                    center={[
                      selectedBranch.location.coordinates[1],
                      selectedBranch.location.coordinates[0],
                    ]}
                    zoom={15}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker
                      position={[
                        selectedBranch.location.coordinates[1],
                        selectedBranch.location.coordinates[0],
                      ]}
                    >
                      <Popup>{selectedBranch.fullAddress}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              ) : (
                <div className="text-center text-red-500 py-8">
                  Không có dữ liệu vị trí cho chi nhánh này
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 sm:mb-6">
        <div className="hidden sm:flex justify-between items-center rounded-lg p-1">
          <div className="flex space-x-1">
            <Link
              to="add"
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-sm hover:bg-blue-600 flex items-center transition-colors cursor-pointer"
              aria-label="Thêm chi nhánh mới"
            >
              <Plus className="w-4 h-4 mr-2" />
              THÊM CHI NHÁNH
            </Link>
            <Link
              to="/products/product-management"
              className="px-4 py-2 text-sm bg-orange-500 text-white rounded-sm hover:bg-orange-600 flex items-center transition-colors cursor-pointer"
              aria-label="Quản lý sản phẩm"
            >
              <Package className="w-4 h-4 mr-2" />
              QUẢN LÝ SẢN PHẨM
            </Link>
          </div>
        </div>

        <div className="sm:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-full px-4 py-3 bg-blue-500 text-white rounded-sm hover:bg-blue-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
          >
            {isMobileMenuOpen ? (
              <X className="w-4 h-4 mr-2" />
            ) : (
              <Menu className="w-4 h-4 mr-2" />
            )}
            MENU
          </button>

          {isMobileMenuOpen && (
            <div className="mt-2 space-y-2 bg-white border border-gray-200 rounded-sm shadow-lg p-2">
              <Link
                to="add"
                className="w-full px-4 py-2 text-sm bg-blue-500 text-white rounded-sm hover:bg-blue-600 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Thêm chi nhánh mới"
              >
                <Plus className="w-4 h-4 mr-2" />
                THÊM CHI NHÁNH
              </Link>
              <Link
                to="/products/product-management"
                className="w-full px-4 py-2 text-sm bg-orange-500 text-white rounded-sm hover:bg-orange-600 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Quản lý sản phẩm"
              >
                <Package className="w-4 h-4 mr-2" />
                QUẢN LÝ SẢN PHẨM
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 sm:mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Tổng chi nhánh
              </p>
              <p className="text-2xl font-bold text-blue-800">
                {totalBranches}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">
                Đang hoạt động
              </p>
              <p className="text-2xl font-bold text-green-800">
                {activeBranches}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">
                Không hoạt động
              </p>
              <p className="text-2xl font-bold text-red-800">
                {inactiveBranches}
              </p>
            </div>
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <EyeOff className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-sm p-3 sm:p-4 mb-4 sm:mb-6 border-gray-100 border">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên chi nhánh
            </label>
            <input
              type="text"
              placeholder="Tên chi nhánh"
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại
            </label>
            <div className="w-full relative">
              <input
                type="tel"
                pattern="[0-9]*"
                placeholder="Số điện thoại"
                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                value={phoneFilter}
                onChange={handlePhoneChange}
                onKeyPress={handlePhoneKeyPress}
                onPaste={handlePaste}
              />
            </div>
          </div>
          <CustomSelect
            name="statusFilter"
            options={statusOptions}
            label="Trạng thái"
            placeholder="Tất cả"
            value={statusFilter}
            onChange={setStatusFilter}
            withSearch={false}
          />
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-500 text-white rounded-sm hover:bg-blue-600 transition-colors cursor-pointer"
            aria-label="Tìm kiếm"
          >
            Tìm kiếm
          </button>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 text-sm bg-gray-500 text-white rounded-sm hover:bg-gray-600 flex items-center transition-colors cursor-pointer"
            aria-label="Xóa bộ lọc"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            XÓA BỘ LỌC
          </button>
        </div>
      </div>

      <div className="bg-white rounded-sm shadow-md">
        <div className="bg-[#00D5BE] text-white p-3 rounded-t-sm flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <h2 className="text-base font-semibold">QUẢN LÝ CHI NHÁNH</h2>
        </div>

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  STT
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Tên chi nhánh
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Địa chỉ
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Số điện thoại
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Hoạt động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {branches.map((branch, index) => (
                <tr key={branch._id} className="hover:bg-gray-100">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {(currentPage - 1) * (itemsPerPage || 1) + index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {branch.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {branch.fullAddress}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {branch.phone}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        branch.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {branch.isActive ? "Hoạt động" : "Không hoạt động"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <Link
                        to={`edit/${branch._id}`}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 flex items-center cursor-pointer"
                        aria-label="Sửa chi nhánh"
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Sửa
                      </Link>
                      <button
                        onClick={() => handleShowMap(branch)}
                        className="px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 flex items-center cursor-pointer"
                        aria-label="Xem bản đồ chi nhánh"
                      >
                        <MapPin className="w-3 h-3 mr-1" />
                        Bản đồ
                      </button>
                      <button
                        onClick={() =>
                          handleToggleConfirm(branch._id, branch.isActive)
                        }
                        className={`px-3 py-1 rounded text-xs flex items-center cursor-pointer transition-colors ${
                          branch.isActive
                            ? "bg-orange-500 text-white hover:bg-orange-600"
                            : "bg-green-500 text-white hover:bg-green-600"
                        }`}
                        aria-label={
                          branch.isActive
                            ? "Ẩn chi nhánh"
                            : "Hiển thị chi nhánh"
                        }
                      >
                        {branch.isActive ? (
                          <>
                            <EyeOff className="w-3 h-3 mr-1" />
                            Ẩn
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3 mr-1" />
                            Hiện
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lg:hidden">
          <div className="divide-y divide-gray-200">
            {branches.map((branch, index) => (
              <div key={branch._id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      #{(currentPage - 1) * (itemsPerPage || 1) + index + 1} -{" "}
                      {branch.name}
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      <p>{branch.fullAddress}</p>
                      <p>SĐT: {branch.phone}</p>
                    </div>
                    <div className="mt-1 flex space-x-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          branch.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {branch.isActive ? "Hoạt động" : "Không hoạt động"}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2 flex-shrink-0">
                    <Link
                      to={`edit/${branch._id}`}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 flex items-center cursor-pointer"
                      aria-label="Sửa chi nhánh"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      Sửa
                    </Link>
                    <button
                      onClick={() => handleShowMap(branch)}
                      className="px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 flex items-center cursor-pointer"
                      aria-label="Xem bản đồ chi nhánh"
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      Bản đồ
                    </button>
                    <button
                      onClick={() =>
                        handleToggleConfirm(branch._id, branch.isActive)
                      }
                      className={`px-3 py-1 rounded text-xs flex items-center cursor-pointer transition-colors ${
                        branch.isActive
                          ? "bg-orange-500 text-white hover:bg-orange-600"
                          : "bg-green-500 text-white hover:bg-green-600"
                      }`}
                      aria-label={
                        branch.isActive ? "Ẩn chi nhánh" : "Hiển thị chi nhánh"
                      }
                    >
                      {branch.isActive ? (
                        <>
                          <EyeOff className="w-3 h-3 mr-1" />
                          Ẩn
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3 mr-1" />
                          Hiện
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {branches.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {appliedNameFilter || appliedPhoneFilter || appliedStatusFilter
              ? "Không có chi nhánh nào phù hợp với điều kiện lọc"
              : "Chưa có chi nhánh nào"}
          </div>
        )}

        {totalBranches > (itemsPerPage || 1) && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
              <div className="text-sm text-gray-700">
                Hiển thị {(currentPage - 1) * (itemsPerPage || 1) + 1} -{" "}
                {Math.min(currentPage * (itemsPerPage || 1), totalBranches)} của{" "}
                {totalBranches} mục
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center cursor-pointer"
                  aria-label="Trang trước"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Trước
                </button>

                <div className="flex items-center space-x-1">
                  {getPaginationItems().map((item, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        typeof item === "number" && setCurrentPage(item)
                      }
                      className={`px-3 py-1 text-sm border rounded cursor-pointer ${
                        item === currentPage
                          ? "bg-blue-500 text-white border-blue-500"
                          : typeof item === "number"
                          ? "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          : "bg-white text-gray-700 border-gray-300 cursor-default"
                      } ${
                        typeof item !== "number" ? "pointer-events-none" : ""
                      }`}
                      aria-label={
                        typeof item === "number" ? `Trang ${item}` : undefined
                      }
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center cursor-pointer"
                  aria-label="Trang sau"
                >
                  Sau
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Branch;
