import Navbar from "../navbar/Navbar";
import MobileNavbar from "../navbar/MobileNavbar";
import { useSelector } from "react-redux";
import type { RootState } from "@/shared/redux/store/store";

const WithNavbar = ({ children }: { children: React.ReactNode }) => {
  
  const { user } = useSelector((state: RootState) => state.auth);
  const userRole = user?.roles;
  const isCateringAccount = userRole?.includes("Catering") || false;

  return (
    <main className="relative bg-white dark:bg-background">
      <div className="md:block hidden fixed top-6 w-2xl left-1/2 -translate-x-1/2 z-40">
        <Navbar />
      </div>
      <main className="bg-white dark:bg-background min-h-screen dark:bg-gradient-to-b dark:from-page-gradient-start dark:via-page-gradient-middle dark:to-page-gradient-end text-text-body-main transition-colors duration-500 py-4">
        <main className={`${!isCateringAccount ? "pb-20" : "pb-0"} md:pb-0 md:pt-20 bg-white dark:bg-background`}>{children}</main>
      </main>
      {!isCateringAccount && (
        <footer className="md:hidden block fixed bottom-0 w-full">
          <MobileNavbar />
        </footer>
      )}
    </main>
  );
};

export default WithNavbar;
