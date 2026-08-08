import React, { useState } from 'react';
import type { form, formBranch, formBranchError, FormBranchHandle, formPage, formPageError } from '@/shared/types/form';
import type { Question } from '@/shared/types/question';
import { toast } from 'react-hot-toast';
import { reIndexFormPages, reIndexPageQuestions, sanitizeQuestion } from './formEditorHelpers';
import { addQuestionError } from './formEditorHelpers';
import { QUESTION_TYPES } from '@/constants/formConstants';
import type { DropResult } from '@hello-pangea/dnd';

export default function useFormEditorHandlers(formDataState: form, setFormDataState: React.Dispatch<React.SetStateAction<form>>, setQuestionCount: (count: number) => void) {
    const [showHidePages, setShowHidePages] = useState<{[index: number]: boolean}>({});
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
    const [clipboard, setClipboard] = useState<Question[]>([]);
    const [choiceTextBuffer, setChoiceTextBuffer] = useState<string>("");
    const [branchSections, setBranchSections] = useState<{formBranch: formBranch, ref: React.RefObject<FormBranchHandle | null>}[]>([]);
    const [pageErrors, setPageErrors] = useState<{[index: number]: formPageError}>({});
    const [mainError, setMainError] = useState<string>("");
    const [branchSectionErrors, setBranchSectionErrors] = useState<{[branchId: string]: formBranchError}>({});

    //--------------------------------------------page handlers--------------------------------------------//
    const handleAddPage = () => {
        setFormDataState((prev: form) => {
            if (!prev) return prev;
            const newPage: formPage = {title: `Page ${prev.pages ? prev.pages.length + 1 : 1}`, nextPage: 0, description: "", questions: []};
            return { ...prev, pages: [...(prev.pages || []), newPage] };
        });
        setShowHidePages((prev) => ({ ...prev, [Object.keys(prev).length]: true }));
    }

    const handleDeletePage = (pageIndex: number) => {
        setFormDataState((prev: form) => {
            if (!prev || !prev.pages) return prev;
            const updatedPages = [...prev.pages];
            updatedPages.splice(pageIndex, 1);

            const { reindexedPages, newQuestionCount } = reIndexFormPages(updatedPages);
            setQuestionCount(newQuestionCount);

            return { ...prev, pages: reindexedPages };
        });

        setShowHidePages((prev) => {
            const newState = { ...prev };
            newState[pageIndex] = !newState[pageIndex];
            return newState;
        });
    };
    
    const handleMovePage = (pageIndex: number, direction: "up" | "down") => {
        setFormDataState((prev: form) => {
            if (!prev || !prev.pages) return prev;
            const updatedPages = [...prev.pages];
            const [movedPage] = updatedPages.splice(pageIndex, 1);
            updatedPages.splice(direction === "up" ? pageIndex - 1 : pageIndex + 1, 0, movedPage);

            const { reindexedPages } = reIndexFormPages(updatedPages);

            return { ...prev, pages: reindexedPages };
        });

        setShowHidePages((prev) => {
            const newState = { ...prev };
            if(direction === "up") {
                const temp = newState[pageIndex - 1];
                newState[pageIndex - 1] = prev[pageIndex];
                newState[pageIndex] = temp;
            } else {
                const temp = newState[pageIndex + 1];
                newState[pageIndex] = prev[pageIndex + 1];
                newState[pageIndex + 1] = temp;
            }
            return newState;
        });
    };

    const handleAdjustNextPages = (pageIndex: number, value: number) => {
        setFormDataState((prev: form) => {
            if (!prev || !prev.pages) return prev;

            const updatedPages = prev.pages.map((page, index) => {
                if (index === pageIndex) {
                    return { ...page, nextPage: value };
                }
                return page;
            });

            return {
                ...prev,
                pages: updatedPages,
            };
        });
    };

    //---------------------------question handlers---------------------------//
    const handlePasteQuestions = (pageIndex: number) => {
        if (clipboard.length === 0) {
            toast.error("Clipboard is empty");
            return;
        }
        setFormDataState((prev: form) => {
            if (!prev || !prev.pages) return prev;
            const updatedPages = [...prev.pages];
            const newQuestions = clipboard.map((q) => ({ ...q, id: crypto.randomUUID() }));
            const questions = [...(updatedPages[pageIndex].questions || []), ...newQuestions];
            
            const { reindexedPages, newQuestionCount } = reIndexPageQuestions(updatedPages, pageIndex, questions);

            setQuestionCount(newQuestionCount - 1);
            setClipboard([]);
            setSelectedQuestions([]);
            return { ...prev, pages: reindexedPages };
        });
    }

    const handleAddQuestion = (pageIndex: number) => {
        setFormDataState((prev: form) => {
            if (!prev || !prev.pages) return prev;
            const updatedPages = [...prev.pages];
            const questions = [...(updatedPages[pageIndex].questions || [])];
            questions.push({ questionNumber: 0, questionText: "", questionType: "Essay", isMandatory: false, id: crypto.randomUUID() });

            const { reindexedPages, newQuestionCount } = reIndexPageQuestions(updatedPages, pageIndex, questions);
            setQuestionCount(newQuestionCount - 1);
            return { ...prev, pages: reindexedPages };
        });
    }

    const handleRemoveQuestion = (pageIndex: number, questionIndex: number) => {
        setFormDataState((prev: form) => {
            if (!prev || !prev.pages) return prev;
            const updatedPages = [...prev.pages];
            const questions = (updatedPages[pageIndex].questions || []).filter((_, idx) => idx !== questionIndex);

            const { reindexedPages, newQuestionCount } = reIndexPageQuestions(updatedPages, pageIndex, questions);
            setQuestionCount(newQuestionCount - 1);
            return { ...prev, pages: reindexedPages };
        });
    }

    const handleQuestionChange = (index: number, pageIndex: number, field: string, value: string | string[] | boolean | number | null) => {
        setFormDataState((prev: form) => {
            if (!prev || !prev.pages) return prev;
            if (value === null) {
                const updatedPages = [...prev.pages];
                const updatedQuestions = [...(updatedPages[pageIndex].questions || [])];
                delete (updatedQuestions[index] as any)[field];
                updatedPages[pageIndex] = { ...updatedPages[pageIndex], questions: updatedQuestions };
                return { ...prev, pages: updatedPages };
            } else {
                const updatedPages = [...prev.pages];
                const updatedQuestions = [...(updatedPages[pageIndex].questions || [])];
                updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
                updatedPages[pageIndex] = { ...updatedPages[pageIndex], questions: updatedQuestions };
                return { ...prev, pages: updatedPages };
            }
        });
    }

    //---------------------choice handlers---------------------//
    const handleAddChoice = (questionIndex: number, pageIndex: number) => {
        if (choiceTextBuffer.trim() === "") {
            toast.error("Choice text cannot be empty");
            return;
        }
        setFormDataState((prev) => {
            if (!prev || !prev.pages) return prev;
            const updatedPages = [...prev.pages];
            const updatedQuestions = [...(updatedPages[pageIndex].questions || [])];
            const question = updatedQuestions[questionIndex];
            if (question.questionType !== "MCQ") {
                toast.error("Choices can only be added to MCQ type questions");
                return prev;
            }
            const newChoice = { text: choiceTextBuffer, choiceNumber: (question.choices ? question.choices.length : 0) + 1 };
            updatedQuestions[questionIndex] = { ...question, choices: [...(question.choices || []), newChoice] };
            updatedPages[pageIndex] = { ...updatedPages[pageIndex], questions: updatedQuestions };
            return { ...prev, pages: updatedPages };
        });
        setChoiceTextBuffer("");
    }

    const handleRemoveChoice = (questionIndex: number, pageIndex: number, choiceIndex: number) => {
        setFormDataState((prev) => {
            if (!prev || !prev.pages) return prev;
            const updatedPages = [...prev.pages];
            const updatedQuestions = [...(updatedPages[pageIndex].questions || [])];
            const question = updatedQuestions[questionIndex];
            if (question.questionType !== "MCQ" || !question.choices) {
                toast.error("Invalid operation");
                return prev;
            }
            // Remove the choice and reassign choiceNumber
            const updatedChoices = question.choices
                .filter((_, idx) => idx !== choiceIndex)
                .map((choice, idx) => ({ ...choice, choiceNumber: idx + 1 }));
            updatedQuestions[questionIndex] = { ...question, choices: updatedChoices };
            updatedPages[pageIndex] = { ...updatedPages[pageIndex], questions: updatedQuestions };
            return { ...prev, pages: updatedPages };
        });
    }

    const handleMoveChoice = (questionIndex: number, pageIndex: number, choiceIndex: number, direction: "up" | "down") => {
        setFormDataState((prev) => {
            if (!prev || !prev.pages) return prev;
            const updatedPages = [...prev.pages];
            const updatedQuestions = [...(updatedPages[pageIndex].questions || [])];
            const question = updatedQuestions[questionIndex];
            if (question.questionType !== "MCQ" || !question.choices) {
                toast.error("Invalid operation");
                return prev;
            }
            const choices = [...question.choices];
            const [movedChoice] = choices.splice(choiceIndex, 1);
            choices.splice(direction === "up" ? choiceIndex - 1 : choiceIndex + 1, 0, movedChoice);
            // Reassign choiceNumber
            const reindexedChoices = choices.map((choice, idx) => ({ ...choice, choiceNumber: idx + 1 }));
            updatedQuestions[questionIndex] = { ...question, choices: reindexedChoices };
            updatedPages[pageIndex] = { ...updatedPages[pageIndex], questions: updatedQuestions };
            return { ...prev, pages: updatedPages };
        })
    };

    //-------------------branch handlers-------------------//
    const handleAddBranch = (pageIndex: number) => {
        setBranchSections((prev) => {
            const newBranch: {formBranch: formBranch, ref: React.RefObject<FormBranchHandle | null>} = {formBranch: { questionNumber: 0, assertOn: "", targetPage: 0, sourcePage: pageIndex, id: crypto.randomUUID() }, ref: React.createRef<FormBranchHandle | null>()};
            return [...prev, newBranch];
        });
    }

    //-------------validators and other helpers----------------//
    const validatePages = (): { hasErrors: boolean; pages: formPage[] } => {
        const currentPageErrors: formPageError[] = [];
        const currentBranchErrors: {[branchId: string]: formBranchError} = {};

        const sanitizedPages: formPage[] = formDataState.pages?.map((page) => ({ ...page, questions: page.questions?.map((q) => sanitizeQuestion(q, q.questionType)) })) || [];
        const branchFixedPages: formPage[] = [];

        if (!formDataState.pages || formDataState.pages.length === 0) {
            setMainError("At least one page is required.");
            return { hasErrors: true, pages: [] };
        }

        sanitizedPages.forEach((page, pIndex) => {
            if (!page.title || page.title.trim() === "") {
            currentPageErrors[pIndex] = {
                ...(currentPageErrors[pIndex] || {}),
                title: "Page title is required.",
            };
            }

            if (!page.questions || page.questions.length === 0) {
            currentPageErrors[pIndex] = {
                ...(currentPageErrors[pIndex] || {}),
                questionCount: "At least one question is required on this page.",
            };
            }

            page.questions?.forEach((question, qIndex) => {
                if (!question.questionText || question.questionText.trim() === "") {
                    addQuestionError(currentPageErrors, pIndex, qIndex, {
                    questionText: "Question text is required.",
                    });
                }
                if (!question.questionType || !QUESTION_TYPES.includes(question.questionType)) {
                    addQuestionError(currentPageErrors, pIndex, qIndex, {
                    questionType: "Invalid question type.",
                    });
                }
                if (question.questionType === "MCQ" && (!question.choices || question.choices.length === 0)) {
                    addQuestionError(currentPageErrors, pIndex, qIndex, {
                    choices: "Question must have at least one choice.",
                    });
                }
            });

            const collectedBranches : formBranch[] = [];

            branchSections.filter(branch => branch.formBranch.sourcePage === pIndex).forEach(branchSection => {
                const branchInfoRef = branchSection.ref;
                const selectedQuestionNumber = branchInfoRef.current?.fetchQuestionNumber();
                let branchData = null;

                const questionAnswers = selectedQuestionNumber ? page.questions.filter(q => q.questionNumber == selectedQuestionNumber).map(q => {
                    if(q.questionType === "MCQ" && q.choices) {
                        return q.choices.map(c => c.text);
                    } else {
                        return q.questionText ? [q.questionText] : [];
                    }
                }) : [];

                branchData = branchInfoRef.current?.collect(questionAnswers.flat());
                if(!branchData)
                    return;

                if (branchData.questionNumber === undefined || isNaN(branchData.questionNumber) || branchData.questionNumber <= 0) {
                    currentBranchErrors[branchSection.formBranch.id] = {
                        ...(currentBranchErrors[branchSection.formBranch.id] || {}),
                        questionNumber: "Has a branch with an invalid question number.",
                    };
                }

                if (branchData.targetPage === undefined || isNaN(branchData.targetPage) || branchData.targetPage <= 0 || branchData.targetPage > sanitizedPages.length + 1) {
                    currentBranchErrors[branchSection.formBranch.id] = {
                        ...(currentBranchErrors[branchSection.formBranch.id] || {}),
                        targetPage: "Has a branch with an invalid target page.",
                    };
                }

                if (!branchData.assertOn || branchData.assertOn.trim() === "") {
                    currentBranchErrors[branchSection.formBranch.id] = {
                        ...(currentBranchErrors[branchSection.formBranch.id] || {}),
                        assertOn: "Has a branch with empty assert-on value.",
                    };
                }

                const questionExistsOnPage = branchData.questionNumber !== undefined &&
                    page.questions.some(q => q.questionNumber === branchData!.questionNumber);
                if (branchData.questionNumber !== undefined && !questionExistsOnPage) {
                    currentBranchErrors[branchSection.formBranch.id] = {
                        ...(currentBranchErrors[branchSection.formBranch.id] || {}),
                        questionNumber: "Question Number for branching is out of the page's bounds.",
                    };
                }

                collectedBranches.push(branchData || { questionNumber: 0, assertOn: "", targetPage: 0, sourcePage: pIndex, id: branchSection.formBranch.id });
            });

            const fixedPage = { ...page, toBranch: collectedBranches.length > 0 ? collectedBranches : undefined };
            branchFixedPages.push(fixedPage);
        });

        setPageErrors(currentPageErrors);
        setBranchSectionErrors(currentBranchErrors);
        setFormDataState((prev) => ({ ...prev, pages: branchFixedPages }));
        return { hasErrors: currentPageErrors.length !== 0 || Object.keys(currentBranchErrors).length > 0, pages: branchFixedPages };
    };

    const handleDragEnd = (result : DropResult) => {
        const { source, destination } = result;

        // dropped outside any droppable area
        if (!destination) return;

        const sourcePageIndex = parseInt(source.droppableId.split("-")[1], 10);
        const destPageIndex = parseInt(destination.droppableId.split("-")[1], 10);

        // nothing changed
        if (
            sourcePageIndex === destPageIndex &&
            source.index === destination.index
        ) {
            return;
        }

        setFormDataState((prev) => {
            if (!prev || !prev.pages) return prev;

            const updatedPages = prev.pages.map((p) => ({ ...p, questions: [...(p.questions || [])] }));

            const [movedQuestion] = updatedPages[sourcePageIndex].questions.splice(source.index, 1);

            updatedPages[destPageIndex].questions.splice(destination.index, 0, movedQuestion);

            let globalCounter = 1;
            const pagesWithReindexedQuestions = updatedPages.map((page) => {
            const reindexed = page.questions.map((q) => {
                return { ...q, questionNumber: globalCounter++ };
            });
            return { ...page, questions: reindexed };
            });

            return {
            ...prev,
            pages: pagesWithReindexedQuestions,
            };
        });
    };


    return {
        handleAddPage,
        handleDeletePage,
        handleMovePage,
        handleAdjustNextPages,
        handleAddQuestion,
        handleRemoveQuestion,
        handleQuestionChange,
        handlePasteQuestions,
        handleAddChoice,
        handleRemoveChoice,
        handleMoveChoice,
        handleAddBranch,
        handleDragEnd,
        validatePages,
        clipboard,
        setClipboard,
        selectedQuestions,
        setSelectedQuestions,
        choiceTextBuffer,
        setChoiceTextBuffer,
        showHidePages,
        setShowHidePages,
        branchSections,
        setBranchSections,
        pageErrors,
        mainError,
        branchSectionErrors,
    };
}