"use client";

import Sidebar from "./Sidebar";
import CommandPalette from "@/components/ui/CommandPalette";

export default function AppShell({ children }) {
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <main
        className="flex-1 min-w-0 overflow-y-auto"
        style={{ marginLeft: "var(--sidebar-width)" }}
      >
        {children}
      </main>
      <CommandPalette />
    </div>
  );
}
