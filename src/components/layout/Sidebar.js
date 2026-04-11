"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/constants/navigation";

const ICONS = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  workspaces: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4a2 2 0 012-2h5l2 2h9a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4z" />
      <path d="M12 11v6" />
      <path d="M9 14h6" />
    </svg>
  ),
  compare: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  analytics: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 21H4a1 1 0 01-1-1V3" />
      <path d="M7 14l4-4 4 4 5-5" />
    </svg>
  ),
  reports: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
      <path d="M14 2v6h6" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
};

function NavItem({ href, label, icon, isActive }) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium
        transition-all duration-150 group
        ${isActive
          ? "bg-accent-light text-accent-text"
          : "text-text-sec hover:text-text hover:bg-surface-muted"
        }
      `}
    >
      <span className={`flex-shrink-0 ${isActive ? "text-accent" : "text-text-muted group-hover:text-text-sec"}`}>
        {ICONS[icon]}
      </span>
      {label}
    </Link>
  );
}

function NavSection({ title, links, pathname }) {
  return (
    <div className="mb-6">
      <p className="section-title px-3 mb-2">{title}</p>
      <div className="flex flex-col gap-0.5">
        {links.map((link) => (
          <NavItem
            key={link.href}
            {...link}
            isActive={pathname === link.href || pathname.startsWith(link.href + "/")}
          />
        ))}
      </div>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed top-0 left-0 h-screen bg-bg border-r border-border flex flex-col z-40"
      style={{ width: "var(--sidebar-width)" }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border-light">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 21H4a1 1 0 01-1-1V3" />
              <path d="M7 14l4-4 4 4 5-5" />
            </svg>
          </div>
          <div>
            <span className="text-[15px] font-semibold text-text tracking-tight">
              P1 Finance
            </span>
            <span className="block text-[10.5px] text-text-muted font-medium tracking-wide uppercase">
              Research Copilot
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pt-5">
        <NavSection title="Main" links={NAV_LINKS.main} pathname={pathname} />
        <NavSection title="Research" links={NAV_LINKS.research} pathname={pathname} />
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-border-light">
        {NAV_LINKS.system.map((link) => (
          <NavItem
            key={link.href}
            {...link}
            isActive={pathname === link.href}
          />
        ))}
      </div>
    </aside>
  );
}
