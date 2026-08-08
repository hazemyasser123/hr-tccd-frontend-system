import { useState } from "react";
import type { Judge } from "@/shared/types/judgingSystem";
import { useCreateJudge } from "@/shared/queries/judgingSystem/judgeQueries";
import toast from "react-hot-toast";

export default function useManageJudgeModalUtils () {
    const [judgeDataState, setJudgeDataState] = useState<Judge | undefined>({} as Judge);
    const [formErrors, setFormErrors] = useState<{attr: string, value:string}[]>([]);
    const createJudgeMutation = useCreateJudge();
    const isLoading = createJudgeMutation.isPending;

    const validateJudgeData = (): {attr: string, value:string}[] => {
        const errors: {attr: string, value:string}[] = [];

        if(!judgeDataState?.firstName || judgeDataState.firstName.trim() === "") errors.push({attr: "firstName", value: "Judge first name is required."});
        if(!judgeDataState?.lastName || judgeDataState.lastName.trim() === "") errors.push({attr: "lastName", value: "Judge last name is required."});
        if(!judgeDataState?.password || judgeDataState.password.trim() === "") {
            errors.push({attr: "password", value: "Judge password is required."});
        } else {
            const pwd = judgeDataState.password.trim();
            const strongPwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;
            if(!strongPwdRegex.test(pwd)) {
                errors.push({attr: "password", value: "Password must include uppercase, lowercase, number, and special character."});
            }
        }
        return errors;
    }

    const submitJudge = () => {
        setJudgeDataState((prev : Judge | undefined) => {
            if (!prev) return prev;
            return {id: "", name: `${prev.firstName?.trim()} ${prev.lastName?.trim()}`, firstName: prev.firstName?.trim(), lastName: prev.lastName?.trim(), email: "", password: prev.password?.trim(), assignedTeams: []};
        });
        const errors = validateJudgeData();
        if(errors.length > 0) {
            setFormErrors(errors);
            return;
        }
        createJudgeMutation.mutate(judgeDataState as Judge, {
            onSuccess: () => {
                toast.success("Judge created successfully.");
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            },
            onError: () => {
                toast.error("Failed to create judge, please try again later.")
            }
        });
    }

    const handleChangeJudgeData = (attr: keyof Judge, value: string) => {
        setJudgeDataState((prev : Judge | undefined) => prev ? {...prev, [attr]: value} : prev);
    }

    return {
        judgeDataState,
        handleChangeJudgeData,
        formErrors,
        submitJudge,
        isLoading,
    }
};