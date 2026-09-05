import { Link, useLocation } from "react-router-dom";
import { TbLogout2 } from "react-icons/tb";
import { useState } from "react";
import LogoutModal from "./LogoutModal";
import { useSelector } from "react-redux";
import type { RootState } from "@/shared/redux/store/store";
import { getNavItems } from "@/shared/utils/access";

const MobileNavbar = () => {
  const { pathname } = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  // Tier-driven nav — single source of truth in access.ts.
  // (Was: raw "VolunteerMember"/"Catering" string checks, which gave
  // heads/judges/HR members navbars full of links they can't open.)
  const filteredNavItems = getNavItems(user);

  return (
    <nav className="w-full bg-surface-glass-bg relative flex justify-between items-center px-[6%] h-16 border border-surface-glass-border/20 rounded-t-3xl transform-gpu">
      <LogoutModal
        showLogoutModal={showLogoutModal}
        setShowLogoutModal={setShowLogoutModal}
      />
      {filteredNavItems.map(({ icon: Icon, to, title }, index) => {
        const active = to === "/home" ? pathname === "/home" : pathname.startsWith(to);
        return (
          <Link
            className={`${active ? "text-primary" : "text-secondary"
              } inline-flex flex-col items-center gap-1 ${index === 2 ? "mr-0" : index === 3 ? "ml-0" : ""
              } cursor-pointer`}
            key={title}
            to={to}
          >
            <Icon size={22} />
            <span
              className={`${active ? "text-primary" : "text-text-muted-foreground"
                } text-xs`}
            >
              {title}
            </span>
          </Link>
        );
      })}
      <div
        className="inline-flex flex-col items-center gap-1 cursor-pointer group"
        onClick={() => setShowLogoutModal(true)}
      >
        <TbLogout2
          size={22}
          className="text-secondary group-hover:text-primary transition-colors duration-200"
        />
        <span className="text-xs text-text-muted-foreground">Logout</span>
      </div>
    </nav>
  );
};

export default MobileNavbar;