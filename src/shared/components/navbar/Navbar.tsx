import { NAV_ITEMS } from "@/constants";
import { NavLink, useLocation } from "react-router-dom";
import logo from "@/assets/TCCD_logo.svg";
import { useState } from "react";
import LogoutModal from "./LogoutModal";
import { useSelector } from "react-redux";
import type { RootState } from "@/shared/redux/store/store";

const Navbar = () => {
  const { pathname } = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { user } = useSelector((state: RootState) => state.auth);
  const userRole = user?.roles;
  const isCateringAccount = userRole?.includes("Catering") || false;

  const filteredNavItems = isCateringAccount
    ? NAV_ITEMS.filter(item => !(item.to === "/users" || item.to === "/form-builder" || item.to === '/judging-system/events' || item.to === "/"))
    : NAV_ITEMS;
    
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
          bg-surface-glass-bg/80
          backdrop-blur supports-[backdrop-filter]:backdrop-blur-md
          shadow-[0_6px_22px_rgba(0,0,0,0.05)]
          px-1.5 py-1 flex items-center gap-4
        "
      >
        {/* Tabs */}
        {filteredNavItems.map(({ to, title }, index) => {
          const active =
            to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <NavLink
              key={title}
              to={to}
              aria-current={active ? "page" : undefined}
              className={`
                group flex-1 text-center rounded-full px-2.5 py-1.5
                text-sm font-semibold
                transition-all duration-150
                outline-none ring-0 focus-visible:ring-2 focus-visible:ring-primary/35
                ${
                  active
                    ? "bg-muted-primary/10 text-primary shadow-inner"
                    : "text-text-muted-foreground hover:bg-muted-primary/5 hover:text-primary"
                }
                ${index === 2 ? "mr-10" : index === 3 ? "ml-10" : ""}
              `}
            >
              <span className="inline-block whitespace-nowrap">{title}</span>
            </NavLink>
          );
        })}
        <button
          type="button"
          className="
            group flex-1 text-center rounded-full px-2.5 py-1.5
            transition-all duration-150 cursor-pointer
            outline-none ring-0 focus-visible:ring-2 focus-visible:ring-primary/35
            text-text-muted-foreground hover:bg-muted-primary/5 hover:text-primary
          "
          onClick={() => setShowLogoutModal(true)}
        >
          <span className="inline-block text-sm font-semibold">Logout</span>
        </button>
        {/* Center logo — refined floating style */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-7">
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
                  className="block h-10 w-10" /* slightly smaller */
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
