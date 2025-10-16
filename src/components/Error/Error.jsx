import React from "react";

const Error = ({ message, retry }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center w-80">
        <span className="text-4xl text-red-500">⚡</span>
        <p className="text-gray-700 text-sm mt-2">
          {message ||
            "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."}
        </p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors cursor-pointer"
          onClick={retry}
        >
          Thử lại
        </button>
        <p className="text-gray-500 text-xs mt-2">
          Vẫn gặp lỗi? Hãy liên hệ với chúng tôi qua email:
          <a href="mailto:admin@techzone.com" className="text-blue-500">
            admin@techzone.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default Error;
