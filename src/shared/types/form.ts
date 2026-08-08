import type { Question, Answer, questionError } from "./question";

export interface formBranch {
    id: string;
    sourcePage: number;
    questionNumber: number;
    assertOn: string;
    targetPage: number;
}

export interface formPage {
    id?: string;
    title: string;
    nextPage: number;
    description: string;
    questions: Question[];
    toBranch?: formBranch[];
    toBranches? : serverResponseBranch[];
}

export interface serverRequestForm {
    googleSheetId: string;
    googleDriveId: string;
    formType: string;
    sheetName: string;
    isClosed: boolean;
    title: string;
    description: string;
    pages: formPage[];
    branches?: { sourcePageNumber: number; questionNumber: number; assertOn: string; targetPageNumber: number }[];
};

export interface serverRequestBranch {
    sourcePageNumber: number;
    questionNumber: number;
    assertOn: string;
    targetPageNumber: number;
};

export interface serverResponseForm {
    formId: string;
    sheetName: string;
    formType: string;
    googleSheetId: string;
    googleDriveId: string;
    title: string;
    isClosed: boolean;
    description: string;
    pages: formPage[];
    branches: serverResponseBranch[];
    createdAt: string;
    updatedOn: string;
};

export interface serverResponseBranch {
    assertOn : string;
    sourcePageNumber : number;
    questionNumber : number;
    targetPageNumber : number;
    id: string;
    questionId: string;
    sourcePageId: string;
    targetPageId: string;
}

export interface formPageError {
    pageIndex: number;
    title: string;
    description: string;
    questionCount?: string;
    questions: questionError[];
}

export interface formBranchError {
    branchId: string;
    questionNumber: string;
    assertOn: string;
    targetPage: string;
}

export interface form {
    id: string;
    formType: string;
    googleSheetId: string;
    googleDriveId: string;
    sheetName: string;
    pages: formPage[];
    title: string;
    description: string;
    createdAt: string;
    isClosed: boolean;
    updatedAt: string;
}


export interface clientSideBranch {
    [questionId: number]: { assertOn: string, targetPage: number }
};

export type QuestionCardHandle = { validate: () => boolean, collect: () => Answer, clear: () => void, reassign: (answer: Answer) => void };

export type FormEditorHandle = { collect: () => boolean };

export type FormEditorPageHandle = { collect: () => { hasErrors: boolean; pages?: formPage[] } };

export type FormBranchHandle = { collect: (questionAnswers: string[]) => formBranch, fetchQuestionNumber: () => number };