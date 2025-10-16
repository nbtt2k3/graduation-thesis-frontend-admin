import {
  Users,
  Package,
  BarChart2,
  FileText,
  Truck,
  ShoppingCart,
  Percent,
} from "lucide-react";

export const navigationItems = [
  {
    icon: BarChart2,
    label: "Tổng quan",
    path: "/dashboard",
  },
  {
    icon: Package,
    label: "Sản phẩm",
    path: "/products",
    subitems: [
      { label: "Quản lý thương hiệu", path: "/products/brand-management" },
      { label: "Quản lý danh mục", path: "/products/category-management" },
      { label: "Quản lý sản phẩm", path: "/products/product-management" },
    ],
  },
  {
    icon: FileText,
    label: "Quản lý kho",
    path: "/warehouse",
    subitems: [
      { label: "Quản lý kho", path: "/warehouse/warehouse-management" },
      {
        label: "Quản lý nhập kho",
        path: "/warehouse/import-receipt-management",
      },
      {
        label: "Quản lý xuất kho",
        path: "/warehouse/export-receipt-management",
      },
      { label: "Quản lý nhà cung cấp", path: "/warehouse/supplier-management" },
      { label: "Quản lý chi nhánh", path: "/warehouse/branch-management" },
    ],
  },
  {
    icon: Percent,
    label: "Ưu đãi",
    path: "/promotions",
    subitems: [
      { label: "Quản lý discount", path: "/promotions/discount-management" },
      { label: "Quản lý voucher", path: "/promotions/voucher-management" },
      { label: "Quản lý coupon", path: "/promotions/coupon-management" },
    ],
  },
  {
    icon: ShoppingCart,
    label: "Đơn hàng",
    path: "/orders",
  },
  {
    icon: Users,
    label: "Người dùng",
    path: "/users",
    subitems: [{ label: "Quản lý khách hàng", path: "/users/customers" }],
  },
];

export const createRouteTitleMap = (items) => {
  const routeMap = {
    "/": "Tổng quan",
    "/dashboard": "Tổng quan",
  };

  const addRoutes = (items) => {
    items.forEach((item) => {
      routeMap[item.path] = item.label;

      if (item.subitems) {
        item.subitems.forEach((subitem) => {
          routeMap[subitem.path] = subitem.label;

          if (subitem.path.includes("category-management")) {
            routeMap[`${subitem.path}/add`] = "Tạo danh mục";
            routeMap[`${subitem.path}/edit/:categoryId`] = "Chỉnh sửa danh mục";
          }

          if (subitem.path.includes("brand-management")) {
            routeMap[`${subitem.path}/add`] = "Tạo thương hiệu";
            routeMap[`${subitem.path}/edit/:brandId`] = "Chỉnh sửa thương hiệu";
          }

          if (subitem.path.includes("product-management")) {
            routeMap[`${subitem.path}/add`] = "Tạo sản phẩm";
            routeMap[`${subitem.path}/edit/:productId`] = "Chỉnh sửa sản phẩm";
          }

          if (subitem.path.includes("warehouse-management")) {
            routeMap[`${subitem.path}/add`] = "Tạo kho";
            routeMap[`${subitem.path}/edit/:warehouseId`] = "Chỉnh sửa kho";
          }

          if (subitem.path.includes("supplier-management")) {
            routeMap[`${subitem.path}/add`] = "Tạo nhà cung cấp";
            routeMap[`${subitem.path}/edit/:supplierId`] =
              "Chỉnh sửa nhà cung cấp";
          }

          if (subitem.path.includes("branch-management")) {
            routeMap[`${subitem.path}/add`] = "Tạo chi nhánh";
            routeMap[`${subitem.path}/edit/:branchId`] = "Chỉnh sửa chi nhánh";
          }

          if (subitem.path.includes("discount-management")) {
            routeMap[`${subitem.path}/add`] = "Tạo giảm giá";
            routeMap[`${subitem.path}/edit/:discountId`] = "Chỉnh sửa giảm giá";
          }

          if (subitem.path.includes("voucher-management")) {
            routeMap[`${subitem.path}/add`] = "Tạo voucher";
            routeMap[`${subitem.path}/edit/:voucherId`] = "Chỉnh sửa voucher";
          }

          if (subitem.path.includes("coupon-management")) {
            routeMap[`${subitem.path}/add`] = "Tạo coupon";
            routeMap[`${subitem.path}/edit/:couponId`] = "Chỉnh sửa coupon";
          }
        });
      }
    });
  };

  addRoutes(items);
  return routeMap;
};

export const routeTitleMap = createRouteTitleMap(navigationItems);
