import { useMutation, useQuery, type UseQueryResult, useQueryClient } from "@tanstack/react-query"
import * as formAPI from "./formAPI"
import type { form, serverRequestForm, serverResponseForm } from "@/shared/types/form"
import type { Answer } from "@/shared/types/question"
import { formRequestMapper, formResponseMapper, formLocalMapper } from "@/shared/utils/FormMapping"

const formKeys = {
    all: ["forms"] as const,
    getForms: (page: number, count: number, createdAfter: string, searchKey: string, selectedType: string, sortBy: string) => [...formKeys.all, { page, count, createdAfter, searchKey, selectedType, sortBy }] as const,
    getForm: (formId: string) => [...formKeys.all, formId] as const,
    saveAnswer: (formId: string, questionId: number, answer: Answer, formName: string) => [...formKeys.getForm(formId), "saveAnswer", questionId, answer, formName] as const,
    submitForm: (formId: string, formName: string) => [...formKeys.getForm(formId), "submitForm", formName] as const,
    createForm: () => [...formKeys.all, "createForm"] as const,
    deleteForm: (formId: string) => [...formKeys.getForm(formId), "deleteForm"] as const,
    updateForm: (formId: string) => [...formKeys.getForm(formId), "updateForm"] as const,
    modifyFormStatus: () => [...formKeys.all, "modifyFormStatus"] as const,
    getFormAccessList: (formId: string, nameKey: string, page: number, count: number) => [...formKeys.getForm(formId), "accessList", { nameKey, page, count }] as const,
}

export const useForms = (page: number, count: number, createdAfter: string, searchKey: string, selectedType: string, sortBy: string) => {
    return useQuery({
        queryKey: formKeys.getForms(page, count, createdAfter, searchKey, selectedType, sortBy),
        queryFn: async () => {
            const data = await formAPI.getForms(page, count, createdAfter, searchKey, selectedType, sortBy);
            const mappedForms = data.data.data.map((form : serverResponseForm) => formResponseMapper(form, false));
            return {...data.data, data: mappedForms};
        },
    })
}

export const useForm = (id: string, formTags: boolean): UseQueryResult<form, Error> => {
    return useQuery({
        queryKey: formKeys.getForm(id),
        queryFn: async () => {
            if(id === "local") {
                return formLocalMapper();
            }
            const data = await formAPI.getForm(id);
            const mappedForm = formResponseMapper(data.data as serverResponseForm, formTags);
            return mappedForm;
        },
        enabled: id != "new",
    })
}

export const useSaveAnswer = (formId: string, questionId: number, answer: Answer, formName: string) => {
    return useMutation({
        mutationKey: formKeys.saveAnswer(formId, questionId, answer, formName),
        mutationFn: () => formAPI.saveAnswer(formId, questionId, answer, formName),
    })
};

export const useSubmitForm = (formId: string, formName: string) => {
    return useMutation({
        mutationKey: formKeys.submitForm(formId, formName),
        mutationFn: (answers: Answer[]) => {
            const mappedAnswers = answers.map((ans) => {
                if (Array.isArray(ans.answer)) {
                    return ans.answer.join(",");
                } else if (typeof ans.answer === "number") {
                    return ans.answer.toString();
                } else if (typeof ans.answer === "string") {
                    return ans.answer;
                } else {
                    return "";
                }
            });
            return formAPI.submitForm(formId, mappedAnswers);
        },
    });
};

export const useCreateForm = () => {
    return useMutation( {
        mutationFn: (formData: form) => {
            const mappedFormData = formRequestMapper(formData) as serverRequestForm;
            return formAPI.createForm(mappedFormData);
        },
    })
}

export const useDeleteForm = () => {
    const qc = useQueryClient();

    return useMutation( {
        mutationFn: (formId: string) => {
            return formAPI.deleteForm(formId);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: formKeys.all });
        }
    });
};

export const useUpdateForm = (formId: string) => {
    return useMutation( {
        mutationFn: (formData: form) => {
            const mappedFormData = formRequestMapper(formData) as serverRequestForm;
            return formAPI.updateForm(formId, mappedFormData);
        },
    })
}

export const useModifyFormStatus = () => {
    return useMutation({
        mutationFn: ({ formId, isClosed }: { formId: string; isClosed: boolean }) => {
            return formAPI.modifyFormStatus(formId, isClosed);
        },
    });
};

export const useUploadSubmissionMedia = (formId: string) => {
    return useMutation({
        mutationFn: (media: File[]) => {
            const uploadUrls: Promise<string>[] = [];
            media.forEach((file) => {
                uploadUrls.push(formAPI.uploadSubmissionMedia(formId, file));
            });
            return Promise.all(uploadUrls);
        },
    });
};

export const useFormAccessList = (formId: string, nameKey: string, page: number, count: number): UseQueryResult<any, Error> => {
    return useQuery({
        queryKey: formKeys.getFormAccessList(formId, nameKey, page, count),
        queryFn: async () => {
            const data = await formAPI.getFormAccessList(formId, nameKey, page, count);
            return data.data;
        },
    });
};

export const useGrantFormAccess = () => {
    return useMutation({
        mutationFn: ({ formId, userId }: { formId: string; userId: string }) => {
            return formAPI.grantFormAccess(formId, userId);
        },
    });
};

export const useRevokeFormAccess = () => {
    return useMutation({
        mutationFn: ({ formId, userId }: { formId: string; userId: string }) => {
            return formAPI.revokeFormAccess(formId, userId);
        },
    });
};
