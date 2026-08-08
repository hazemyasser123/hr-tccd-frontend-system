import type { JudgeQuestion } from "@/shared/types/judgingSystem";
import type { Event } from "@/shared/types/event";
import QuestionDeleteModal from "./QuestionDeleteModal";
import { FaPlus, FaCheck } from "react-icons/fa";
import { IoCaretUp, IoCaretDown } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { HiOutlineTrash } from "react-icons/hi2";
import { MdOutlineEdit } from "react-icons/md";
import { Button, TextDisplayEdit } from "tccd-ui";
import useManageQuestionUtils from "../utils/QuestionManageUtils";
import { RichTextEditor } from "@/shared/components/RichTextEditor";
import { HTMLFormattedText } from "@/shared/components/HTMLFormattedText";

export default function QuestionList({ event }: { event: Event | undefined }) {
  const {
    questionsState,
    handleAddQuestion,
    handleMoveQuestion,
    handleDeleteQuestion,
    handleUpdateQuestion,
    isLoadingQuestions,
    isLoadingUpdate,
    isErrorQuestions,
    newQuestionState,
    setNewQuestionState,
    handleOpenQuestionAdd,
    newQuestionErrors,
    editQuestionErrors,
    deleteModalOpen,
    setDeleteModalOpen,
    editQuestionState,
    setEditQuestionState,
  } = useManageQuestionUtils({ eventId: event?.id });

  return (
    <main>
      <QuestionDeleteModal
        isLoading={isLoadingUpdate}
        isOpen={deleteModalOpen !== ""}
        onClose={() => setDeleteModalOpen("")}
        handleDelete={() => handleDeleteQuestion(deleteModalOpen)}
      />
      <div className="bg-white dark:bg-surface-glass-bg w-full rounded-lg shadow-sm border border-slate-200/50 dark:border-surface-glass-border/10 overflow-hidden">
        {isLoadingQuestions ? (
          <div className="flex flex-col items-center justify-center p-12 gap-3">
            <AiOutlineLoading3Quarters className="size-8 text-inactive-tab-text animate-spin" />
            <p className="text-inactive-tab-text font-medium">
              Loading questions...
            </p>
          </div>
        ) : isErrorQuestions ? (
          <div className="flex flex-col items-center justify-center p-12 gap-2">
            <p className="text-red-600 font-semibold text-lg">
              Failed to load questions
            </p>
            <p className="text-text-muted-foreground text-sm">
              Please try again later.
            </p>
          </div>
        ) : questionsState.length === 0 ? (
          <div
            className={`flex justify-center items-center flex-col gap-4 py-16 px-6 ${
              newQuestionState ? "pb-8" : ""
            }`}
          >
            <div className="size-16 rounded-full bg-muted-primary/10 flex items-center justify-center mb-2">
              <FaPlus className="size-6 text-text-muted-foreground" />
            </div>
            <p className="text-text-muted-foreground font-medium text-center text-balance">
              No evaluation has been created for this event yet.
            </p>
            <p className="text-text-muted-foreground/70 text-sm text-center max-w-md text-balance">
              Get started by adding your first evaluation question below.
            </p>
            <Button
              buttonText="Add First Question"
              type="primary"
              width="auto"
              onClick={() => handleOpenQuestionAdd()}
            />
          </div>
        ) : (
          <div className="relative">
            <div className="bg-linear-to-r from-muted-primary/5 to-surface-glass-bg px-6 py-8 border-b border-surface-glass-border/10">
              <h2 className="text-center font-bold text-2xl md:text-3xl text-text-title text-balance">
                {event?.title}'s Evaluation Paper
              </h2>
              <p className="text-center text-text-muted-foreground text-sm mt-2">
                Manage and organize evaluation criteria
              </p>
            </div>
            <button
              onClick={() => {
                if (isLoadingUpdate) return;
                handleOpenQuestionAdd();
              }}
              className="absolute hidden md:flex top-8 right-6 rounded-full bg-primary/90 p-3 hover:bg-primary focus:bg-primary focus:outline-none focus:ring-4 focus:ring-primary/30 cursor-pointer transition-all duration-200 ease-in-out shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed items-center justify-center group"
              disabled={isLoadingUpdate}
              aria-label="Add new question"
            >
              <FaPlus className="text-white size-4 group-hover:scale-110 transition-transform duration-200" />
            </button>
            <div className="divide-y divide-surface-glass-border/10">
              {questionsState.map((question: JudgeQuestion, index) => (
                <div
                  key={index}
                  className="px-6 py-5 relative hover:bg-muted-primary/5 transition-colors duration-200 group"
                >
                  <div className="absolute top-5 right-6 flex items-center gap-1.5 bg-surface-glass-bg/80 backdrop-blur-sm rounded-lg p-1.5 shadow-sm border border-surface-glass-border/20 opacity-90 group-hover:opacity-100 transition-opacity">
                    {question.itemNumber !== 1 && (
                      <button
                        onClick={() => {
                          if (isLoadingUpdate) return;
                          handleMoveQuestion(question.id, "up");
                        }}
                        className="p-1.5 rounded hover:bg-muted-primary/10 focus:bg-muted-primary/10 focus:outline-none focus:ring-2 focus:ring-text-body-main/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoadingUpdate}
                        aria-label="Move question up"
                      >
                        <IoCaretUp className="text-text-body-main/90 hover:text-text-body-main size-5" />
                      </button>
                    )}
                    {question.itemNumber !== questionsState.length && (
                      <button
                        onClick={() => {
                          if (isLoadingUpdate) return;
                          handleMoveQuestion(question.id, "down");
                        }}
                        className="p-1.5 rounded hover:bg-muted-primary/10 focus:bg-muted-primary/10 focus:outline-none focus:ring-2 focus:ring-text-body-main/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoadingUpdate}
                        aria-label="Move question down"
                      >
                        <IoCaretDown className="text-text-body-main/90 hover:text-text-body-main size-5" />
                      </button>
                    )}
                    <div className="w-px h-5 bg-surface-glass-border/20 mx-0.5" />
                    {editQuestionState?.id !== question.id ? (
                      <button
                        onClick={() => {
                          if (isLoadingUpdate) return;
                          setEditQuestionState(question);
                        }}
                        className="p-1.5 rounded hover:bg-secondary/10 focus:bg-secondary/10 focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoadingUpdate}
                        aria-label="Edit question"
                      >
                        <MdOutlineEdit className="text-secondary/90 hover:text-secondary size-5" />
                      </button>
                    ) : isLoadingUpdate ? (
                      <div className="p-1.5">
                        <AiOutlineLoading3Quarters className="text-secondary/90 size-5 animate-spin" />
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          if (isLoadingUpdate) return;
                          handleUpdateQuestion();
                        }}
                        className="p-1.5 rounded hover:bg-green-50 focus:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoadingUpdate}
                        aria-label="Save changes"
                      >
                        <FaCheck className="text-green-600 hover:text-green-700 size-5" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (isLoadingUpdate) return;
                        setDeleteModalOpen(question.id);
                      }}
                      className="p-1.5 rounded hover:bg-red-50 focus:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isLoadingUpdate}
                      aria-label="Delete question"
                    >
                      <HiOutlineTrash className="text-red-500 hover:text-red-700 size-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm border border-primary/20">
                      Question {question.itemNumber}
                    </span>
                  </div>
                  {editQuestionState?.id === question.id ? (
                    <div className="space-y-4">
                      <TextDisplayEdit
                        label=""
                        placeholder="Enter evaluation criteria description..."
                        value={editQuestionState.name}
                        onChange={(val) =>
                          setEditQuestionState((prev) => {
                            if (!prev) return null;
                            return { ...prev, name: val };
                          })
                        }
                      />
                      <RichTextEditor
                        label=""
                        placeholder="Enter detailed description for this question..."
                        value={editQuestionState.description}
                        onChange={(val) =>
                          setEditQuestionState((prev) => {
                            if (!prev) return null;
                            return { ...prev, description: val };
                          })
                        }
                      />
                      {editQuestionErrors && (
                        <p className="text-red-600 text-sm mt-2 font-medium bg-red-50 border border-red-200 rounded-md px-3 py-2">
                          {editQuestionErrors}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="mt-2 text-lg text-text-body-main leading-relaxed font-medium">
                        {question.name}
                      </p>
                      <p className="text-sm text-text-muted-foreground">
                        <HTMLFormattedText
                          content={question.description}
                          className="text-sm text-text-muted-foreground"
                        />
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {!newQuestionState && (
              <div className="px-6 py-6 bg-muted-primary/5 border-t border-surface-glass-border/10 flex justify-center md:hidden">
                <Button
                  buttonText="Add New Question"
                  type="primary"
                  width="auto"
                  onClick={() => {
                    if (isLoadingUpdate) return;
                    handleOpenQuestionAdd();
                  }}
                />
              </div>
            )}
          </div>
        )}
        {newQuestionState && (
          <div className="border-t-2 border-primary/20 bg-primary/5 px-6 py-6">
            <div className="bg-surface-glass-bg rounded-lg shadow-sm border border-primary/20 p-6">
              <div className="flex items-center gap-3 justify-center mb-6">
                <label
                  htmlFor="question-number"
                  className="font-semibold text-lg text-text-body-main"
                >
                  New Question #
                </label>
                <input
                  id="question-number"
                  placeholder="0"
                  type="number"
                  style={{
                    width: `${Math.max(
                      13 *
                        (newQuestionState?.itemNumber + 1).toString().length +
                        14,
                      40
                    )}px`,
                    MozAppearance: "textfield",
                  }}
                  className="px-3 py-2 shadow-sm bg-surface-glass-bg rounded-lg text-center focus:border-primary focus:ring-2 focus:ring-primary/20 border-surface-glass-border/20 border transition-all duration-200 outline-none text-text-body-main font-semibold"
                  value={
                    newQuestionState.itemNumber === -1
                      ? ""
                      : newQuestionState.itemNumber
                  }
                  onChange={(e) =>
                    setNewQuestionState((prev) => {
                      if (!prev) return null;
                      return { ...prev, itemNumber: Number(e.target.value) };
                    })
                  }
                />
              </div>
              <div className="space-y-4">
                <TextDisplayEdit
                  label="Question text"
                  placeholder="Enter evaluation criteria description..."
                  value={newQuestionState.name}
                  onChange={(val) =>
                    setNewQuestionState((prev) => {
                      if (!prev) return null;
                      return { ...prev, name: val };
                    })
                  }
                />
                <RichTextEditor
                label="Detailed Description"
                placeholder="Enter detailed description for this question..."
                value={newQuestionState.description}
                onChange={(val) =>
                  setNewQuestionState((prev) => {
                    if (!prev) return null;
                    return { ...prev, description: val };
                  })
                }
                />
                {newQuestionErrors.name && (
                  <p className="text-red-600 text-sm font-medium bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {newQuestionErrors.name}
                  </p>
                )}
                {newQuestionErrors.itemNumber && (
                  <p className="text-red-600 text-sm font-medium bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {newQuestionErrors.itemNumber}
                  </p>
                )}
              </div>
              <div className="flex gap-3 justify-center items-center mt-6 pt-4 border-t border-surface-glass-border/10">
                <Button
                  disabled={isLoadingUpdate}
                  buttonText="Cancel"
                  type="secondary"
                  width="small"
                  onClick={() => setNewQuestionState(null)}
                />
                <Button
                  buttonText="Save Question"
                  type="primary"
                  width="small"
                  onClick={() => handleAddQuestion()}
                  loading={isLoadingUpdate}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
