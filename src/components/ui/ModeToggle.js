"use client";

import { useState } from "react";

const modes = [
  { key: "hybrid", label: "Hybrid", desc: "Live + Research Base" },
  { key: "live", label: "Live Web", desc: "Real-time sources" },
  { key: "knowledge", label: "Research Base", desc: "Stored sources" },
];

export default function ModeToggle({ value, onChange, className = "" }) {
  const [active, setActive] = useState(value || "hybrid");

  function handleChange(key) {
    setActive(key);
    onChange?.(key);
  }

  return (
    <div className={`flex items-center bg-surface-muted rounded-lg p-0.5 ${className}`}>
      {modes.map((mode) => (
        <button
          key={mode.key}
          onClick={() => handleChange(mode.key)}
          className={`
            px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150
            ${active === mode.key
              ? "bg-bg text-text shadow-xs"
              : "text-text-muted hover:text-text-sec"
            }
          `}
          title={mode.desc}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
