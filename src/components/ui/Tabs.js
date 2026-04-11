"use client";

import { useState } from "react";

export default function Tabs({ tabs, defaultTab, className = "" }) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.key);

  const activeTab = tabs.find((t) => t.key === active);

  return (
    <div className={className}>
      <div className="flex items-center gap-1 border-b border-border mb-5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`
              px-4 py-2.5 text-sm font-medium transition-all duration-150 relative
              ${active === tab.key
                ? "text-accent"
                : "text-text-muted hover:text-text-sec"
              }
            `}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`ml-1.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
                active === tab.key
                  ? "bg-accent-light text-accent-text"
                  : "bg-surface-muted text-text-muted"
              }`}>
                {tab.count}
              </span>
            )}
            {active === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
            )}
          </button>
        ))}
      </div>
      {activeTab?.content}
    </div>
  );
}
