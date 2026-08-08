import { Button, SearchField } from "tccd-ui";
import { FaChevronLeft, FaChevronRight, FaChartLine } from "react-icons/fa";
import { FaListCheck } from "react-icons/fa6";
import {
  useGetJudgesForEvent,
  useExportEvaluationsToExcel,
} from "@/shared/queries/judgingSystem/judgeQueries";
import { useEffect, useState } from "react";
import { TbListDetails } from "react-icons/tb";
import { HiOutlineDocumentDownload } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import CardView from "@/shared/components/table/CardView";
import Table from "@/shared/components/table/Table";
import ResetPasswordModal from "./ResetPasswordModal";
import { RiLockPasswordLine } from "react-icons/ri";

const JudgesList = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [judgeName, setJudgeName] = useState("");
  const {
    data: judgesData,
    isLoading,
    isError,
  } = useGetJudgesForEvent(currentPage, 10, judgeName);
  const { mutate: exportEvaluations, isPending: isExporting } =
    useExportEvaluationsToExcel();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedJudge, setSelectedJudge] = useState<{ id: string; name: string } | null>(null);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [judgeName]);

  const handleExport = () => {
    if (!eventId) return;

    exportEvaluations(eventId, {
      onSuccess: (data) => {
        const blob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `evaluations-${eventId}-${
          new Date().toISOString().split("T")[0]
        }.xlsx`;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      onError: (error) => {
        console.error("Export failed:", error);
      },
    });
  };

  return (
    <div className="bg-surface-glass-bg rounded-lg shadow-sm border border-surface-glass-border/10 overflow-hidden">
      {selectedJudge && (
        <ResetPasswordModal
          isOpen={isResetModalOpen}
          onClose={() => {
            setIsResetModalOpen(false);
            setSelectedJudge(null);
          }}
          judgeId={selectedJudge.id}
          judgeName={selectedJudge.name}
        />
      )}
      <div className="p-4 border-b border-surface-glass-border/10 space-y-2">
        <div className="flex items-center justify-between mb-4">
          <p className="text-md md:text-lg lg:text-xl font-bold text-text-muted-foreground">
            Judges {judgesData ? `(${judgesData.total})` : ""}
          </p>
          <div className="flex gap-2 items-center justify-center">
            <FaChevronLeft
              className={`cursor-pointer size-4 ${
                currentPage === 1
                  ? "text-text-muted-foreground/50 cursor-not-allowed"
                  : "text-text-body-main hover:text-primary"
              }`}
              onClick={() => {
                if (currentPage > 1) {
                  setCurrentPage(currentPage - 1);
                }
              }}
            />
            <span className="text-[14px] md:text-[15px] lg:text-[16px] font-medium text-text-body-main">
              Page {currentPage}
            </span>
            <FaChevronRight
              className={`cursor-pointer size-4 ${
                judgesData && judgesData.hasNextPage
                  ? "text-text-body-main hover:text-primary"
                  : "text-text-muted-foreground/50 cursor-not-allowed"
              }`}
              onClick={() => {
                if (judgesData && judgesData.hasNextPage) {
                  setCurrentPage(currentPage + 1);
                }
              }}
            />
          </div>
        </div>
        <hr className="border-surface-glass-border/10" />
        <div className="flex gap-2 md:flex-row flex-col justify-between">
          <div className="md:min-w-76">
            <SearchField
              placeholder="Search by name"
              value={judgeName}
              onChange={(value) => setJudgeName(value)}
            />
          </div>
          <div className="flex gap-2 md:flex-row flex-col">
            <Button
              buttonText="Evaluation Analysis"
              buttonIcon={<FaChartLine className="size-4" />}
              type="secondary"
              onClick={() =>
                navigate(`/judging-system/evaluation-analysis/${eventId}`)
              }
              width="auto"
            />
            <Button
              buttonText="Export Evaluations"
              buttonIcon={<HiOutlineDocumentDownload className="size-4" />}
              type="primary"
              onClick={handleExport}
              disabled={isExporting}
              width="auto"
            />
          </div>
        </div>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <p className="text-text-body-main">Loading judges...</p>
        </div>
      ) : isError ? (
        <div className="flex justify-center items-center h-48">
          <p className="text-text-body-main">
            Error loading judges. Please try again.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <Table
            items={judgesData?.data || []}
            columns={[
              { key: "name", label: "Name", width: "w-1/2" },
              { key: "email", label: "Email", width: "w-1/2" },
            ]}
            emptyMessage="No judges found."
            renderActions={(item) => (
              <>
                <Button
                  buttonText="View Evaluations"
                  type="tertiary"
                  onClick={() =>
                    navigate(
                      `/judging-system/evaluations/${item.id}/${eventId}`
                    )
                  }
                  width="auto"
                />
                <Button
                  buttonText="Manage Assignments"
                  type="secondary"
                  onClick={() =>
                    navigate(
                      `/judging-system/assigned-teams/${item.id}/${eventId}`
                    )
                  }
                  width="auto"
                />
                <Button
                  buttonText="Reset Password"
                  type="ghost"
                  onClick={() => {
                    setSelectedJudge({ id: item.id, name: item.name });
                    setIsResetModalOpen(true);
                  }}
                  width="auto"
                />
              </>
            )}
          />
          <CardView
            items={judgesData?.data || []}
            titleKey="name"
            renderedFields={[{ key: "email", label: "Email" }]}
            modalTitle="Confirm Action"
            modalSubTitle="Are you sure you want to perform this action?"
            confirmationAction={() => {}}
            isSubmitting={false}
            renderButtons={(item) => (
              <>
                <Button
                  buttonIcon={<FaListCheck className="size-4" />}
                  type="tertiary"
                  onClick={() =>
                    navigate(
                      `/judging-system/evaluations/${item.id}/${eventId}`
                    )
                  }
                  width="auto"
                />
                <Button
                  buttonIcon={<TbListDetails className="size-4" />}
                  type="secondary"
                  onClick={() =>
                    navigate(
                      `/judging-system/assigned-teams/${item.id}/${eventId}`
                    )
                  }
                  width="auto"
                />
                <Button
                  buttonIcon={<RiLockPasswordLine className="size-4" />}
                  type="ghost"
                  onClick={() => {
                    setSelectedJudge({ id: item.id, name: item.name });
                    setIsResetModalOpen(true);
                  }}
                  width="auto"
                />
              </>
            )}
          />
          {/* Mobile Card View */}
        </>
      )}
    </div>
  );
};

export default JudgesList;
