import {
  DropdownMenu,
  InputField,
  NumberField,
  TextAreaField,
  Button,
} from "tccd-ui";
import {
  IoCaretUp,
  IoCaretDown,
  IoTrashSharp,
  IoLockOpen,
  IoLockClosed,
} from "react-icons/io5";
import toast from "react-hot-toast";
import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
  Activity,
} from "react";
import { TiTick, TiPlus } from "react-icons/ti";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";
import type { form, FormBranchHandle } from "@/shared/types/form";
import { QUESTION_TYPES } from "@/constants/formConstants";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import BranchInfo from "./BranchInfo";
import useFormEditorHandlers from "@/features/formBuilding/utils/formEditorUtils";

interface PagesInfoProps {
  formDataState: form;
  questionCount: number;
  setQuestionCount: React.Dispatch<React.SetStateAction<number>>;
  setFormDataState: React.Dispatch<React.SetStateAction<form>>;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    toChange: string,
    index?: number,
    field?: string,
  ) => void;
  isFetchSuccessful: boolean;
}

const PagesInfo = forwardRef(
  (
    {
      formDataState,
      setFormDataState,
      handleInputChange,
      setQuestionCount,
      isFetchSuccessful,
    }: PagesInfoProps,
    ref,
  ) => {
    const [allowModifiers, setAllowModifiers] = useState<boolean>(true);
    const isInitialized = React.useRef(false);

    const {
      handleAddPage,
      handleDeletePage,
      handleMovePage,
      handleAddChoice,
      handleRemoveChoice,
      handleDragEnd,
      handleAddBranch,
      handleMoveChoice,
      handleRemoveQuestion,
      handleAddQuestion,
      handlePasteQuestions,
      handleQuestionChange,
      handleAdjustNextPages,
      clipboard,
      branchSections,
      setBranchSections,
      setClipboard,
      choiceTextBuffer,
      setChoiceTextBuffer,
      selectedQuestions,
      showHidePages,
      setShowHidePages,
      setSelectedQuestions,
      validatePages,
      pageErrors,
      mainError,
      branchSectionErrors,
    } = useFormEditorHandlers(
      formDataState,
      setFormDataState,
      setQuestionCount,
    );

    useEffect(() => {
      if (Object.keys(showHidePages).length === 0) {
        setShowHidePages(
          formDataState.pages
            ? formDataState.pages.reduce(
                (acc, _, idx) => ({ ...acc, [idx]: true }),
                {},
              )
            : {},
        );
      }
    }, [formDataState.pages]);

    useEffect(() => {
      if (
        !isFetchSuccessful ||
        isInitialized.current ||
        !formDataState.pages ||
        formDataState.pages.length === 0
      )
        return;

      const newBranches = formDataState.pages.flatMap((page, pageIndex) =>
        (page.toBranch ?? []).map((branch) => ({
          formBranch: { ...branch, sourcePage: pageIndex },
          ref: React.createRef<FormBranchHandle>(),
        })),
      );

      if (newBranches.length > 0) {
        setBranchSections((prev) => [...prev, ...newBranches]);
        isInitialized.current = true;
      }
    }, [isFetchSuccessful, formDataState.pages]);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (!(e.ctrlKey || e.metaKey)) return;
        const key = e.key.toLowerCase();
        if (!(["c", "x"].includes(key) && selectedQuestions.length > 0)) return;
        e.preventDefault();

        setFormDataState((prev) => {
          if (!prev?.pages) return prev;

          const copied = prev.pages.flatMap((p) =>
            p.questions.filter((q) => selectedQuestions.includes(q.id || "")),
          );

          setClipboard(copied);

          if (key === "c") {
            return prev;
          }

          const updatedPages = prev.pages.map((page) => {
            const filteredQuestions = page.questions.filter(
              (q) => !selectedQuestions.includes(q.id || ""),
            );
            return { ...page, questions: filteredQuestions };
          });

          let counter = 1;
          const pagesWithReindexed = updatedPages.map((page) => ({
            ...page,
            questions: page.questions.map((q) => ({
              ...q,
              questionNumber: counter++,
            })),
          }));

          return { ...prev, pages: pagesWithReindexed };
        });

        if (key === "x") {
          setSelectedQuestions([]);
        }

        toast.success(
          `${key === "c" ? "Copied" : "Cut"} ${selectedQuestions.length} question(s) to clipboard`,
        );
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedQuestions, clipboard]);

    useImperativeHandle(ref, () => ({
      collect: validatePages,
    }));

    return (
      <div className="space-y-4 rounded-lg border-t-10 border-primary p-4 shadow-md bg-background dark:bg-surface-glass-bg relative">
        <div
          className="absolute md:right-4 md:top-4 top-3 right-3 flex items-center gap-2 cursor-pointer px-3 py-1 rounded-full bg-secondary text-background"
          onClick={() => setAllowModifiers(!allowModifiers)}
        >
          {allowModifiers ? (
            <IoLockOpen className="size-3.5 md:size-4" />
          ) : (
            <IoLockClosed className="size-3.5 md:size-4" />
          )}
          <p className="lg:text-[15px] md:text-[14px] text-[13px]">
            {allowModifiers ? "Disable Modifiers" : "Enable Modifiers"}
          </p>
        </div>
        <p className="text-[16px] md:text-[18px] lg:text-[20px] font-semibold text-primary">
          Form Pages
        </p>
        <p className="text-[14px] md:text-[15px] lg:text-[16px] text-inactive-tab-text dark:text-text-muted-foreground">
          Add and manage the pages of your form. Each page can contain multiple
          questions.
        </p>
        <DragDropContext onDragEnd={handleDragEnd}>
          {formDataState?.pages && formDataState.pages.length > 0 ? (
            formDataState.pages.map((page, index) => (
              <div
                key={index}
                className="p-3 md:p-4 border border-gray-300 dark:border-gray-600 rounded-md space-y-3 relative border-t-primary border-t-8 md:border-t-10"
              >
                <div className="absolute right-4 top-4 flex gap-2 items-center">
                  <Activity mode={index > 0 ? "visible" : "hidden"}>
                    <div className="bg-secondary rounded-full p-1">
                      <IoCaretUp
                        className="text-background cursor-pointer size-3.5 md:size-4"
                        onClick={() => handleMovePage(index, "up")}
                      />
                    </div>
                  </Activity>
                  {index < (formDataState.pages?.length || 0) - 1 && (
                    <div className="bg-secondary rounded-full p-1">
                      <IoCaretDown
                        className="text-background cursor-pointer size-3.5 md:size-4"
                        onClick={() => handleMovePage(index, "down")}
                      />
                    </div>
                  )}
                  <div className="bg-contrast rounded-full p-1">
                    {!showHidePages[index] ? (
                      <BiSolidShow
                        className="text-background cursor-pointer size-3.5 md:size-4"
                        onClick={() =>
                          setShowHidePages((prev) => ({
                            ...prev,
                            [index]: !prev[index],
                          }))
                        }
                      />
                    ) : (
                      <BiSolidHide
                        className="text-background cursor-pointer size-3.5 md:size-4"
                        onClick={() =>
                          setShowHidePages((prev) => ({
                            ...prev,
                            [index]: !prev[index],
                          }))
                        }
                      />
                    )}
                  </div>
                  <div className="bg-primary rounded-full p-1">
                    <IoTrashSharp
                      className="text-background cursor-pointer size-3.5 md:size-4"
                      onClick={() => handleDeletePage(index)}
                    />
                  </div>
                </div>
                <p className="text-[16px] md:text-[18px] lg:text-[20px] font-semibold text-primary">
                  Page {index + 1} ({page.questions ? page.questions.length : 0}{" "}
                  question
                  {page.questions && page.questions.length !== 1 ? "s" : ""})
                </p>
                <p className="text-[16px] md:text-[18px] lg:text-[20px] font-semibold text-primary flex gap-2">
                  Guides to Page
                  <input
                    placeholder="0"
                    type="number"
                    style={{
                      width: `${Math.max(13 * (page.nextPage + 1).toString().length + 14, 27)}px`,
                      MozAppearance: "textfield",
                    }}
                    className="shadow-md bg-white dark:bg-surface-glass-bg rounded-lg text-center focus:border-primary border-gray-300 dark:border-gray-600 border transition-colors duration-200 outline-none text-contrast dark:text-text-title"
                    value={page.nextPage === -1 ? "" : page.nextPage + 1}
                    onChange={(e) =>
                      handleAdjustNextPages(index, Number(e.target.value) - 1)
                    }
                  />
                </p>
                <Activity mode={showHidePages[index] ? "visible" : "hidden"}>
                  <p className="text-[14px] md:text-[16px] lg:text-[18px] font-semibold text-inactive-tab-text dark:text-text-title">
                    Primary information
                  </p>
                  <InputField
                    label="Page Title"
                    id={`page-title-${index}`}
                    value={page.title}
                    placeholder="Enter page title"
                    onChange={(e) =>
                      handleInputChange(e, "pages", index, "title")
                    }
                    error={pageErrors[index]?.title}
                  />
                  {pageErrors[index]?.title && (
                    <p className="text-primary -mt-2 text-[12px] md:text-[13px] lg:text-[14px]">
                      {pageErrors[index]?.title}
                    </p>
                  )}

                  <TextAreaField
                    label="Page Description"
                    id={`page-description-${index}`}
                    value={page.description || ""}
                    placeholder="Enter page description"
                    onChange={(e) =>
                      handleInputChange(e, "pages", index, "description")
                    }
                    error={pageErrors[index]?.description}
                  />
                  {pageErrors[index]?.description && (
                    <p className="text-primary -mt-2 text-[12px] md:text-[13px] lg:text-[14px]">
                      {pageErrors[index]?.description}
                    </p>
                  )}

                  <p className="text-[14px] md:text-[16px] lg:text-[18px] font-semibold text-inactive-tab-text dark:text-text-title mt-4">
                    Questions
                  </p>
                  <Droppable droppableId={`page-${index}`} key={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="space-y-3"
                      >
                        {page.questions && page.questions.length > 0 ? (
                          page.questions.map((question, qIndex) => (
                            <Draggable
                              key={qIndex}
                              draggableId={`page-${index}-question-${qIndex}`}
                              index={qIndex}
                              isDragDisabled={!allowModifiers}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`${allowModifiers ? "p-1.5 md:p-3 border-gray-200 dark:border-gray-600" : "border-transparent"} border rounded-md bg-gray-100 dark:bg-gray-800 space-y-3 flex flex-wrap lg:gap-[2%] relative ease-in-out transition-all duration-200`}
                                >
                                  <div
                                    key={qIndex}
                                    className="p-3 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-surface-glass-bg space-y-3 flex flex-wrap lg:gap-[2%] relative w-full h-fit"
                                  >
                                    <div className="absolute right-4 top-4 flex gap-2 items-center">
                                      {allowModifiers ? (
                                        selectedQuestions.includes(
                                          question.id || "",
                                        ) ? (
                                          <div className="bg-secondary rounded-full p-1">
                                            <TiTick
                                              className="text-background cursor-pointer size-4 md:size-5"
                                              onClick={() =>
                                                setSelectedQuestions((prev) =>
                                                  prev.filter(
                                                    (id) =>
                                                      id !== question.id || "",
                                                  ),
                                                )
                                              }
                                            />
                                          </div>
                                        ) : (
                                          <div className="bg-secondary py-0.5 md:py-1 rounded-full px-3">
                                            <p
                                              className="text-background text-[12px] md:text-[14px] cursor-pointer"
                                              onClick={() =>
                                                setSelectedQuestions((prev) => [
                                                  ...prev,
                                                  question.id || "",
                                                ])
                                              }
                                            >
                                              Select
                                            </p>
                                          </div>
                                        )
                                      ) : null}
                                      <div className="bg-primary rounded-full p-1">
                                        <IoTrashSharp
                                          className="text-background cursor-pointer size-3.5 md:size-4"
                                          onClick={() =>
                                            handleRemoveQuestion(index, qIndex)
                                          }
                                        />
                                      </div>
                                    </div>
                                    <p className="text-[14px] md:text-[16px] lg:text-[18px] font-semibold text-inactive-tab-text dark:text-text-title">
                                      Question {question.questionNumber} (
                                      {qIndex + 1} in page)
                                    </p>
                                    <InputField
                                      label="Question Text"
                                      id={`question-text-${index}-${qIndex}`}
                                      value={question.questionText}
                                      placeholder="Enter question text"
                                      onChange={(e) =>
                                        handleQuestionChange(
                                          qIndex,
                                          index,
                                          "questionText",
                                          e.target.value,
                                        )
                                      }
                                      error={
                                        pageErrors[index]?.questions?.[qIndex]
                                          ?.questionText ?? ""
                                      }
                                    />
                                    <TextAreaField
                                      label="Question Description (optional)"
                                      id={`question-description-${index}-${qIndex}`}
                                      value={question.description || ""}
                                      placeholder="Enter question description"
                                      onChange={(e) =>
                                        handleQuestionChange(
                                          qIndex,
                                          index,
                                          "description",
                                          e.target.value,
                                        )
                                      }
                                    />
                                    <div className="w-full lg:w-[49%]">
                                      <DropdownMenu
                                        options={QUESTION_TYPES.map((type) => ({
                                          label: type,
                                          value: type,
                                        }))}
                                        value={question.questionType}
                                        onChange={(selected) =>
                                          handleQuestionChange(
                                            qIndex,
                                            index,
                                            "questionType",
                                            selected,
                                          )
                                        }
                                        label="Question Type"
                                      />
                                    </div>
                                    <div className="w-full lg:w-[49%]">
                                      <DropdownMenu
                                        options={[
                                          { label: "Yes", value: "true" },
                                          { label: "No", value: "false" },
                                        ]}
                                        value={
                                          question.isMandatory
                                            ? "true"
                                            : "false"
                                        }
                                        onChange={(selected) =>
                                          handleQuestionChange(
                                            qIndex,
                                            index,
                                            "isMandatory",
                                            selected === "true",
                                          )
                                        }
                                        label="Is Required"
                                      />
                                    </div>
                                    {question.questionType === "Essay" && (
                                      <>
                                        <div className="w-full lg:w-[49%]">
                                          <DropdownMenu
                                            options={[
                                              {
                                                label: "multiline",
                                                value: "true",
                                              },
                                              {
                                                label: "single line",
                                                value: "false",
                                              },
                                            ]}
                                            value={
                                              question.isTextArea
                                                ? "true"
                                                : "false"
                                            }
                                            onChange={(selected) =>
                                              handleQuestionChange(
                                                qIndex,
                                                index,
                                                "isTextArea",
                                                selected === "true",
                                              )
                                            }
                                            label="Answer Format"
                                          />
                                        </div>
                                        <div className="w-full lg:w-[49%]">
                                          <NumberField
                                            id="question-maxlength"
                                            label="Character Limit"
                                            value={
                                              question.maxLength
                                                ? question.maxLength.toString()
                                                : ""
                                            }
                                            placeholder="e.g. 250"
                                            onChange={(value) =>
                                              handleQuestionChange(
                                                qIndex,
                                                index,
                                                "maxLength",
                                                value !== ""
                                                  ? value
                                                  : null,
                                              )
                                            }
                                          />
                                        </div>
                                      </>
                                    )}
                                    {question.questionType === "MCQ" && (
                                      <div className="w-full space-y-3">
                                        <p className="text-label dark:text-text-muted-foreground text-[14px] md:text-[15px] lg:text-[16px] mb-2 font-semibold">
                                          Added Choices
                                        </p>
                                        {question.choices &&
                                        question.choices.length > 0 ? (
                                          <div className="w-full mb-2">
                                            {question.choices.map(
                                              (choice, cIndex) => (
                                                <div
                                                  key={cIndex}
                                                  className="flex items-center justify-between w-full gap-2 my-3"
                                                >
                                                  <p className="text-[14px] md:text-[15px] lg:text-[16px] dark:text-text-body-main">
                                                    {cIndex +
                                                      1 +
                                                      ". " +
                                                      choice.text}
                                                  </p>
                                                  <div className="flex gap-2 items-center">
                                                    {choice.choiceNumber >
                                                      1 && (
                                                      <IoCaretUp
                                                        className="text-primary cursor-pointer size-4 md:size-4.5"
                                                        onClick={() =>
                                                          handleMoveChoice(
                                                            qIndex,
                                                            index,
                                                            cIndex,
                                                            "up",
                                                          )
                                                        }
                                                      />
                                                    )}
                                                    {choice.choiceNumber <
                                                      (question.choices
                                                        ? question.choices
                                                            .length
                                                        : 0) && (
                                                      <IoCaretDown
                                                        className="text-primary cursor-pointer size-4 md:size-4.5"
                                                        onClick={() =>
                                                          handleMoveChoice(
                                                            qIndex,
                                                            index,
                                                            cIndex,
                                                            "down",
                                                          )
                                                        }
                                                      />
                                                    )}
                                                    <IoTrashSharp
                                                      className="text-primary cursor-pointer size-4 md:size-4.5"
                                                      onClick={() =>
                                                        handleRemoveChoice(
                                                          qIndex,
                                                          index,
                                                          cIndex,
                                                        )
                                                      }
                                                    />
                                                  </div>
                                                </div>
                                              ),
                                            )}
                                          </div>
                                        ) : (
                                          <p className="text-sm text-gray-600 dark:text-text-muted-foreground">
                                            No choices added yet.
                                          </p>
                                        )}
                                        <div className="flex gap-2 items-end w-full justify-between">
                                          <div className="max-w-3/4 md:max-w-none w-full">
                                            <InputField
                                              label="Add Choice"
                                              id={`question-add-choice-${index}-${qIndex}`}
                                              value={choiceTextBuffer}
                                              placeholder="Enter choice text"
                                              onChange={(e) =>
                                                setChoiceTextBuffer(
                                                  e.target.value,
                                                )
                                              }
                                            />
                                          </div>
                                          <Button
                                            type="secondary"
                                            width="fit"
                                            onClick={() =>
                                              handleAddChoice(qIndex, index)
                                            }
                                            buttonIcon={
                                              <TiPlus className="size-3 md:size-4.5" />
                                            }
                                          />
                                        </div>
                                        <DropdownMenu
                                          options={[
                                            { label: "Yes", value: "true" },
                                            { label: "No", value: "false" },
                                          ]}
                                          value={
                                            question.isMultiSelect
                                              ? "true"
                                              : "false"
                                          }
                                          onChange={(selected) =>
                                            handleQuestionChange(
                                              qIndex,
                                              index,
                                              "isMultiSelect",
                                              selected === "true",
                                            )
                                          }
                                          label="Allow Multiple Answers"
                                        />
                                      </div>
                                    )}
                                    {question.questionType === "Upload" && (
                                      <>
                                        <div className="w-full lg:w-[49%]">
                                          <NumberField
                                            id="question-maxfilesize"
                                            label="Max File Size (MB)"
                                            value={
                                              question.maxFileSizeMB
                                                ? question.maxFileSizeMB.toString()
                                                : ""
                                            }
                                            placeholder="e.g. 5"
                                            onChange={(value) =>
                                              handleQuestionChange(
                                                qIndex,
                                                index,
                                                "maxFileSizeMB",
                                                value !== ""
                                                  ? value
                                                  : null,
                                              )
                                            }
                                          />
                                        </div>
                                        <div className="w-full lg:w-[49%]">
                                          <DropdownMenu
                                            options={[
                                              { label: "Yes", value: "true" },
                                              { label: "No", value: "false" },
                                            ]}
                                            value={
                                              question.allowMultiple
                                                ? "true"
                                                : "false"
                                            }
                                            onChange={(selected) =>
                                              handleQuestionChange(
                                                qIndex,
                                                index,
                                                "allowMultiple",
                                                selected === "true",
                                              )
                                            }
                                            label="Allow Multiple Files"
                                          />
                                        </div>
                                        <div className="w-full">
                                          <InputField
                                            label="Allowed File Types (comma separated, e.g. .pdf, .docx)"
                                            id={`question-allowedfiletypes-${index}-${qIndex}`}
                                            value={
                                              question.allowedFileTypes
                                                ? question.allowedFileTypes.join(
                                                    ", ",
                                                  )
                                                : ""
                                            }
                                            placeholder="e.g. .pdf, .docx"
                                            onChange={(e) =>
                                              handleQuestionChange(
                                                qIndex,
                                                index,
                                                "allowedFileTypes",
                                                e.target.value
                                                  ? e.target.value
                                                      .split(/\s*,\s*/)
                                                      .filter(Boolean)
                                                  : [],
                                              )
                                            }
                                          />
                                        </div>
                                      </>
                                    )}
                                    <div className="space-y-2">
                                      <p className="text-primary text-[12px] md:text-[13px] lg:text-[14px]">
                                        {pageErrors[index]?.questions?.[qIndex]
                                          ?.questionText ?? ""}
                                      </p>
                                      <p className="text-primary text-[12px] md:text-[13px] lg:text-[14px]">
                                        {pageErrors[index]?.questions?.[qIndex]
                                          ?.questionType ?? ""}
                                      </p>
                                      <p className="text-primary text-[12px] md:text-[13px] lg:text-[14px]">
                                        {pageErrors[index]?.questions?.[qIndex]
                                          ?.choices ?? ""}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))
                        ) : (
                          <p className="text-sm text-gray-600 dark:text-text-muted-foreground">
                            No questions added yet. Click "Add Question" to
                            create your first question.
                          </p>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                  <Activity
                    mode={
                      branchSections.filter(
                        (branch) => branch.formBranch.sourcePage === index,
                      ).length > 0
                        ? "visible"
                        : "hidden"
                    }
                  >
                    {branchSections
                      .filter(
                        (branch) => branch.formBranch.sourcePage === index,
                      )
                      .map((branch) => (
                        <div className="space-y-2" key={branch.formBranch.id}>
                          <BranchInfo
                            setBranchSections={setBranchSections}
                            ref={branch.ref}
                            initialValue={branch.formBranch}
                          />
                          {branchSectionErrors[branch.formBranch.id] && (
                            <div className="space-y-2 text-primary text-[12px] md:text-[13px] lg:text-[14px]">
                              {branchSectionErrors[branch.formBranch.id]
                                ?.questionNumber !== "" && (
                                <p>
                                  {
                                    branchSectionErrors[branch.formBranch.id]
                                      .questionNumber
                                  }
                                </p>
                              )}
                              {branchSectionErrors[branch.formBranch.id]
                                ?.assertOn !== "" && (
                                <p>
                                  {
                                    branchSectionErrors[branch.formBranch.id]
                                      .assertOn
                                  }
                                </p>
                              )}
                              {branchSectionErrors[branch.formBranch.id]
                                ?.targetPage !== "" && (
                                <p>
                                  {
                                    branchSectionErrors[branch.formBranch.id]
                                      .targetPage
                                  }
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                  </Activity>
                  <div className="flex gap-2 md:gap-3 md:justify-start justify-center items-center">
                    <Button
                      type="primary"
                      width="small"
                      onClick={() => handleAddQuestion(index)}
                      buttonText="Add Question"
                    />
                    <Button
                      type="secondary"
                      width="small"
                      onClick={() => handleAddBranch(index)}
                      buttonText="Add Branch"
                    />
                    {clipboard.length > 0 && allowModifiers && (
                      <Button
                        type="tertiary"
                        width="fit"
                        onClick={() => handlePasteQuestions(index)}
                        buttonText={`Paste`}
                      />
                    )}
                  </div>
                  <p className="text-primary text-[12px] md:text-[13px] lg:text-[14px]">
                    {pageErrors[index]?.questionCount}
                  </p>
                </Activity>
                <Activity mode={!showHidePages[index] ? "visible" : "hidden"}>
                  <p className="text-sm text-gray-600 dark:text-text-muted-foreground">
                    Page is hidden. Click the eye icon to show.
                  </p>
                </Activity>
              </div>
            ))
          ) : (
            <>
              <p className="text-sm text-gray-600 dark:text-text-muted-foreground">
                No pages added yet. Click "Add Page" to create your first page.
              </p>
              {mainError && (
                <p className="text-primary -mt-2 text-[12px] md:text-[13px] lg:text-[14px]">
                  {mainError}
                </p>
              )}
            </>
          )}
        </DragDropContext>
        <Button
          type="primary"
          onClick={() => handleAddPage()}
          buttonText="Add Page"
        />
      </div>
    );
  },
);

export default PagesInfo;
