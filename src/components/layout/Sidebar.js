"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/constants/navigation";
import { useAuth } from "@/features/auth/AuthProvider";
import { logout } from "@/features/auth/actions";

const ICONS = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  market: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 21H4a1 1 0 01-1-1V3" />
      <path d="M7 14l4-4 4 4 5-5" />
    </svg>
  ),
  portfolio: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="16" />
      <line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  ),
  news: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
      <line x1="6" y1="8" x2="18" y2="8" />
      <line x1="6" y1="12" x2="14" y2="12" />
      <line x1="6" y1="16" x2="10" y2="16" />
    </svg>
  ),
  advisor: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
      <circle cx="12" cy="10" r="1" fill="currentColor" />
      <circle cx="8" cy="10" r="1" fill="currentColor" />
      <circle cx="16" cy="10" r="1" fill="currentColor" />
    </svg>
  ),
  goals: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
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
  const { user } = useAuth();

  const userInitial = user?.user_metadata?.full_name?.[0] ||
    user?.email?.[0]?.toUpperCase() ||
    "?";
  const userName = user?.user_metadata?.full_name || user?.email || "User";
  const userEmail = user?.email || "";

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
              Fundwise
            </span>
            <span className="block text-[10.5px] text-text-muted font-medium tracking-wide uppercase">
              Smart Investing
            </span>
          </div>
        </Link>
      </div>

      {/* Search trigger (Cmd+K) */}
      <div className="px-3 pt-4">
        <button
          type="button"
          onClick={() => {
            const event = new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true });
            window.dispatchEvent(event);
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border text-left hover:border-accent hover:shadow-xs transition-all group"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted group-hover:text-text-sec flex-shrink-0">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="flex-1 text-[12.5px] text-text-muted group-hover:text-text-sec">
            Search
          </span>
          <kbd className="text-[9.5px] font-mono font-semibold text-text-muted bg-surface-muted border border-border-light px-1.5 py-0.5 rounded">
            {typeof navigator !== "undefined" && /Mac/.test(navigator.platform) ? "\u2318K" : "Ctrl K"}
          </kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pt-5">
        <NavSection title="Overview" links={NAV_LINKS.main} pathname={pathname} />
        <NavSection title="Invest" links={NAV_LINKS.invest} pathname={pathname} />
      </nav>

      {/* Bottom — Settings + User */}
      <div className="border-t border-border-light">
        <div className="px-3 pt-3 pb-2">
          {NAV_LINKS.system.map((link) => (
            <NavItem
              key={link.href}
              {...link}
              isActive={pathname === link.href}
            />
          ))}
        </div>

        {/* User Profile */}
        <div className="px-3 pb-3">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface group">
            <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center text-accent text-xs font-bold flex-shrink-0">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-medium text-text truncate">{userName}</p>
              <p className="text-[10.5px] text-text-muted truncate">{userEmail}</p>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger-light transition-colors"
                title="Sign out"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  );
}
