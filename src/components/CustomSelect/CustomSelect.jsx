"use client";

import { useState, useEffect, useRef } from "react";

const CustomSelect = ({
  name,
  options,
  placeholder,
  value,
  onChange,
  disabled,
  withSearch = false,
  error,
  required,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (value) {
      const selected = options.find((option) => option.value === value);
      setSelectedOption(selected ? selected.label : "");
    } else {
      setSelectedOption("");
    }
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue) => {
    const option = options.find((opt) => opt.value === optionValue);
    setSelectedOption(option ? option.label : "");
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const filteredOptions = withSearch
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  return (
    <div>
      <label
        className="block text-sm font-medium text-gray-700 mb-2"
        htmlFor={name}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div ref={wrapperRef} className="relative w-full">
        <div
          className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex items-center justify-between ${
            isOpen
              ? "ring-2 ring-blue-500"
              : error
              ? "border-red-600"
              : "border-gray-300"
          } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={`${name}-listbox`}
          aria-disabled={disabled}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              !disabled && setIsOpen(!isOpen);
            }
          }}
        >
          <span className="text-gray-700">{selectedOption || placeholder}</span>
          <svg
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
        {isOpen && (
          <div
            id={`${name}-listbox`}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-sm shadow-lg max-h-60 overflow-y-auto"
            role="listbox"
          >
            {withSearch && (
              <div className="p-2">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Tìm kiếm tùy chọn"
                />
              </div>
            )}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelect(option.value)}
                  role="option"
                  aria-selected={value === option.value}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="p-2 text-gray-500">
                Không có tùy chọn nào phù hợp
              </div>
            )}
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
  );
};

export default CustomSelect;
