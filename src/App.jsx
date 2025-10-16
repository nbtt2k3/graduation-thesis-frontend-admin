import React, { useEffect, useState, useContext } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import {
  Dashboard,
  Category,
  CreateCategory,
  UpdateCategory,
  Brand,
  CreateBrand,
  UpdateBrand,
  Order,
  Product,
  CreateProduct,
  CreateProductItem,
  UpdateProduct,
  Inventory,
  Customer,
  Login,
  Branch,
  Supplier,
  CreateBranch,
  UpdateBranch,
  CreateSupplier,
  UpdateSupplier,
  Discount,
  Coupon,
  Voucher,
  UpdateDiscount,
  CreateDiscount,
  CreateCoupon,
  UpdateCoupon,
  CreateVoucher,
  UpdateVoucher,
  ImportReceipt,
  CreateImportReceipt,
  UpdateImportReceipt,
  ExportReceipt,
  CreateExportReceipt,
  UpdateExportReceipt,
  UserProfile,
} from "./pages";
import { Header, Sidebar, Error } from "./components";
import { routeTitleMap } from "./config/navigationConfig";
import { AdminTechZoneContext } from "./context/AdminTechZoneContext";

const ProtectedRoute = ({ children }) => {
  const { authToken } = useContext(AdminTechZoneContext);

  if (!authToken) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  const { error } = useContext(AdminTechZoneContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState({});

  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  useEffect(() => {
    if (!isLoginPage) {
      const matchedPath =
        Object.keys(routeTitleMap).find(
          (path) =>
            location.pathname === path ||
            location.pathname.startsWith(path + "/")
        ) || "/";

      const title = routeTitleMap[matchedPath] || "Dashboard";

      setCurrentPage({
        path: location.pathname,
        title: title,
      });
    }
  }, [location.pathname, isLoginPage]);

  // Render error component if there's an error
  if (error.hasError) {
    return (
      <Error
        message={
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
        }
        retry={() => {
          window.location.reload();
        }}
      />
    );
  }

  return (
    <>
      {isLoginPage ? (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
          <Routes>
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50">
          <div className="flex h-screen">
            <Sidebar
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                currentPageTitle={currentPage.title}
              />
              <main className="flex-1 overflow-y-auto bg-white">
                <Routes>
                  <Route
                    path="/"
                    exact={true}
                    element={<Navigate to="/dashboard" />}
                  />
                  <Route
                    path="/dashboard"
                    exact={true}
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/products/brand-management"
                    element={
                      <ProtectedRoute>
                        <Brand />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/products/brand-management/add"
                    element={
                      <ProtectedRoute>
                        <CreateBrand />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/products/brand-management/edit/:brandId"
                    element={
                      <ProtectedRoute>
                        <UpdateBrand />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/products/category-management"
                    element={
                      <ProtectedRoute>
                        <Category />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/products/category-management/add"
                    element={
                      <ProtectedRoute>
                        <CreateCategory />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/products/category-management/edit/:categoryId"
                    element={
                      <ProtectedRoute>
                        <UpdateCategory />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/products/product-management"
                    element={
                      <ProtectedRoute>
                        <Product />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/products/product-management/add"
                    element={
                      <ProtectedRoute>
                        <CreateProduct />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/products/product-management/add-variant/:productId"
                    element={
                      <ProtectedRoute>
                        <CreateProductItem />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/products/product-management/edit/:productId"
                    element={
                      <ProtectedRoute>
                        <UpdateProduct />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <Order />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/customers"
                    element={
                      <ProtectedRoute>
                        <Customer />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/warehouse/warehouse-management"
                    element={
                      <ProtectedRoute>
                        <Inventory />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/warehouse/branch-management"
                    element={
                      <ProtectedRoute>
                        <Branch />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/warehouse/branch-management/add"
                    element={
                      <ProtectedRoute>
                        <CreateBranch />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/warehouse/branch-management/edit/:branchId"
                    element={
                      <ProtectedRoute>
                        <UpdateBranch />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/warehouse/supplier-management"
                    element={
                      <ProtectedRoute>
                        <Supplier />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/warehouse/supplier-management/add"
                    element={
                      <ProtectedRoute>
                        <CreateSupplier />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/warehouse/supplier-management/edit/:supplierId"
                    element={
                      <ProtectedRoute>
                        <UpdateSupplier />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/promotions/discount-management"
                    element={
                      <ProtectedRoute>
                        <Discount />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/promotions/discount-management/add"
                    element={
                      <ProtectedRoute>
                        <CreateDiscount />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/promotions/discount-management/edit/:discountId"
                    element={
                      <ProtectedRoute>
                        <UpdateDiscount />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/promotions/coupon-management"
                    element={
                      <ProtectedRoute>
                        <Coupon />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/promotions/coupon-management/add"
                    element={
                      <ProtectedRoute>
                        <CreateCoupon />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/promotions/coupon-management/edit/:couponId"
                    element={
                      <ProtectedRoute>
                        <UpdateCoupon />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/promotions/voucher-management"
                    element={
                      <ProtectedRoute>
                        <Voucher />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/promotions/voucher-management/add"
                    element={
                      <ProtectedRoute>
                        <CreateVoucher />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/promotions/voucher-management/edit/:voucherId"
                    element={
                      <ProtectedRoute>
                        <UpdateVoucher />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/warehouse/import-receipt-management"
                    element={
                      <ProtectedRoute>
                        <ImportReceipt />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/warehouse/import-receipt-management/add"
                    element={
                      <ProtectedRoute>
                        <CreateImportReceipt />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/warehouse/import-receipt-management/edit/:importReceiptId"
                    element={
                      <ProtectedRoute>
                        <UpdateImportReceipt />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/warehouse/export-receipt-management"
                    element={
                      <ProtectedRoute>
                        <ExportReceipt />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/warehouse/export-receipt-management/add"
                    element={
                      <ProtectedRoute>
                        <CreateExportReceipt />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/warehouse/export-receipt-management/edit/:exportReceiptId"
                    element={
                      <ProtectedRoute>
                        <UpdateExportReceipt />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/users/customers"
                    element={
                      <ProtectedRoute>
                        <Customer />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <UserProfile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                  />
                </Routes>
              </main>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
