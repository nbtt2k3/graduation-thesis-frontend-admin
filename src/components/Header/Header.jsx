import React, { useState, useRef, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  User,
  LogOut,
  ChevronDown,
  UserCheck,
  ShoppingCart,
  Package,
  Users,
  X,
  Menu,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { AdminTechZoneContext } from "../../context/AdminTechZoneContext";
import { CustomSkeletonHeader } from "../../components";
import * as apis from "../../apis";

const Header = ({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  currentPageTitle,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  const {
    userInfor,
    isLoadingUser,
    notifications,
    isLoadingNotifications,
    markAsRead,
    markAllAsRead,
    navigate,
    setAuthToken,
  } = useContext(AdminTechZoneContext);

  const sortedNotifications = [...notifications]
    .filter((n) => !n.isRead)
    .sort((a, b) => {
      if (a.time === "Vừa xong") return -1;
      if (b.time === "Vừa xong") return 1;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  const unreadCount = sortedNotifications.length;

  // Click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setIsNotificationOpen(false);
  };

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setIsDropdownOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsDropdownOpen(false);
    setIsNotificationOpen(false);
  };

  const handleLogout = async () => {
    try {
      const response = await apis.apiLogoutAdmin();
      localStorage.removeItem("TechZone/admin");
      setAuthToken(null);
      toast.success(response.msg);
      navigate("/login");
    } catch (error) {
      if (error?.msg) {
        toast.error(error.msg || "Không thể đăng xuất");
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "order":
        return (
          <ShoppingCart className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-blue-500" />
        );
      case "product":
        return (
          <Package className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-orange-500" />
        );
      case "customer":
        return <Users className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-green-500" />;
      default:
        return <Bell className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-gray-500" />;
    }
  };

  const fullName = userInfor
    ? `${userInfor.firstName} ${userInfor.lastName}`
    : "Khách";

  if (isLoadingUser || isLoadingNotifications) {
    return <CustomSkeletonHeader />;
  }

  return (
    <header className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          <h1 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
            {currentPageTitle}
          </h1>
        </div>

        {/* Right */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Notification */}
          <div className="relative" ref={notificationRef}>
            <div
              className="cursor-pointer hover:bg-gray-50 rounded-lg p-1.5 sm:p-2 transition-colors"
              onClick={toggleNotification}
              aria-label="Toggle notifications"
            >
              <Bell className="w-4.5 sm:w-5 h-4.5 sm:h-5 text-gray-500 hover:text-gray-700 transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 sm:w-5 h-4.5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-[10px] sm:text-xs text-white font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                </span>
              )}
            </div>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-1.5 w-[75vw] sm:w-[360px] lg:w-[400px] min-w-[240px] bg-white rounded-md shadow-md border border-gray-100 z-50">
                <div className="flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 border-b border-gray-100">
                  <h3 className="text-[13px] sm:text-sm font-semibold text-gray-800">
                    Thông báo
                  </h3>
                  <div className="flex items-center space-x-1 sm:space-x-1.5">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[10px] sm:text-[11px] lg:text-xs text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                      >
                        Đánh dấu tất cả đã đọc
                      </button>
                    )}
                    <button
                      onClick={() => setIsNotificationOpen(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                      aria-label="Close notifications"
                    >
                      <X className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="max-h-[50vh] sm:max-h-[360px] overflow-y-auto">
                  {sortedNotifications.length > 0 ? (
                    sortedNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0 bg-blue-50"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-1.5 sm:space-x-2">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-[13px] sm:text-sm font-medium text-gray-900 truncate">
                                {notification.title}
                              </h4>
                              {notification.count > 0 && (
                                <span className="px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] lg:text-xs bg-red-100 text-red-600 rounded-full font-medium">
                                  {notification.count}
                                </span>
                              )}
                            </div>
                            <p className="text-[13px] sm:text-sm text-gray-600 mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">
                              {notification.time}
                            </p>
                          </div>
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1 sm:mt-1.5"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-2 sm:px-3 py-5 sm:py-6 text-center text-gray-500">
                      <Bell className="w-5 sm:w-6 h-5 sm:h-6 mx-auto mb-1.5 text-gray-300" />
                      <p className="text-[13px] sm:text-sm">
                        Không có thông báo mới
                      </p>
                    </div>
                  )}
                </div>
                <div className="px-2 sm:px-3 py-1.5 sm:py-2 border-t border-gray-100">
                  <Link
                    to="/dashboard"
                    className="text-[11px] sm:text-[13px] text-blue-600 hover:text-blue-800 transition-colors cursor-pointer block text-center"
                    onClick={() => setIsNotificationOpen(false)}
                  >
                    Xem tất cả
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div
              className="flex items-center space-x-1.5 sm:space-x-2 cursor-pointer hover:bg-gray-50 rounded-lg px-1.5 sm:px-2 py-1 transition-colors"
              onClick={toggleDropdown}
              aria-label="Toggle user menu"
            >
              {userInfor?.avatarUrl ? (
                <img
                  src={userInfor.avatarUrl}
                  alt="Avatar"
                  className="w-7 sm:w-8 h-7 sm:h-8 rounded-full object-cover border border-gray-300"
                />
              ) : (
                <div className="w-7 sm:w-8 h-7 sm:h-8 bg-teal-500 rounded-full flex items-center justify-center">
                  <User className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-white" />
                </div>
              )}

              <span className="hidden md:block text-[13px] sm:text-sm text-gray-700">
                {fullName}
              </span>
              <ChevronDown
                className={`w-3.5 sm:w-4 h-3.5 sm:h-4 text-gray-500 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-[70vw] sm:w-[200px] lg:w-[240px] bg-white rounded-md shadow-md border border-gray-100 py-0.5 z-50">
                {/* Thông tin user */}
                <div className="px-2 sm:px-3 py-1.5 sm:py-2 border-b border-gray-100 flex items-center space-x-1.5 sm:space-x-2">
                  {userInfor?.avatarUrl ? (
                    <img
                      src={userInfor.avatarUrl}
                      alt="Avatar"
                      className="w-8 sm:w-9 h-8 sm:h-9 rounded-full object-cover border border-gray-300"
                    />
                  ) : (
                    <div className="w-8 sm:w-9 h-8 sm:h-9 bg-teal-500 rounded-full flex items-center justify-center">
                      <User className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[13px] sm:text-sm font-medium text-gray-800 truncate">
                      {fullName}
                    </p>
                    <p className="text-[11px] sm:text-xs text-gray-500 truncate">
                      {userInfor?.email}
                    </p>
                  </div>
                </div>

                <div className="py-0.5">
                  <Link to="/profile">
                    <button className="flex items-center w-full px-2 sm:px-3 py-1.5 text-[13px] sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                      <UserCheck className="w-3.5 sm:w-4 h-3.5 sm:h-4 mr-1.5 sm:mr-2" />
                      Thông tin cá nhân
                    </button>
                  </Link>
                </div>

                <div className="border-t border-gray-100 my-0.5"></div>

                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-2 sm:px-3 py-1.5 text-[13px] sm:text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 sm:w-4 h-3.5 sm:h-4 mr-1.5 sm:mr-2" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
