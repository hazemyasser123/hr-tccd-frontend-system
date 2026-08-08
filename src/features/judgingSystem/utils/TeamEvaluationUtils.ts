import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import { useEventQuestions, useSubmitTeamEvaluation, useGetTeamEvaluation, useUpdateTeamEvaluation, useGetTeam, useAddTeamAttendance, useGetTeamAttendance, useUpdateTeamAttendance } from "@/shared/queries/judgingSystem/judgeQueries";
import { useEvent } from "@/shared/queries/events/eventQueries";
import toast from "react-hot-toast";
import type { EvaluationSubmission, TeamMemberAttendance } from "@/shared/types/judgingSystem";
import { useNavigate } from "react-router-dom";

export default function UseTeamEvaluationUtils() {
    const navigate = useNavigate();
    const { eventId, teamId } = useParams<{ eventId: string; teamId: string }>();

    const { data: questions, isLoading: isQuestionsLoading, isError: isQuestionsError } = useEventQuestions(eventId!);
    const { data: event, isLoading: isEventLoading, isError: isEventError } = useEvent(eventId!);
    const { data: teamData, isLoading: isTeamLoading, isError: isTeamError } = useGetTeam(teamId!);
    const { data: teamEvaluation, isLoading: isEvaluationLoading, isError: isEvaluationError } = useGetTeamEvaluation(teamId!);
    const { data: teamAttendanceData, isLoading: isAttendanceLoading } = useGetTeamAttendance(teamId!);
    
    const submitTeamEvaluationMutation = useSubmitTeamEvaluation();
    const updateTeamEvaluationMutation = useUpdateTeamEvaluation();
    const addTeamAttendanceMutation = useAddTeamAttendance();
    const updateTeamAttendanceMutation = useUpdateTeamAttendance();

    const [assessmentScores, setAssessmentScores] = useState<{ [questionId: string]: number }>({});
    const [extraNotes, setExtraNotes] = useState<string>("");
    const [teamAttendance, setTeamAttendance] = useState<TeamMemberAttendance[]>(teamAttendanceData || []);
    const [formErrors, setFormErrors] = useState<{name: string, questions: { [questionId: string]: string }} | null>(null);
        
    useEffect(() => {
        if(teamEvaluation) {
            const initialScores: { [questionId: string]: number } = {};
            teamEvaluation.evaluationItemScores.forEach(item => {
                initialScores[item.evaluationItemId] = item.score;
            });
            setAssessmentScores(initialScores);
            setExtraNotes(teamEvaluation.note || "");
            setTeamAttendance(teamAttendanceData || []);
        }
        if(teamAttendanceData) {
             setTeamAttendance(teamAttendanceData || []);
        }
    }, [teamEvaluation, teamAttendanceData]);

    const handleChangeAssessmentScore = (questionId: string, score: number) => {
        setAssessmentScores(prevScores => ({
            ...prevScores,
            [questionId]: score,
        }));
    }

    const validateData = (): boolean => {
        const errors: {name: string, questions: { [questionId: string]: string }} = { name: "", questions: {} };
        let isValid = true;
        questions?.forEach(question => {
            const score = assessmentScores[question.id];
            if(score === undefined || score < 0 || score > 10) {
                errors.questions[question.id] = "Score must be between 0 and 10.";
                isValid = false;
            }
        });
        setFormErrors(errors);
        return isValid;
    }
    
    const handleSubmitEvaluation = async () => {
        setFormErrors(null);
        if (!validateData()) {
            return;
        }

        const payload : EvaluationSubmission = {
            teamId: teamId!,
            evaluationItemScores: Object.entries(assessmentScores).map(([questionId, score]) => ({
                evaluationItemId: questionId,                
                score,
            })),

            note: extraNotes,
        }

        // Ensure all team members are included in attendance list
        const completeAttendance = teamData?.teamMembers.map(member => {
            const existingAttendance = teamAttendance.find(att => att.teamMemberId === member.id);
            return existingAttendance || { teamMemberId: member.id, attended: false };
        }) || [];

        if(!teamEvaluation) {
            await submitTeamEvaluationMutation.mutateAsync(payload, {
                onError: () => {
                    toast.error("Failed to submit evaluation. Please try again.");
                }
            });

            await addTeamAttendanceMutation.mutateAsync(completeAttendance, {
                onSuccess: () => {
                    toast.success("Evaluation submitted successfully!");
                    setTimeout(() => {
                        navigate(-1);
                    }, 1500);
                },
                onError: () => {
                    toast.error("Failed to submit attendance. Please try again.");
                }
            });
        } else {
            await updateTeamEvaluationMutation.mutateAsync(payload, {
                onError: () => {
                    toast.error("Failed to update evaluation. Please try again.");
                }
            });

            completeAttendance.forEach(async (attendance) => {
                await updateTeamAttendanceMutation.mutateAsync(attendance, {
                    onError: () => {
                        toast.error("Failed to update attendance. Please try again.");
                    }
                });
            });

            toast.success("Evaluation updated successfully!");
            setTimeout(() => {
                navigate(-1);
            }, 1500);
        }
    }

    const handleNavigateBack = () => {
        navigate(-1);
    }

    const handleChangeTeamAttendance = (memberId: string, attended: boolean) => {
        setTeamAttendance((prevAttendance) => {
            const existingRecordIndex = prevAttendance.findIndex(att => att.teamMemberId === memberId);
            if (existingRecordIndex !== -1) {
                const updatedAttendance = [...prevAttendance];
                updatedAttendance[existingRecordIndex] = { ...updatedAttendance[existingRecordIndex], attended };
                return updatedAttendance;
            } else {
                return [...prevAttendance, { teamMemberId: memberId, attended }];
            }
        });
    }

    const handleToggleAllAttendance = () => {
        if (!teamData?.teamMembers) return;
        
        // Check if all members are currently marked as attended
        const allAttended = teamData.teamMembers.every(member => 
            teamAttendance.find(att => att.teamMemberId === member.id)?.attended
        );
        
        // If all are attended, deselect all; otherwise, select all
        const newAttendanceState = !allAttended;
        
        setTeamAttendance(
            teamData.teamMembers.map(member => ({
                teamMemberId: member.id,
                attended: newAttendanceState
            }))
        );
    }

    return {
        questions,
        extraNotes,
        teamAttendance,
        setExtraNotes,
        teamData,
        isFetchingData: isQuestionsLoading || isEventLoading || isTeamLoading || isEvaluationLoading || isAttendanceLoading ,
        isFetchingError: isQuestionsError || isEventError || isTeamError || isEvaluationError,
        event,
        assessmentScores,
        handleNavigateBack,
        handleChangeAssessmentScore,
        handleSubmitEvaluation,
        handleChangeTeamAttendance,
        handleToggleAllAttendance,
        isSubmittingEvaluation: submitTeamEvaluationMutation.isPending || updateTeamEvaluationMutation.isPending,
        formErrors,
    }
}