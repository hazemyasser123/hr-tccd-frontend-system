import { useEffect, useState } from "react";
import type { JudgeQuestion } from "@/shared/types/judgingSystem";
import { useEventQuestions, useCreateEventQuestion, useDeleteEventQuestion, useUpdateEventQuestion } from "@/shared/queries/judgingSystem/judgeQueries";
import toast from "react-hot-toast";

export default function useManageQuestionUtils({eventId}: {eventId: string | undefined}) {
    const { data: questions, isError, isLoading } = useEventQuestions(eventId!);
    const createEventQuestionMutation = useCreateEventQuestion();
    const deleteEventQuestionMutation = useDeleteEventQuestion();
    const updateEventQuestionMutation = useUpdateEventQuestion();

    const [questionsState, setQuestionsState] = useState<JudgeQuestion[]>([]);
    const [newQuestionState, setNewQuestionState] = useState<JudgeQuestion | null>(null);
    const [newQuestionErrors, setNewQuestionErrors] = useState<{ name?: string; itemNumber?: string }>({});
    const [editQuestionState, setEditQuestionState] = useState<JudgeQuestion | null>(null);
    const [editQuestionErrors, setEditQuestionErrors] = useState<string | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState<string>("");

    const isLoadingQuestions = isLoading;
    const isErrorQuestions = isError;
    const isLoadingUpdate = createEventQuestionMutation.isPending || deleteEventQuestionMutation.isPending || updateEventQuestionMutation.isPending;

    useEffect(() => {
        if(questions)
            setQuestionsState(questions);
    }, [questions]);

    const handleMoveQuestion = (questionId: string, direction: "up" | "down") => {
        setQuestionsState(prev => {
            const index = prev.findIndex(q => q.id === questionId);
            if(index === -1) return prev;
            const newIndex = direction === "up" ? index - 1 : index + 1;
            if(newIndex < 0 || newIndex >= prev.length) return prev;
            const newQuestions = [...prev];
            const temp = newQuestions[index];
            newQuestions[index] = newQuestions[newIndex];
            newQuestions[newIndex] = temp;
            // Update item numbers
            newQuestions[index].itemNumber = index + 1;
            newQuestions[newIndex].itemNumber = newIndex + 1;
            return newQuestions;
        });
    }

    const handleOpenQuestionAdd = () => {
        setNewQuestionState({
            id: "",
            name: "",
            itemNumber: questionsState.length + 1,
            eventId: eventId,
            description: "",
        });
    }

    const handleAddQuestion = () => {
        if(!newQuestionState) return;
        let errors : { name?: string; itemNumber?: string } = {};
        if(!newQuestionState.name || newQuestionState.name.trim() === "") {
            errors = { ...errors, name: "Question text cannot be empty." };
        }
        if(!newQuestionState.description || newQuestionState.description.trim() === "") {
            errors = { ...errors, name: "Question description cannot be empty." };
        }
        if(newQuestionState.itemNumber <= 0 || isNaN(newQuestionState.itemNumber)) {
            errors = { ...errors, itemNumber: "question number must be a positive number." };
        }
        if(newQuestionState.itemNumber > questionsState.length + 1) {
            errors = { ...errors, itemNumber: `question number cannot be greater than ${questionsState.length + 1}.` };
        }

        setNewQuestionErrors(errors);
        if(errors.name || errors.itemNumber) {
            return;
        }

        createEventQuestionMutation.mutate({
            ...newQuestionState,
        },
        {
            onSuccess: () => {
                toast.success("Question added successfully.");
                setQuestionsState(prev => {
                    const next = [...prev, newQuestionState!];
                    next.sort((a, b) => Number(a.itemNumber) - Number(b.itemNumber));
                    return next;
                });
                setNewQuestionState(null);
            },
            onError: () => {
                toast.error("Failed to add question. Please try again.");
            }
        });
    }

    const handleDeleteQuestion = (questionId: string) => {
        deleteEventQuestionMutation.mutate(questionId, {
            onSuccess: () => {
                toast.success("Question deleted successfully.");
                setQuestionsState(prev => prev.filter(q => q.id !== questionId));
                setDeleteModalOpen("");
            },
            onError: () => {
                toast.error("Failed to delete question. Please try again.");
            }
        });
    }   

    const handleUpdateQuestion = () => {
        if(!editQuestionState) return;
        let errors = "";
        if(!editQuestionState.name || editQuestionState.name.trim() === "") {
            errors = "Question text cannot be empty.";
        }

        setEditQuestionErrors(errors);
        if(errors) {
            return;
        }

        updateEventQuestionMutation.mutate(editQuestionState, {
            onSuccess: () => {
                toast.success("Question updated successfully.");
                setQuestionsState(prev => {
                    const next = prev.map(q => q.id === editQuestionState.id ? editQuestionState : q);
                    next.sort((a, b) => Number(a.itemNumber) - Number(b.itemNumber));
                    return next;
                });
                setEditQuestionState(null);
            },
            onError: () => {
                toast.error("Failed to update question. Please try again.");
            }
        });
    }

    return {
        questionsState,
        handleMoveQuestion,
        handleOpenQuestionAdd,
        handleAddQuestion,
        handleDeleteQuestion,
        handleUpdateQuestion,
        isLoadingQuestions,
        isLoadingUpdate,
        isErrorQuestions,
        newQuestionState,
        newQuestionErrors,
        setNewQuestionState,
        editQuestionState,
        editQuestionErrors,
        setEditQuestionState,
        deleteModalOpen,
        setDeleteModalOpen,
    };
}