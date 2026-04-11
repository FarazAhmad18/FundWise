"use client";

import { forwardRef } from "react";

const Input = forwardRef(function Input(
  { label, hint, error, className = "", ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-text-sec mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`input-field ${error ? "!border-danger focus:!shadow-[0_0_0_3px_var(--danger-light)]" : ""} ${className}`}
        {...props}
      />
      {hint && !error && (
        <p className="text-xs text-text-muted mt-1.5">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-danger mt-1.5">{error}</p>
      )}
    </div>
  );
});

export default Input;
