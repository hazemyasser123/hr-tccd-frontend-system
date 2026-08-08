import { IoChevronBack } from "react-icons/io5";

interface EventDetailsHeaderProps {
  onBack: () => void;
  isAdmin: boolean;
  activeTab?: "attendance" | "vest" | "catering" | "companies";
  onTabChange?: (
    tab: "attendance" | "vest" | "catering" | "companies"
  ) => void;
}

const EventDetailsHeader = ({
  onBack,
  isAdmin,
  activeTab,
  onTabChange,
}: EventDetailsHeaderProps) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-0 pb-4">
        <button
          onClick={onBack}
          className="flex items-center text-dashboard-heading hover:text-primary transition-colors"
        >
          <IoChevronBack size={20} className="mr-1" />
        </button>
        <h1 className="text-lg font-bold text-text-muted-foreground">
          Event Details
        </h1>
        <div></div>
      </div>

      {/* Tab Navigation */}
      {activeTab && onTabChange && (
        <div className="bg-white dark:bg-surface-glass-bg rounded-t-lg border border-dashboard-card-border border-b-0 overflow-hidden flex">
          <button
            onClick={() => onTabChange("attendance")}
            className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeTab === "attendance"
                ? "bg-secondary text-white border-b-2 border-secondary"
                : "text-dashboard-heading hover:bg-gray-100 dark:hover:bg-gray-700 border-r border-dashboard-border"
            }`}
          >
            Attendance
          </button>
          <button
            onClick={() => onTabChange("vest")}
            className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeTab === "vest"
                ? "bg-secondary text-white border-b-2 border-secondary"
                : "text-dashboard-heading hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Vests
          </button>
          <button
            onClick={() => onTabChange("catering")}
            className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeTab === "catering"
                ? "bg-secondary text-white border-b-2 border-secondary"
                : "text-dashboard-heading hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Catering
          </button>
          {isAdmin && (
            <button
              onClick={() => onTabChange("companies")}
              className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === "companies"
                  ? "bg-secondary text-white border-b-2 border-secondary"
                  : "text-dashboard-heading hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Companies
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EventDetailsHeader;
