import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { Button } from "tccd-ui";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  onAdd?: () => void;
  title: string;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  onAdd,
  title,
}: PaginationProps) => {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div className="relative mx-auto my-8 sm:my-9 md:my-10">
      <div className="h-full w-full relative gap-6 flex flex-col ">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
          <h3 className="text-dashboard-heading font-bold text-[18px] md:text-[20px] lg:text-[24px]">
            {title}
          </h3>
          {onAdd && (
            <div className="w-full sm:w-auto mt-2 sm:mt-0">
              <Button
                buttonText="Add"
                onClick={onAdd}
                type="primary"
                width="full"
              />
            </div>
          )}
        </div>
        <div className="flex justify-center gap-5 md:gap-10 items-center">
          <button
            className={`w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] md:w-[20px] md:h-[20px] lg:w-[24px] lg:h-[24px] flex items-center justify-center rounded cursor-pointer transition-all duration-200 hover:scale-110 ${
              isFirstPage
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-muted-primary/10"
            }`}
            onClick={!isFirstPage ? onPrevious : undefined}
            disabled={isFirstPage}
          >
            <MdArrowBackIos
              className={`text-sm sm:text-base md:text-lg lg:text-xl ${
                isFirstPage
                  ? "text-text-muted-foreground/50"
                  : "text-text-body-main"
              }`}
            />
          </button>

          <span className="font-inter font-bold text-[14px] sm:text-[15px] md:text-[16px] lg:text-[18px] leading-[16px] sm:leading-[18px] md:leading-[20px] lg:leading-[22px] text-text-body-main">
            Page {currentPage} of {totalPages}
          </span>

          <button
            className={`w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] md:w-[20px] md:h-[20px] lg:w-[24px] lg:h-[24px] flex items-center justify-center rounded cursor-pointer transition-all duration-200 hover:scale-110 ${
              isLastPage
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-muted-primary/10"
            }`}
            onClick={!isLastPage ? onNext : undefined}
            disabled={isLastPage}
          >
            <MdArrowForwardIos
              className={`text-sm sm:text-base md:text-lg lg:text-xl ${
                isLastPage
                  ? "text-text-muted-foreground/50"
                  : "text-text-body-main"
              }`}
            />
          </button>
        </div>
        <hr className="border-t-2 border-surface-glass-border/10 -mt-2" />
      </div>
    </div>
  );
};

export default Pagination;
