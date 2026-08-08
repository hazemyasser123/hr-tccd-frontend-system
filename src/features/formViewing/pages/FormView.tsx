import {
  QuestionCardComponent,
  FormLoadingComponent,
} from "@/features/formViewing/components";
import { useForm, useSubmitForm } from "@/shared/queries/forms/formQueries";
import type { Answer, Question } from "@/shared/types/question";
import toast from "react-hot-toast";
import { useParams, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import type { form, QuestionCardHandle } from "@/shared/types/form";
import { SUBMISSION_CATCHER } from "@/constants/formConstants";
import { useNavigate } from "react-router-dom";
import { ErrorScreen, Button } from "tccd-ui";
import { HTMLText } from "@/shared/components/HTMLText";
import FormLockedPage from "./FormLockedPage";
import { useUploadSubmissionMedia } from "@/shared/queries/forms/formQueries";
import { branchAssertionFormatter } from "@/features/formViewing/utils/formViewerUtils";
import type { formBranch } from "@/shared/types/form";

export default function FormView() {
  const navigate = useNavigate();

  const { formId } = useParams();
  const isPreview = useLocation().pathname.includes("preview");
  const ID = formId ?? "";

  const didSubmit = localStorage.getItem(`form_${ID}_completed`);

  useEffect(() => {
    if (didSubmit) {
      navigate("/form/finish");
    }
  }, [didSubmit, navigate]);

  const {
    data: fetchedForm,
    isFetching,
    isError,
    isSuccess,
  } = useForm(isPreview ? "local" : ID, false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [, setPageHistory] = useState<number[]>([0]);
  const [formData, setFormData] = useState<form>(
    fetchedForm || {
      id: "",
      title: "",
      formType: "",
      sheetName: "",
      pages: [],
      description: "",
      googleSheetId: "",
      googleDriveId: "",
      isClosed: false,
      createdAt: "",
      updatedAt: "",
    },
  );
  const isFormInitialized = useRef<boolean>(false);

  const [answers, setAnswers] = useState<Answer[]>([]);
  const questionRefs = useRef<(QuestionCardHandle | null)[]>([]);

  const submitFormMutation = useSubmitForm(ID, formData?.sheetName ?? "Guest");
  const uploadMediaMutation = useUploadSubmissionMedia(ID);

  useEffect(() => {
    if (!isSuccess || isFormInitialized.current) return;
    const formCleaned: form = {
      ...fetchedForm,
      pages:
        fetchedForm.pages?.filter(
          (page) =>
            !(
              page.title === "null" &&
              page.nextPage == -1 &&
              page.description === "nullDescKey"
            ),
        ) || [],
    };
    setFormData(formCleaned);
    isFormInitialized.current = true;
  }, [isSuccess]);

  const handleClear = () => {
    if (!formData || !formData.pages) return;
    const questionsOnPage = formData.pages[currentPage].questions;
    questionsOnPage.forEach((question) => {
      questionRefs.current[question.questionNumber]?.clear();
    });
  };

  const handleBack = () => {
    setPageHistory((prev) => {
      if (prev.length <= 1) return prev;
      const newHistory = prev.slice(0, -1);
      setCurrentPage(newHistory[newHistory.length - 1]);
      return newHistory;
    });
  };

  const handlePageAdvance = () => {
    let hasErrors = false;
    const answerArray: Answer[] = [...answers];

    questionRefs.current.forEach((ref) => {
      if (ref?.validate()) {
        hasErrors = true;
      }
      if (ref) {
        const collected = ref.collect();
        const existingIndex = answerArray.findIndex(
          (a: Answer) => a.qid === collected.qid,
        );
        if (existingIndex >= 0) {
          answerArray[existingIndex] = collected;
        } else {
          answerArray.push(collected);
        }
      }
    });

    setAnswers(answerArray);

    if (hasErrors || !formData || !formData.pages) {
      return;
    } else if (formData && currentPage < formData.pages.length - 1) {
      const branches = formData.pages[currentPage].toBranch;
      if (branches && branches.length > 0) {

        const currentAnswer = answerArray.find((a) =>
          branches.some((b) => b.questionNumber === a.qid),
        );
        const selectedBranch: formBranch = branches.filter((b) => {
          return (
            b.sourcePage === currentPage && b.assertOn === currentAnswer?.answer
          );
        })[0];

        const currentQuestion = formData.pages[currentPage].questions.filter(
          (q) => q.questionNumber === currentAnswer?.qid,
        )[0];
        const answersToAssert = currentAnswer
          ? branchAssertionFormatter(selectedBranch.assertOn)
          : [];

        if (
          currentQuestion.questionType === "MCQ" &&
          currentQuestion.isMultiSelect
        ) {
          const answerValues = Array.isArray(currentAnswer?.answer)
            ? (currentAnswer.answer as string[])
            : [];
          const hasMatch = answerValues.some((value) =>
            answersToAssert.includes(value),
          );
          if (hasMatch) {
            setCurrentPage(selectedBranch.targetPage);
            setPageHistory((prev) => [...prev, selectedBranch.targetPage]);
            return;
          } else {
            setCurrentPage((prev) => prev + 1);
            setPageHistory((prev) => [...prev, currentPage + 1]);
            return;
          }
        }
        if (answersToAssert.includes(currentAnswer?.answer as string)) {
          setCurrentPage(selectedBranch.targetPage);
          setPageHistory((prev) => [...prev, selectedBranch.targetPage]);
          return;
        } else {
          setCurrentPage(formData.pages[currentPage].nextPage);
          setPageHistory((prev) => [
            ...prev,
            formData.pages[currentPage].nextPage,
          ]);
          return;
        }
      } else {
        setCurrentPage(formData.pages[currentPage].nextPage);
        setPageHistory((prev) => [
          ...prev,
          formData.pages[currentPage].nextPage,
        ]);
      }
    } else {
      handleSubmit(answerArray);
    }
  };

  const handleSubmit = (finalAnswers: Answer[]) => {
    if (isPreview) return;

    toast.promise(
      (async () => {
        for (const answer of finalAnswers) {
          if (
            answer.answer instanceof File ||
            (Array.isArray(answer.answer) &&
              answer.answer.some((a) => a instanceof File))
          ) {
            const files = Array.isArray(answer.answer)
              ? (answer.answer as File[])
              : [answer.answer as File];
            const uploadedUrls = await uploadMediaMutation.mutateAsync(files);
            answer.answer = Array.isArray(answer.answer)
              ? uploadedUrls
              : uploadedUrls[0];
          }
        }

        await submitFormMutation.mutateAsync(finalAnswers);
        localStorage.setItem(`form_${ID}_completed`, "true");
        navigate("/form/finish");
      })(),
      {
        loading: "Submitting...",
        error: () =>
          "An error has occurred while submitting your response, Please try again.",
      },
    );
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });

    if (!formData || !formData.pages || currentPage >= formData.pages.length)
      return;
    const questionsOnPage = formData.pages[currentPage].questions;

    questionsOnPage.forEach((question) => {
      const answer = answers.find((a) => a.qid === question.questionNumber);
      if (answer) {
        questionRefs.current[question.questionNumber]?.reassign(answer);
      }
    });
  }, [currentPage, formData, answers]);

  if (formData?.isClosed && !isPreview) {
    return <FormLockedPage />;
  }

  return (
    <div className="min-h-screen pb-4 md:pb-10 md:pt-4 bg-gradient-to-b from-white via-white to-[#f8f6f1] dark:from-background-primary dark:via-background-primary dark:to-background-primary text-text-body-main">
      {isFetching && <FormLoadingComponent />}
      {isError && (
        <ErrorScreen
          title="Error Loading Form"
          message="We encountered an error while loading this form, Please try again later."
        />
      )}

      {formData && formData.pages && (
        <div className="w-full md:w-2/3 lg:w-1/3 m-auto md:rounded-xl shadow-md p-5 flex flex-col gap-4 bg-white/80 dark:bg-surface-glass-bg border border-black/5 dark:border-surface-glass-border/10 backdrop-blur">
          <img
            src="/banner.png"
            alt="TCCD Banner"
            className="w-full h-24 md:h-32 lg:h-[130px] xl:h-[150px] object-fill rounded-lg"
          />
          {/* Form Header */}
          <div className="space-y-4 rounded-lg border-t-10 border-primary p-4 shadow-md bg-white dark:bg-surface-glass-bg/50">
            <h1 className="text-2xl lg:text-3xl font-bold text-primary dark:text-text-title">
              {formData.title}
            </h1>
            {formData.description && (
              <p className="text-[14px] md:text-[15px] lg:text-[16px] text-inactive-tab-text dark:text-text-muted-foreground">
                <HTMLText content={formData.description} />
              </p>
            )}
            <hr className="border-contrast/30" />
            <p className="text-[12px] md:text-[13px] lg:text-[14px] mt-2 text-primary font-semibold">
              * Indicates a required question
            </p>
          </div>

          {/* Form Pages & Questions */}
          {currentPage >= formData.pages.length ? (
            <div className="rounded-lg shadow-md bg-white dark:bg-surface-glass-bg/50">
              <div className="py-2 bg-primary mb-4 rounded-t-lg px-4">
                <p className="text-[14px] md:text-[15px] lg:text-[16px] font-bold text-text">
                  {SUBMISSION_CATCHER.title}
                </p>
              </div>
              {SUBMISSION_CATCHER.description && (
                <p className="text-[13px] md:text-[14px] lg:text-[15px] mb-6 text-inactive-tab-text dark:text-text-muted-foreground px-4">
                  <HTMLText content={SUBMISSION_CATCHER.description} />
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Page Header */}
              <div className="rounded-lg shadow-md bg-white dark:bg-surface-glass-bg/50">
                <div className="py-2 bg-primary mb-4 rounded-t-lg px-4">
                  <p className="text-[14px] md:text-[15px] lg:text-[16px] font-bold text-text">
                    {formData.pages[currentPage].title}
                  </p>
                </div>
                {formData.pages[currentPage].description && (
                  <p className="text-[13px] md:text-[14px] lg:text-[15px] mb-6 px-4">
                    <HTMLText
                      content={formData.pages[currentPage].description}
                    />
                  </p>
                )}
              </div>

              {/* Questions */}
              {formData.pages[currentPage].questions.map(
                (question: Question) => (
                  <div key={question.questionNumber} className="w-full">
                    <QuestionCardComponent
                      ref={(el) => {
                        questionRefs.current[question.questionNumber] = el;
                      }}
                      question={question}
                    />
                  </div>
                ),
              )}
            </div>
          )}
          <div className="flex justify-between gap-1.5 md:gap-3 md:mt-8">
            <Button
              buttonText="Clear"
              type="ghost"
              onClick={() => handleClear()}
            />
            <div className="flex-grow" />
            {currentPage > 0 && (
              <Button
                buttonText="Back"
                type="secondary"
                onClick={() => handleBack()}
              />
            )}
            {currentPage < formData.pages.length - 1 ? (
              <Button
                buttonText="Next"
                type="secondary"
                onClick={() => handlePageAdvance()}
              />
            ) : (
              <>
                {!isPreview && (
                  <Button
                    buttonText="Submit"
                    type="primary"
                    disabled={
                      submitFormMutation.isPending ||
                      uploadMediaMutation.isPending
                    }
                    onClick={() => handlePageAdvance()}
                  />
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
