"use client";

import { forwardRef } from "react";

const variants = {
  primary:
    "btn-primary",
  secondary:
    "btn-secondary",
  ghost:
    "btn-ghost",
  danger:
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-danger border-none rounded-[10px] cursor-pointer transition-all duration-200 hover:bg-red-600 hover:-translate-y-px",
};

const sizes = {
  sm: "!px-3 !py-1.5 !text-xs !gap-1.5",
  md: "",
  lg: "!px-6 !py-3 !text-[15px]",
};

const Button = forwardRef(function Button(
  { variant = "primary", size = "md", className = "", children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
