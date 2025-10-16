// components/LoadingSpinner.jsx
const LoadingSpinner = () => {
    return (
      <div className="p-3 sm:p-6 bg-white min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-500">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  };
  
  export default LoadingSpinner;
  