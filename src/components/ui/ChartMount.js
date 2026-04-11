"use client";

import { useState, useEffect } from "react";

/**
 * Gates child rendering until after client mount. Used to avoid SSR of
 * Recharts components, which rely on ResizeObserver (not available on
 * the server in Node 20+). Without this wrapper, any page using
 * ResponsiveContainer throws "Internal Server Error" during SSR.
 *
 * On the server we render the provided `fallback` (a skeleton by default)
 * so the layout height stays stable and hydration matches.
 */
export default function ChartMount({ children, fallback = null, className = "" }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={className}>{fallback}</div>;
  }

  return <div className={className}>{children}</div>;
}
