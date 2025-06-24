import React, { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

const CollapsibleSection = ({ title, children, color }) => {
  const [isOpen, setIsOpen] = useState(true);

  const titleStyles = {
    "teal": "text-teal-400",
    "sky": "text-sky-400",
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left py-2"
      >
        <h3 className={`${titleStyles[color]} font-semibold`}>{title}</h3>
        <ChevronDownIcon
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-500 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <pre className="text-sm whitespace-pre-wrap break-words bg-black/30 p-4 rounded-lg font-mono mt-2">
            {children}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection; 