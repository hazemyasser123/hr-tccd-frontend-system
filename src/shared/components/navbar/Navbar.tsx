import { getNavItems } from "@/shared/utils/access";
import { NavLink, useLocation } from "react-router-dom";
import logo from "@/assets/TCCD_logo.svg";
import { useState } from "react";
import LogoutModal from "./LogoutModal";
import { useSelector } from "react-redux";
import type { RootState } from "@/shared/redux/store/store";

const tabClass = (active: boolean) => `
  group flex-1 text-center rounded-full px-2.5 py-1.5
  text-sm font-semibold whitespace-nowrap
  transition-all duration-150
  outline-none ring-0 focus-visible:ring-2 focus-visible:ring-primary/35
  ${active
    ? "bg-muted-primary/10 text-primary shadow-inner"
    : "text-text-muted-foreground hover:bg-muted-primary/5 hover:text-primary"
  }
`;

const Navbar = () => {
  const { pathname } = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { user } = useSelector((state: RootState) => state.auth);

  const filteredNavItems = getNavItems(user);

  const renderTab = ({ to, title }: { to: string; title: string }) => {
    const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
    return (
      <NavLink
        key={title}
        to={to}
        aria-current={active ? "page" : undefined}
        className={tabClass(active)}
      >
        <span className="inline-block">{title}</span>
      </NavLink>
    );
  };

  const logoutTab = (
    <button
      key="logout"
      type="button"
      className={tabClass(false) + " cursor-pointer"}
      onClick={() => setShowLogoutModal(true)}
    >
      <span className="inline-block">Logout</span>
    </button>
  );

  // Split ALL rendered tabs (including Logout) into two equal-width
  // groups around a fixed center gap so the floating logo (centered on the
  // whole nav) stays visually centered, regardless of how many tabs end up
  // on each side.
  const allTabs = [...filteredNavItems.map(renderTab), logoutTab];
  const midpoint = Math.ceil(allTabs.length / 2);
  const leftItems = allTabs.slice(0, midpoint);
  const rightItems = allTabs.slice(midpoint);

  return (
    <header className="w-full flex justify-center px-3 py-3">
      <LogoutModal
        showLogoutModal={showLogoutModal}
        setShowLogoutModal={setShowLogoutModal}
      />
      <nav
        className="
          relative w-full max-w-2xl
          rounded-full border border-surface-glass-border/20
          bg-surface-glass-bg/95
          backdrop-blur-sm transform-gpu
          shadow-[0_6px_22px_rgba(0,0,0,0.05)]
          px-1.5 py-1 flex items-center gap-2
        "
      >
        <div className="flex flex-1 items-center gap-2">{leftItems}</div>
        {/* reserved gap the floating logo sits above */}
        <div className="w-14 shrink-0" aria-hidden="true" />
        <div className="flex flex-1 items-center gap-2">{rightItems}</div>
        {/* Center logo — refined floating style */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-3">
          <div className="relative">
            {/* soft pedestal shadow */}
            <div
              aria-hidden
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2.5 w-14 rounded-full bg-black/10 blur-md"
            />
            {/* badge */}
            <div className="rounded-full p-1.5 bg-surface-glass-bg border border-surface-glass-border/20 shadow-[0_8px_20px_rgba(0,0,0,0.08)]">
              <div className="rounded-full p-1 bg-gradient-to-b from-surface-glass-bg to-muted-primary/5">
                <img
                  src={logo}
                  alt="TCCD"
                  className="block h-10 w-10"
                />
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
