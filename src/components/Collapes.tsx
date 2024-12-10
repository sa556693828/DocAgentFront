import React, { useState } from "react";

interface CollapseProps {
  header: React.ReactNode;
  children: React.ReactNode;
  isOpen?: boolean;
  isTrain?: boolean;
  onChange?: (isOpen: boolean) => void;
}

const Collapse: React.FC<CollapseProps> = ({
  header,
  children,
  isTrain = false,
  isOpen = false,
  onChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(isOpen);

  const toggleCollapse = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onChange?.(newState);
  };

  return (
    <div className="border border-gray-200 rounded-lg mb-2 overflow-hidden w-[80%]">
      <button
        className="w-full px-4 py-3 flex justify-between items-center bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
        onClick={toggleCollapse}
      >
        <span className="text-lg font-medium">{header}</span>
        <div className="flex items-center gap-2">
          {isTrain && (
            <span className="text-base tracking-wider">監督訓練模型</span>
          )}

          <svg
            className={`w-3 h-3 transition-transform duration-200 ${
              isExpanded ? "transform rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>
      <div
        className={`transition-all duration-200 ${
          isExpanded ? "max-h-[70vh] opacity-100" : "max-h-0 opacity-0"
        } overflow-y-auto`}
      >
        <div className="px-10 py-6 bg-white">{children}</div>
      </div>
    </div>
  );
};

export default Collapse;
