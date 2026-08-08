import { SearchField, DropdownMenu, DatePicker, ErrorScreen } from "tccd-ui";
import { useState, useEffect } from "react";
import FormTable from "./FormTable";
import FormCardView from "./FormCardView";
import { FORM_SORTING_OPTIONS, FORM_TYPES } from "@/constants/formConstants";
import { useForms } from "@/shared/queries/forms/formQueries";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const FormList = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchKey, setSearchKey] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchKey);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchTerm(searchKey), 300);
    return () => clearTimeout(t);
  }, [searchKey]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const [sortOption, setSortOption] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("All");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const {
    data: Forms,
    isLoading,
    isError,
  } = useForms(
    currentPage,
    15,
    selectedDate || "",
    debouncedSearchTerm,
    filterType,
    sortOption,
  );
  
  if (isError) {
    return (
      <ErrorScreen
        title={"An error occurred while fetching forms."}
        message="an error occurred while fetching forms, please try again and contact IT team if the issue persists."
      />
    );
  }

  return (
    <div className="bg-white dark:bg-surface-glass-bg rounded-lg shadow-sm border border-dashboard-card-border overflow-hidden">
      <div className="p-4 border-b border-dashboard-border space-y-2">
        <div className="flex items-center justify-between mb-4">
          <p className="text-md md:text-lg lg:text-xl font-bold text-text-muted-foreground">
            Forms {Forms ? `(${Forms.total})` : ""}
          </p>
          <div className="flex gap-2 items-center justify-center">
            <FaChevronLeft
              className={`cursor-pointer size-4 ${currentPage === 1 ? "text-gray-300 dark:text-gray-600 cursor-not-allowed" : "text-contrast hover:text-primary"}`}
              onClick={() => {
                if (currentPage > 1) {
                  setCurrentPage(currentPage - 1);
                }
              }}
            />
            <span className="text-[14px] md:text-[15px] lg:text-[16px] font-medium text-contrast dark:text-text-title">
              Page {currentPage}
            </span>
            <FaChevronRight
              className={`cursor-pointer size-4 ${Forms && !Forms.hasNextPage ? "text-gray-300 dark:text-gray-600 cursor-not-allowed" : "text-contrast hover:text-primary"}`}
              onClick={() => {
                if (Forms && Forms.hasNextPage) {
                  setCurrentPage(currentPage + 1);
                }
              }}
            />
          </div>
        </div>
        <>
          <div
            className="flex items-center gap-2 small-scrollbar"
            style={{ overflowX: "auto", overflowY: "hidden" }}
          >
            {FORM_TYPES.map((type) => (
              <div
                key={type.value}
                className={`px-3 py-1 rounded-md text-sm font-semibold ${filterType === type.value ? "text-primary scale-[110%]" : "text-contrast dark:text-text-title scale-[100%]"} transition-all duration-200 cursor-pointer whitespace-nowrap`}
                onClick={() => setFilterType(type.value)}
              >
                {type.label}
              </div>
            ))}
          </div>

          <style>{`
            .small-scrollbar {
              -ms-overflow-style: auto; /* IE and Edge */
              scrollbar-width: thin; /* Firefox */
            }
            .small-scrollbar::-webkit-scrollbar {
              height: 8px;
              width: 8px;
            }
            .small-scrollbar::-webkit-scrollbar-thumb {
              background-color: rgba(0,0,0,0.25);
              border-radius: 8px;
            }
            .small-scrollbar::-webkit-scrollbar-track {
              background: transparent;
              border-radius: 8px;
            }
          `}</style>
        </>
        <hr className="border-gray-200 dark:border-gray-700" />
        <p className="text-[14px] md:text-[15px] lg:text-[16px] font-semibold text-contrast dark:text-text-title">
          Filters
        </p>
        <div className="flex gap-2 md:flex-row flex-col justify-between">
          <SearchField
            placeholder="Search forms..."
            value={searchKey}
            onChange={(value) => setSearchKey(value)}
          />
          <div className="flex-col flex flex-1 justify-end md:flex-row gap-2">
            <div className="flex-grow md:max-w-64">
              <DropdownMenu
                options={FORM_SORTING_OPTIONS}
                value={sortOption}
                onChange={(val) => setSortOption(val)}
                placeholder="Sort By"
              />
            </div>
            <div className="flex-grow md:max-w-64 md:-mt-0.5">
              <DatePicker
                value={selectedDate || ""}
                onChange={(date) => setSelectedDate(date)}
              />
            </div>
          </div>
        </div>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <p className="text-contrast dark:text-text-title">Loading forms...</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <FormTable forms={Forms.data || []} />

          {/* Mobile Card View */}
          <FormCardView forms={Forms.data || []} />
        </>
      )}
    </div>
  );
};

export default FormList;
