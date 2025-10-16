const ConfirmExitModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận hủy",
  message = "Bạn có chắc muốn hủy? Dữ liệu sẽ không được lưu.",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto">
        <h3 className="text-lg font-medium text-gray-900 p-6 border-b border-gray-200">
          {title}
        </h3>
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-6">{message}</p>
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 cursor-pointer transition-colors duration-200 w-full sm:w-auto"
              onClick={onClose}
              aria-label="Tiếp tục chỉnh sửa"
            >
              Tiếp tục
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 cursor-pointer transition-colors duration-200 w-full sm:w-auto"
              onClick={onConfirm}
              aria-label="Xác nhận hủy"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmExitModal;
