import { FaXmark } from "react-icons/fa6";
import { InputField, NumberField } from "tccd-ui";
import type { formBranch, FormBranchHandle } from "@/shared/types/form";
import { useState } from "react";
import { forwardRef, useImperativeHandle } from "react";
import { branchAssertionFormatter } from "@/features/formViewing/utils/formViewerUtils";

interface BranchInfoProps {
  setBranchSections: React.Dispatch<
    React.SetStateAction<
      {
        formBranch: formBranch;
        ref: React.RefObject<FormBranchHandle | null>;
      }[]
    >
  >;
  initialValue: formBranch;
}

const BranchInfo = forwardRef<FormBranchHandle, BranchInfoProps>(
  ({ setBranchSections, initialValue }: BranchInfoProps, ref) => {
    const [branchData, setBranchData] = useState<formBranch>(initialValue);
    const [branchingMode, setBranchingMode] = useState<boolean>(false);

    const handleRemoveBranch = () => {
      setBranchSections((prev) =>
        prev.filter((branch) => branch.formBranch.id !== initialValue.id)
      );
    };

    const collectBranchData = (questionAnswers: string[]) => {
      const assertionAnswers = branchAssertionFormatter(branchData.assertOn);
      const selectedAnswers = questionAnswers.filter(
        (ans) => !assertionAnswers.includes(ans)
      );
      return {
        id: branchData.id,
        sourcePage: branchData.sourcePage,
        questionNumber: branchData.questionNumber,
        assertOn: branchingMode
          ? "[" + selectedAnswers.join(", ") + "]"
          : branchData.assertOn,
        targetPage: branchData.targetPage,
      };
    };

    useImperativeHandle(ref, () => ({
      collect: collectBranchData,
      fetchQuestionNumber: () => branchData.questionNumber,
    }));

    return (
      <div className="p-3 border border-gray-200 dark:border-surface-glass-border/10 rounded-md bg-white dark:bg-surface-glass-bg space-y-3 relative">
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <div className="bg-secondary py-0.5 md:py-1 rounded-full px-3">
            <p
              className="text-background text-[12px] md:text-[14px] cursor-pointer"
              onClick={() => setBranchingMode((prev) => !prev)}
            >
              {branchingMode ? "Excluding" : "Including"}
            </p>
          </div>
          <FaXmark
            className="text-primary cursor-pointer size-4 md:size-5"
            onClick={() => handleRemoveBranch()}
          />
        </div>
        <p className="text-[15px] md:text-[17px] lg:text-[19px] font-semibold text-inactive-tab-text dark:text-text-title mb-5">
          Page Branching
        </p>
        <p className="text-[13px] md:text-[14px] lg:text-[15px] text-inactive-tab-text dark:text-text-muted-foreground">
          Select the <strong className="text-black dark:text-white">(TOTAL)</strong> question number to base the branching on, the
          answer to trigger or exclude from triggering the branch based on the
          selected mode, and the page to skip to.
        </p>
        <div className="flex flex-wrap lg:gap-[2%] gap-4 mb-2">
          <div className="lg:w-[32%] w-full">
            <NumberField
              id="branching-question-number"
              label="Branching Question Number"
              placeholder="e.g. 1"
              value={String(branchData?.questionNumber) || ""}
              onChange={(value) => {
                setBranchData({
                  ...branchData,
                  questionNumber: parseInt(String(value)),
                });
              }}
            />
          </div>
          <div className="lg:w-[32%] w-full">
            <InputField
              label={`Answer to ${branchingMode ? "not" : ""} Trigger Branch`}
              id={`branching-answer-${initialValue.id}`}
              placeholder="e.g. Yes"
              value={branchData?.assertOn || ""}
              onChange={(e) =>
                setBranchData({ ...branchData, assertOn: e.target.value })
              }
            />
          </div>
          <div className="lg:w-[32%] w-full">
            <NumberField
              id="branching-target-page"
              label="Page to skip to"
              placeholder="e.g. 2"
              value={String(branchData?.targetPage + 1) || ""}
              onChange={(value) =>
                setBranchData({
                  ...branchData,
                  targetPage: parseInt(String(value)) - 1,
                })
              }
            />
          </div>
        </div>
      </div>
    );
  }
);

export default BranchInfo;
