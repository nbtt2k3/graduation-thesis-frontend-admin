"use client";

import React, { useState, useEffect, useMemo, useRef, useContext } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Package, Eye, Users } from "lucide-react";
import * as apis from "../../apis";
import { toast } from "react-hot-toast";
import { AdminTechZoneContext } from "../../context/AdminTechZoneContext";
import { CustomSkeletonDashboard } from "../../components";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Bảng ánh xạ trạng thái đơn hàng
const statusTranslations = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  processing: "Đang chuẩn bị",
  shipped: "Đã gửi đi",
  out_for_delivery: "Đang giao hàng",
  delivered: "Đã giao",
  return_requested: "Yêu cầu trả hàng",
  returned: "Đã trả hàng",
  canceled: "Đã hủy",
};

// Bảng ánh xạ loại thông báo và sự kiện sang tiếng Việt
const typeTranslations = {
  order: "Đơn Hàng",
  inventory: "Tồn Kho",
  import_receipt: "Phiếu Nhập",
  export_receipt: "Phiếu Xuất",
};

const eventTranslations = {
  created: "Được Tạo",
  updated: "Được Cập Nhật",
  approved: "Được Phê Duyệt",
  rejected: "Bị Từ Chối",
  canceled: "Đã Hủy",
};

// Hàm ánh xạ màu cho trạng thái
const getStatusColor = (status) => {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-800";
    case "confirmed":
      return "bg-blue-100 text-blue-800";
    case "processing":
      return "bg-yellow-100 text-yellow-800";
    case "shipped":
      return "bg-teal-100 text-teal-800";
    case "out_for_delivery":
      return "bg-indigo-100 text-indigo-800";
    case "return_requested":
      return "bg-orange-100 text-orange-800";
    case "returned":
      return "bg-red-100 text-red-800";
    case "canceled":
      return "bg-red-100 text-red-800";
    case "pending":
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Hàm ánh xạ màu cho loại thông báo
const getTypeColor = (type) => {
  switch (type) {
    case "order":
      return "bg-blue-100 text-blue-800";
    case "inventory":
      return "bg-red-100 text-red-800";
    case "import_receipt":
      return "bg-green-100 text-green-800";
    case "export_receipt":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const Dashboard = () => {
  const {
    notifications,
    isLoadingNotifications,
    markAsRead,
    markAllAsRead,
    setError,
  } = useContext(AdminTechZoneContext);

  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [notificationSearch, setNotificationSearch] = useState("");
  const [notificationFilter, setNotificationFilter] = useState("all");
  const [notificationPage, setNotificationPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const periodWrapperRef = useRef(null);
  const notificationWrapperRef = useRef(null);
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState(false);
  const notificationsPerPage = 10;

  // Dữ liệu tĩnh ban đầu
  const [stats, setStats] = useState({
    revenue: {
      today: 0,
      week: { total: 0, daily: [] },
      month: { total: 0, daily: [] },
      year: { total: 0, monthly: [] },
    },
    orders: {
      total: 0,
      completed: 0,
      processing: 0,
      pending: 0,
    },
    products: {
      total: 0,
      totalVariants: 0,
      totalInventory: 0,
    },
    productsSold: {
      total: 0,
    },
    newCustomers: 0,
    returnRate: 5,
    cancelRate: 3,
    latestOrders: [],
    pendingOrders: [],
    topProducts: [],
    lowStockProducts: [],
    newProducts: [],
    newCustomersList: [],
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      const [orderData, productData, userData, popularProductData] =
        await Promise.all([
          apis.apiGetAllOrders({ limit: 0 }),
          apis.apiGetAllProducts({ limit: 0 }),
          apis.apiGetAlluser({ limit: 0 }),
          apis.apiGetPopularProducts({ limit: 5 }),
        ]);

      setProducts(productData?.productList || []);
      setOrders(orderData?.orderList || []);

      const newStats = { ...stats };

      newStats.orders.total = orderData?.totalOrders || 0;
      newStats.orders.completed =
        orderData?.orderList?.filter((order) => order.status === "delivered")
          .length || 0;
      newStats.orders.processing =
        orderData?.orderList?.filter((order) => order.status === "processing")
          .length || 0;
      newStats.orders.pending =
        orderData?.orderList?.filter((order) => order.status === "pending")
          .length || 0;

      newStats.latestOrders =
        orderData?.orderList?.map((order) => ({
          id: order.orderCode,
          customer: order.userId?.fullName || "Không xác định",
          product: order.items?.[0]?.name || "Không xác định",
          status: statusTranslations[order.status] || "Không xác định",
          createdAt: order.createdAt,
        })) || [];

      newStats.pendingOrders =
        orderData?.orderList
          ?.filter((order) =>
            [
              "pending",
              "confirmed",
              "processing",
              "shipped",
              "out_for_delivery",
            ].includes(order.status)
          )
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map((order) => ({
            id: order.orderCode,
            customer: order.userId?.fullName || "Không xác định",
            product: order.items?.[0]?.name || "Không xác định",
            status: statusTranslations[order.status] || "Không xác định",
          })) || [];

      const today = new Date();
      const startOfToday = new Date(today.setHours(0, 0, 0, 0));
      const startOfWeek = new Date(
        today.setDate(today.getDate() - today.getDay())
      );
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfYear = new Date(today.getFullYear(), 0, 1);

      newStats.revenue.today =
        orderData?.orderList
          ?.filter((order) => new Date(order.createdAt) >= startOfToday)
          .reduce((sum, order) => sum + order.totalAmount, 0) || 0;

      newStats.revenue.week.total =
        orderData?.orderList
          ?.filter((order) => new Date(order.createdAt) >= startOfWeek)
          .reduce((sum, order) => sum + order.totalAmount, 0) || 0;

      newStats.revenue.month.total =
        orderData?.orderList
          ?.filter((order) => new Date(order.createdAt) >= startOfMonth)
          .reduce((sum, order) => sum + order.totalAmount, 0) || 0;

      newStats.revenue.year.total =
        orderData?.orderList
          ?.filter((order) => new Date(order.createdAt) >= startOfYear)
          .reduce((sum, order) => sum + order.totalAmount, 0) || 0;

      newStats.revenue.week.daily = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        return {
          day: `Thứ ${i + 2}`,
          revenue:
            orderData?.orderList
              ?.filter((order) => {
                const orderDate = new Date(order.createdAt);
                return (
                  orderDate.getDate() === day.getDate() &&
                  orderDate.getMonth() === day.getMonth()
                );
              })
              .reduce((sum, order) => sum + order.totalAmount, 0) || 0,
        };
      });

      newStats.revenue.month.daily = Array.from({ length: 30 }, (_, i) => {
        const day = new Date(startOfMonth);
        day.setDate(startOfMonth.getDate() + i);
        return {
          day: `Ngày ${i + 1}`,
          revenue:
            orderData?.orderList
              ?.filter((order) => {
                const orderDate = new Date(order.createdAt);
                return (
                  orderDate.getDate() === day.getDate() &&
                  orderDate.getMonth() === day.getMonth()
                );
              })
              .reduce((sum, order) => sum + order.totalAmount, 0) || 0,
        };
      });

      newStats.revenue.year.monthly = Array.from({ length: 12 }, (_, i) => {
        const month = new Date(startOfYear);
        month.setMonth(i);
        return {
          month: `Tháng ${i + 1}`,
          revenue:
            orderData?.orderList
              ?.filter((order) => new Date(order.createdAt).getMonth() === i)
              .reduce((sum, order) => sum + order.totalAmount, 0) || 0,
        };
      });

      newStats.products.total = productData?.totalProducts || 0;
      newStats.products.totalVariants =
        productData?.productList?.reduce(
          (total, product) => total + (product.productItems?.length || 0),
          0
        ) || 0;
      newStats.products.totalInventory =
        productData?.productList?.reduce(
          (total, product) =>
            total +
            (product.productItems?.reduce(
              (subTotal, item) =>
                subTotal +
                (item.inventory?.reduce(
                  (invTotal, inv) => invTotal + (inv.quantity || 0),
                  0
                ) || 0),
              0
            ) || 0),
          0
        ) || 0;

      newStats.productsSold.total =
        productData?.productList?.reduce(
          (total, product) =>
            total +
            (product.productItems?.reduce(
              (subTotal, item) => subTotal + (item.soldCount || 0),
              0
            ) || 0),
          0
        ) || 0;

      newStats.topProducts =
        popularProductData?.productItemList?.map((productItem) => ({
          id: productItem._id || "Không xác định",
          name: productItem.name || "Không xác định",
          ratingAvg: productItem.ratingAvg || "N/A",
          ratingCount: productItem.ratingCount || 0,
          sales: productItem.soldCount || 0,
          category: productItem.category?.name || "Không xác định",
          price: productItem.discountedPrice || productItem.retailPrice || 0,
          attributes:
            productItem.attributes
              ?.map((attr) => `${attr.code}: ${attr.value}`)
              .join(", ") || "Không xác định",
        })) || [];

      newStats.lowStockProducts =
        productData?.productList
          ?.flatMap((product) =>
            product.productItems
              ?.filter((item) =>
                item.inventory?.some((inv) => (inv.quantity || 0) <= 5)
              )
              .map((item) => ({
                name: `${product.name} ${
                  item.attributes?.map((attr) => attr.value).join(" ") || ""
                }`,
                stock:
                  item.inventory?.reduce(
                    (total, inv) => total + (inv.quantity || 0),
                    0
                  ) || 0,
              }))
          )
          ?.sort((a, b) => a.stock - b.stock) || [];

      newStats.newProducts =
        productData?.productList
          ?.map((product) => ({
            name: product.name || "Không xác định",
            date: new Date(product.createdAt).toISOString().split("T")[0] || "",
          }))
          ?.sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5) || [];

      newStats.newCustomers = userData?.totalUsers || 0;
      newStats.newCustomersList =
        userData?.userList?.map((user) => ({
          id: user._id || "Không xác định",
          name: user.fullName || "Không xác định",
          date: new Date(user.createdAt).toISOString().split("T")[0] || "",
        })) || [];

      setStats(newStats);
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

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        periodWrapperRef.current &&
        !periodWrapperRef.current.contains(event.target)
      ) {
        setIsPeriodDropdownOpen(false);
      }
      if (
        notificationWrapperRef.current &&
        !notificationWrapperRef.current.contains(event.target)
      ) {
        setIsNotificationDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const productCategoryChartData = useMemo(() => {
    const categories = products.reduce((acc, product) => {
      const category = product.category;
      const categoryName = category?.name || "Không xác định";
      const categoryLevel = category?.level || 0;
      if (categoryLevel >= 3) {
        acc[categoryName] = (acc[categoryName] || 0) + 1;
      }
      return acc;
    }, {});

    const categoryArray = Object.entries(categories)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    const topN = 4;
    const topCategories = categoryArray.slice(0, topN);
    const othersCount = categoryArray
      .slice(topN)
      .reduce((sum, cat) => sum + cat.count, 0);

    const labels = [
      ...topCategories.map((cat) => cat.name),
      ...(othersCount > 0 ? ["Khác"] : []),
    ];
    const data = [
      ...topCategories.map((cat) => cat.count),
      ...(othersCount > 0 ? [othersCount] : []),
    ];

    return {
      labels,
      datasets: [
        {
          label: "Số lượng sản phẩm",
          data,
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            ...(othersCount > 0 ? ["#9966FF"] : []),
          ],
          hoverBackgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            ...(othersCount > 0 ? ["#9966FF"] : []),
          ],
        },
      ],
    };
  }, [products]);

  const categoryChartData = useMemo(() => {
    const productCategoryMap = products.reduce((acc, product) => {
      if (product.category?.level >= 3) {
        acc[product._id] = {
          name: product.category.name || "Không xác định",
          level: product.category.level || 0,
        };
      }
      return acc;
    }, {});

    const categoryRevenue = orders.reduce((acc, order) => {
      order.items.forEach((item) => {
        const productId = item.productId || item._id;
        const category = productCategoryMap[productId];
        if (category && category.level >= 3) {
          const categoryName = category.name;
          const itemRevenue =
            (item.quantity || 1) * (item.price || order.totalAmount);
          acc[categoryName] = (acc[categoryName] || 0) + itemRevenue;
        }
      });
      return acc;
    }, {});

    const categoryArray = Object.entries(categoryRevenue)
      .map(([name, revenue]) => ({
        name,
        revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const topN = 4;
    const topCategories = categoryArray.slice(0, topN);
    const othersRevenue = categoryArray
      .slice(topN)
      .reduce((sum, cat) => sum + cat.revenue, 0);

    const labels = [
      ...topCategories.map((cat) => cat.name),
      ...(othersRevenue > 0 ? ["Khác"] : []),
    ];
    const data = [
      ...topCategories.map((cat) => cat.revenue),
      ...(othersRevenue > 0 ? [othersRevenue] : []),
    ];

    return {
      labels,
      datasets: [
        {
          label: "Doanh thu (VNĐ)",
          data,
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            ...(othersRevenue > 0 ? ["#9966FF"] : []),
          ],
          hoverBackgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            ...(othersRevenue > 0 ? ["#9966FF"] : []),
          ],
        },
      ],
    };
  }, [orders, products]);

  const getExtremes = (data, key, labelKey) => {
    if (!data || data.length === 0) return { highest: null, lowest: null };
    const sorted = [...data].sort((a, b) => b[key] - a[key]);
    return {
      highest: sorted[0]
        ? `${sorted[0][labelKey]}: ${sorted[0][key].toLocaleString(
            "vi-VN"
          )} VNĐ`
        : null,
      lowest: sorted[sorted.length - 1]
        ? `${sorted[sorted.length - 1][labelKey]}: ${sorted[sorted.length - 1][
            key
          ].toLocaleString("vi-VN")} VNĐ`
        : null,
    };
  };

  const getRevenueChartData = useMemo(() => {
    const periods = {
      today: {
        labels: ["Hôm nay"],
        data: [stats.revenue.today],
        extremes: {
          highest: `Hôm nay: ${stats.revenue.today.toLocaleString(
            "vi-VN"
          )} VNĐ`,
          lowest: `Hôm nay: ${stats.revenue.today.toLocaleString("vi-VN")} VNĐ`,
        },
      },
      week: {
        labels: stats.revenue.week.daily.map((item) => item.day),
        data: stats.revenue.week.daily.map((item) => item.revenue),
        extremes: getExtremes(stats.revenue.week.daily, "revenue", "day"),
      },
      month: {
        labels: stats.revenue.month.daily.map((item) => item.day),
        data: stats.revenue.month.daily.map((item) => item.revenue),
        extremes: getExtremes(stats.revenue.month.daily, "revenue", "day"),
      },
      year: {
        labels: stats.revenue.year.monthly.map((item) => item.month),
        data: stats.revenue.year.monthly.map((item) => item.revenue),
        extremes: getExtremes(stats.revenue.year.monthly, "revenue", "month"),
      },
    };
    return {
      labels: periods[selectedPeriod].labels,
      datasets: [
        {
          label: "Doanh thu (VNĐ)",
          data: periods[selectedPeriod].data,
          backgroundColor: "#00D5BE",
          borderColor: "#00D5BE",
          borderWidth: 1,
        },
      ],
      extremes: periods[selectedPeriod].extremes,
    };
  }, [stats, selectedPeriod]);

  const yearlyTrendChartData = {
    labels: stats.revenue.year.monthly.map((item) => item.month),
    datasets: [
      {
        label: "Doanh thu (VNĐ)",
        data: stats.revenue.year.monthly.map((item) => item.revenue),
        borderColor: "#00D5BE",
        backgroundColor: "rgba(0, 213, 190, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const filteredOrders = useMemo(() => {
    return stats.latestOrders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [stats.latestOrders]);

  const filteredPendingOrders = useMemo(() => {
    return stats.pendingOrders.slice(0, 5);
  }, [stats.pendingOrders]);

  const filteredCustomers = useMemo(() => {
    return stats.newCustomersList
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [stats.newCustomersList]);

  const filteredNotifications = useMemo(() => {
    let filtered = notifications;
    if (notificationSearch) {
      filtered = filtered.filter(
        (notification) =>
          notification.id
            .toLowerCase()
            .includes(notificationSearch.toLowerCase()) ||
          notification.message
            .toLowerCase()
            .includes(notificationSearch.toLowerCase())
      );
    }
    if (notificationFilter === "all") {
      return filtered;
    } else if (notificationFilter === "read") {
      return filtered.filter((notification) => notification.isRead);
    } else if (notificationFilter === "unread") {
      return filtered.filter((notification) => !notification.isRead);
    } else {
      return filtered.filter(
        (notification) => notification.type === notificationFilter
      );
    }
  }, [notifications, notificationFilter, notificationSearch]);

  const paginatedNotifications = filteredNotifications.slice(
    (notificationPage - 1) * notificationsPerPage,
    notificationPage * notificationsPerPage
  );

  const handleNotificationSearch = (event) => {
    const value = event.target.value;
    setNotificationSearch(value);
    setNotificationPage(1); // Reset về page 1 khi tìm kiếm
  };

  if (loading || isLoadingNotifications) {
    return <CustomSkeletonDashboard />;
  }

  return (
    <div className="p-3 sm:p-6 bg-white h-auto">
      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Doanh Thu Hôm Nay
              </p>
              <p className="text-2xl font-bold text-blue-800">
                {stats.revenue.today.toLocaleString("vi-VN")} VNĐ
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
                Doanh Thu Tuần
              </p>
              <p className="text-2xl font-bold text-green-800">
                {stats.revenue.week.total.toLocaleString("vi-VN")} VNĐ
              </p>
            </div>
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">
                Doanh Thu Tháng
              </p>
              <p className="text-2xl font-bold text-orange-800">
                {stats.revenue.month.total.toLocaleString("vi-VN")} VNĐ
              </p>
            </div>
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">
                Doanh Thu Năm
              </p>
              <p className="text-2xl font-bold text-purple-800">
                {stats.revenue.year.total.toLocaleString("vi-VN")} VNĐ
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Tổng Đơn Hàng</p>
              <p className="text-2xl font-bold text-blue-800">
                {stats.orders.total}
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
                Sản Phẩm Bán Ra
              </p>
              <p className="text-2xl font-bold text-green-800">
                {stats.productsSold.total}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-teal-50 border border-teal-200 rounded-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-teal-600">Tổng Sản Phẩm</p>
              <p className="text-2xl font-bold text-teal-800">
                {stats.products.total}
              </p>
            </div>
            <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600">
                Tổng Khách Hàng
              </p>
              <p className="text-2xl font-bold text-indigo-800">
                {stats.newCustomers}
              </p>
            </div>
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Đơn hàng mới nhất */}
      <div className="bg-white rounded-sm shadow-md mb-4 sm:mb-6">
        <div className="bg-[#00D5BE] text-white p-3 rounded-t-sm flex items-center justify-between">
          <h2 className="text-base font-semibold">ĐƠN HÀNG MỚI NHẤT</h2>
        </div>
        {filteredOrders.length === 0 ? (
          <div className="p-4 text-center text-gray-600 text-sm">
            Không có đơn hàng phù hợp
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 min-w-[100px]">
                      Mã Đơn
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 min-w-[100px]">
                      Khách Hàng
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 min-w-[100px]">
                      Sản Phẩm
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 min-w-[100px]">
                      Trạng Thái
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order, index) => (
                    <tr key={index} className="hover:bg-gray-100">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {order.id}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {order.customer}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {order.product}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                            Object.keys(statusTranslations).find(
                              (key) => statusTranslations[key] === order.status
                            )
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="lg:hidden">
              {filteredOrders.map((order, index) => (
                <div
                  key={index}
                  className="p-4 hover:bg-gray-50 border-b border-gray-200"
                >
                  <div className="flex flex-col space-y-3">
                    <div className="text-sm font-medium text-gray-900">
                      #{order.id} - {order.customer}
                    </div>
                    <div className="text-sm text-gray-600">
                      Sản phẩm: {order.product}
                    </div>
                    <div>
                      <span
                        className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                          Object.keys(statusTranslations).find(
                            (key) => statusTranslations[key] === order.status
                          )
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Đơn hàng chờ xử lý */}
      <div className="bg-white rounded-sm shadow-md mb-4 sm:mb-6">
        <div className="bg-[#00D5BE] text-white p-3 rounded-t-sm flex items-center justify-between">
          <h2 className="text-base font-semibold">ĐƠN HÀNG CHỜ XỬ LÝ</h2>
        </div>
        {filteredPendingOrders.length === 0 ? (
          <div className="p-4 text-center text-gray-600 text-sm">
            Không có đơn hàng chờ xử lý
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 min-w-[100px]">
                      Mã Đơn
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 min-w-[100px]">
                      Khách Hàng
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 min-w-[100px]">
                      Sản Phẩm
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 min-w-[100px]">
                      Trạng Thái
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPendingOrders.map((order, index) => (
                    <tr key={index} className="hover:bg-gray-100">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {order.id}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {order.customer}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {order.product}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                            Object.keys(statusTranslations).find(
                              (key) => statusTranslations[key] === order.status
                            )
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="lg:hidden">
              {filteredPendingOrders.map((order, index) => (
                <div
                  key={index}
                  className="p-4 hover:bg-gray-50 border-b border-gray-200"
                >
                  <div className="flex flex-col space-y-3">
                    <div className="text-sm font-medium text-gray-900">
                      #{order.id} - {order.customer}
                    </div>
                    <div className="text-sm text-gray-600">
                      Sản phẩm: {order.product}
                    </div>
                    <div>
                      <span
                        className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                          Object.keys(statusTranslations).find(
                            (key) => statusTranslations[key] === order.status
                          )
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Sản phẩm mới nhập và khách hàng mới */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="bg-white rounded-sm shadow-md">
          <div className="bg-[#00D5BE] text-white p-3 rounded-t-sm">
            <h2 className="text-base font-semibold">SẢN PHẨM MỚI NHẬP</h2>
          </div>
          {stats.newProducts.length === 0 ? (
            <div className="p-4 text-center text-gray-600 text-sm">
              Không có sản phẩm mới nhập
            </div>
          ) : (
            <>
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 min-w-[100px]">
                        Sản Phẩm
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 min-w-[100px]">
                        Ngày Nhập
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stats.newProducts.map((product, index) => (
                      <tr key={index} className="hover:bg-gray-100">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {product.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="lg:hidden">
                {stats.newProducts.map((product, index) => (
                  <div
                    key={index}
                    className="p-4 hover:bg-gray-50 border-b border-gray-200"
                  >
                    <div className="flex flex-col space-y-3">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        Ngày nhập: {product.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="bg-white rounded-sm shadow-md">
          <div className="bg-[#00D5BE] text-white p-3 rounded-t-sm">
            <h2 className="text-base font-semibold">KHÁCH HÀNG MỚI</h2>
          </div>
          {filteredCustomers.length === 0 ? (
            <div className="p-4 text-center text-gray-600 text-sm">
              Không có khách hàng mới
            </div>
          ) : (
            <>
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 min-w-[100px]">
                        Mã KH
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 min-w-[100px]">
                        Tên
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 min-w-[100px]">
                        Ngày Đăng Ký
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredCustomers.map((customer, index) => (
                      <tr key={index} className="hover:bg-gray-100">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {customer.id}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {customer.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {customer.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="lg:hidden">
                {filteredCustomers.map((customer, index) => (
                  <div
                    key={index}
                    className="p-4 hover:bg-gray-50 border-b border-gray-200"
                  >
                    <div className="flex flex-col space-y-3">
                      <div className="text-sm font-medium text-gray-900">
                        #{customer.id} - {customer.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        Ngày đăng ký: {customer.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Top sản phẩm bán chạy và sản phẩm sắp hết hàng */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="bg-white rounded-sm shadow-md">
          <div className="bg-[#00D5BE] text-white p-3 rounded-t-sm">
            <h2 className="text-base font-semibold">TOP SẢN PHẨM BÁN CHẠY</h2>
          </div>
          {stats.topProducts.length === 0 ? (
            <div className="p-4 text-center text-gray-600 text-sm">
              Không có sản phẩm bán chạy
            </div>
          ) : (
            <>
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 min-w-[100px]">
                        Tên Sản Phẩm
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 min-w-[100px]">
                        Số Lượng Bán
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 min-w-[100px]">
                        Đánh Giá
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stats.topProducts.map((productItem, index) => (
                      <tr key={index} className="hover:bg-gray-100">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {productItem.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {productItem.sales}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {productItem.ratingAvg || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="lg:hidden">
                {stats.topProducts.map((productItem, index) => (
                  <div
                    key={index}
                    className="p-4 hover:bg-gray-50 border-b border-gray-200"
                  >
                    <div className="flex flex-col space-y-3">
                      <div className="text-sm font-medium text-gray-900">
                        {productItem.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        Số lượng bán: {productItem.sales}
                      </div>
                      <div className="text-sm text-gray-600">
                        Đánh giá: {productItem.ratingAvg || "N/A"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="bg-white rounded-sm shadow-md">
          <div className="bg-[#00D5BE] text-white p-3 rounded-t-sm">
            <h2 className="text-base font-semibold">SẢN PHẨM SẮP HẾT HÀNG</h2>
          </div>
          {stats.lowStockProducts.length === 0 ? (
            <div className="p-4 text-center text-gray-600 text-sm">
              Không có sản phẩm sắp hết hàng
            </div>
          ) : (
            <>
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 min-w-[100px]">
                        Sản Phẩm
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 min-w-[100px]">
                        Số Lượng Tồn
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stats.lowStockProducts.map((product, index) => (
                      <tr key={index} className="hover:bg-gray-100">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-red-600">
                          {product.stock}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="lg:hidden">
                {stats.lowStockProducts.map((product, index) => (
                  <div
                    key={index}
                    className="p-4 hover:bg-gray-50 border-b border-gray-200"
                  >
                    <div className="flex flex-col space-y-3">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-red-600">
                        Số lượng tồn: {product.stock}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Thông báo */}
      <div className="bg-white rounded-sm shadow-md mb-4 sm:mb-6">
        <div className="bg-[#00D5BE] text-white p-3 rounded-t-sm flex flex-col gap-3">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-base font-semibold">THÔNG BÁO</h2>
            {notifications.some((n) => n.isRead) && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-blue-500 text-white rounded-sm hover:bg-blue-600 transition-colors cursor-pointer text-base"
                aria-label="Đánh dấu tất cả đã đọc"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
            <input
              type="text"
              value={notificationSearch}
              onChange={handleNotificationSearch}
              placeholder="Tìm kiếm thông báo..."
              className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-800 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />
            <div ref={notificationWrapperRef} className="relative w-full">
              <div
                className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex items-center justify-between border-gray-300 bg-white text-gray-800 ${
                  isNotificationDropdownOpen ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() =>
                  setIsNotificationDropdownOpen(!isNotificationDropdownOpen)
                }
                aria-label="Chọn bộ lọc thông báo"
              >
                <span className="text-sm">
                  {notificationFilter === "all"
                    ? "Tất cả"
                    : notificationFilter === "read"
                    ? "Đã đọc"
                    : notificationFilter === "unread"
                    ? "Chưa đọc"
                    : typeTranslations[notificationFilter] ||
                      notificationFilter}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    isNotificationDropdownOpen ? "rotate-180" : ""
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
              {isNotificationDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-sm shadow-lg max-h-[40vh] overflow-y-auto">
                  {[
                    { value: "all", label: "Tất cả" },
                    { value: "read", label: "Đã đọc" },
                    { value: "unread", label: "Chưa đọc" },
                    { value: "order", label: "Đơn Hàng" },
                    { value: "inventory", label: "Tồn Kho" },
                    { value: "import_receipt", label: "Phiếu Nhập" },
                    { value: "export_receipt", label: "Phiếu Xuất" },
                  ].map((option) => (
                    <div
                      key={option.value}
                      className="p-2 text-gray-800 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setNotificationFilter(option.value);
                        setNotificationPage(1); // Reset về page 1 khi chọn bộ lọc
                        setIsNotificationDropdownOpen(false);
                      }}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {paginatedNotifications.length === 0 ? (
          <div className="p-4 text-center text-gray-600 text-sm">
            Không có thông báo phù hợp
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 min-w-[100px]">
                      Mã TB
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 min-w-[100px]">
                      Thông Báo
                    </th>
                    <th className="hidden md:block px-4 py-3 text-left text-sm font-medium text-gray-700 min-w-[100px]">
                      Thời Gian
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 min-w-[100px]">
                      Loại
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 min-w-[100px]">
                      Sự Kiện
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedNotifications.map((notification, index) => (
                    <tr
                      key={index}
                      className={`hover:bg-gray-100 cursor-pointer ${
                        !notification.isRead ? "bg-blue-50" : ""
                      }`}
                      onClick={() =>
                        !notification.isRead && markAsRead(notification.id)
                      }
                    >
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {notification.id}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {notification.message}
                      </td>
                      <td className="hidden md:block px-4 py-3 text-sm text-gray-900">
                        {notification.time}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getTypeColor(
                            notification.type
                          )}`}
                        >
                          {typeTranslations[notification.type] ||
                            notification.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <span>
                            {eventTranslations[notification.event] ||
                              notification.event}
                          </span>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="lg:hidden">
              {paginatedNotifications.map((notification, index) => (
                <div
                  key={index}
                  className={`p-4 hover:bg-gray-50 border-b border-gray-200 cursor-pointer ${
                    !notification.isRead ? "bg-blue-50" : ""
                  }`}
                  onClick={() =>
                    !notification.isRead && markAsRead(notification.id)
                  }
                >
                  <div className="flex flex-col space-y-3">
                    <div className="text-sm font-medium text-gray-900">
                      #{notification.id} - {notification.message}
                    </div>
                    <div className="text-sm text-gray-600">
                      Thời gian: {notification.time}
                    </div>
                    <div>
                      <span
                        className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getTypeColor(
                          notification.type
                        )}`}
                      >
                        Loại:{" "}
                        {typeTranslations[notification.type] ||
                          notification.type}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 flex items-center space-x-2">
                      <span>
                        Sự kiện:{" "}
                        {eventTranslations[notification.event] ||
                          notification.event}
                      </span>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between p-4">
              <button
                onClick={() =>
                  setNotificationPage((prev) => Math.max(prev - 1, 1))
                }
                disabled={notificationPage === 1}
                className="px-4 py-2 bg-gray-500 text-white rounded-sm hover:bg-gray-600 disabled:opacity-50 cursor-pointer text-sm"
                aria-label="Trang trước"
              >
                Trước
              </button>
              <span className="text-sm">
                Trang {notificationPage} /{" "}
                {Math.ceil(filteredNotifications.length / notificationsPerPage)}
              </span>
              <button
                onClick={() => setNotificationPage((prev) => prev + 1)}
                disabled={
                  notificationPage * notificationsPerPage >=
                  filteredNotifications.length
                }
                className="px-4 py-2 bg-gray-500 text-white rounded-sm hover:bg-gray-600 disabled:opacity-50 cursor-pointer text-sm"
                aria-label="Trang sau"
              >
                Sau
              </button>
            </div>
          </>
        )}
      </div>

      {/* Biểu đồ trực quan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-sm shadow-md">
          <div className="bg-[#00D5BE] text-white p-3 rounded-t-sm flex flex-col gap-3">
            <div className="flex items-center justify-between w-full">
              <h2 className="text-base font-semibold">
                DOANH THU THEO THỜI GIAN
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
              <div ref={periodWrapperRef} className="relative w-full">
                <div
                  className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex items-center justify-between border-gray-300 bg-white text-gray-800 ${
                    isPeriodDropdownOpen ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
                  aria-label="Chọn khoảng thời gian"
                >
                  <span className="text-sm">
                    {selectedPeriod === "today"
                      ? "Hôm nay"
                      : selectedPeriod === "week"
                      ? "Tuần này"
                      : selectedPeriod === "month"
                      ? "Tháng này"
                      : "Năm nay"}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isPeriodDropdownOpen ? "rotate-180" : ""
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
                {isPeriodDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-sm shadow-lg max-h-[40vh] overflow-y-auto">
                    {[
                      { value: "today", label: "Hôm nay" },
                      { value: "week", label: "Tuần này" },
                      { value: "month", label: "Tháng này" },
                      { value: "year", label: "Năm nay" },
                    ].map((option) => (
                      <div
                        key={option.value}
                        className="p-2 text-gray-800 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => {
                          setSelectedPeriod(option.value);
                          setIsPeriodDropdownOpen(false);
                        }}
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="w-full h-[250px] sm:h-[300px] lg:h-[350px]">
              <Bar
                data={getRevenueChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top",
                      labels: { font: { size: 12 } },
                    },
                    title: {
                      display: true,
                      text: [
                        "Doanh Thu",
                        getRevenueChartData.extremes.highest
                          ? `Cao nhất: ${getRevenueChartData.extremes.highest}`
                          : "Không có dữ liệu",
                        getRevenueChartData.extremes.lowest
                          ? `Thấp nhất: ${getRevenueChartData.extremes.lowest}`
                          : "Không có dữ liệu",
                      ],
                      font: { size: 14 },
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          return `${
                            context.label
                          }: ${context.raw.toLocaleString("vi-VN")} VNĐ`;
                        },
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function (value) {
                          return value.toLocaleString("vi-VN") + " VNĐ";
                        },
                        font: { size: 12 },
                      },
                    },
                    x: {
                      ticks: {
                        font: { size: 12 },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-sm shadow-md">
          <div className="bg-[#00D5BE] text-white p-3 rounded-t-sm">
            <h2 className="text-base font-semibold">
              CƠ CẤU DOANH THU THEO DANH MỤC
            </h2>
          </div>
          <div className="p-4">
            {categoryChartData.labels.length === 0 ? (
              <div className="text-center text-gray-600 text-sm">
                Không có dữ liệu doanh thu
              </div>
            ) : (
              <div className="w-full h-[250px] sm:h-[300px] lg:h-[350px]">
                <Pie
                  data={categoryChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top",
                        labels: { font: { size: 12 } },
                      },
                      title: {
                        display: true,
                        text: "Cơ Cấu Doanh Thu",
                        font: { size: 14 },
                      },
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            const total = context.dataset.data.reduce(
                              (sum, val) => sum + val,
                              0
                            );
                            const percentage = (
                              (context.raw / total) *
                              100
                            ).toFixed(2);
                            return `${
                              context.label
                            }: ${context.raw.toLocaleString(
                              "vi-VN"
                            )} VNĐ (${percentage}%)`;
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-sm shadow-md">
          <div className="bg-[#00D5BE] text-white p-3 rounded-t-sm">
            <h2 className="text-base font-semibold">
              XU HƯỚNG DOANH THU NĂM 2025
            </h2>
          </div>
          <div className="p-4">
            {stats.revenue.year.monthly.every((item) => item.revenue === 0) ? (
              <div className="text-center text-gray-600 text-sm">
                Không có dữ liệu doanh thu
              </div>
            ) : (
              <div className="w-full h-[250px] sm:h-[300px] lg:h-[350px]">
                <Line
                  data={yearlyTrendChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top",
                        labels: { font: { size: 12 } },
                      },
                      title: {
                        display: true,
                        text: "Xu Hướng Doanh Thu Năm 2025",
                        font: { size: 14 },
                      },
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            return `${
                              context.label
                            }: ${context.raw.toLocaleString("vi-VN")} VNĐ`;
                          },
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function (value) {
                            return value.toLocaleString("vi-VN") + " VNĐ";
                          },
                          font: { size: 12 },
                        },
                      },
                      x: {
                        ticks: {
                          font: { size: 12 },
                        },
                      },
                    },
                  }}
                />
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-sm shadow-md">
          <div className="bg-[#00D5BE] text-white p-3 rounded-t-sm">
            <h2 className="text-base font-semibold">
              PHÂN BỐ SẢN PHẨM THEO DANH MỤC
            </h2>
          </div>
          <div className="p-4">
            {productCategoryChartData.labels.length === 0 ? (
              <div className="text-center text-gray-600 text-sm">
                Không có dữ liệu sản phẩm
              </div>
            ) : (
              <div className="w-full h-[250px] sm:h-[300px] lg:h-[350px]">
                <Pie
                  data={productCategoryChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top",
                        labels: { font: { size: 12 } },
                      },
                      title: {
                        display: true,
                        text: "Phân Bố Sản Phẩm",
                        font: { size: 14 },
                      },
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            const total = context.dataset.data.reduce(
                              (sum, val) => sum + val,
                              0
                            );
                            const percentage = (
                              (context.raw / total) *
                              100
                            ).toFixed(2);
                            return `${context.label}: ${context.raw} sản phẩm (${percentage}%)`;
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
