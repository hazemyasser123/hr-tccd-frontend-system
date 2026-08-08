import { useState, useCallback } from "react";
import { FaQuestionCircle, FaAsterisk } from "react-icons/fa";
import type { UploadQuestion } from "@/shared/types/question";
import { createUploadValidationSchema } from "@/shared/schemas/questionSchemas";
import { forwardRef, useImperativeHandle } from "react";
import type { QuestionCardHandle } from "@/shared/types/form";
import { HTMLText } from "../../../shared/components/HTMLText";

interface UploadQuestionCardProps {
  question: UploadQuestion;
  initialValue?: string | string[];
}

const UploadQuestionCard = forwardRef<
  QuestionCardHandle,
  UploadQuestionCardProps
>(({ question, initialValue }, ref) => {
  const [files, setFiles] = useState<File[]>([]);
  const [fileNames, setFileNames] = useState<string[]>(
    initialValue
      ? Array.isArray(initialValue)
        ? initialValue
        : [initialValue]
      : []
  );
  const [errors, setErrors] = useState<string[]>([]);

  const validateQuestion = useCallback(() => {
    try {
      const schema = createUploadValidationSchema(question);

      if (files.length > 0) {
        const valueToValidate = question.allowMultiple ? files : files[0];
        schema.parse(valueToValidate);
      } else if (question.isMandatory) {
        schema.parse(undefined);
      }

      setErrors([]);
      return false;
    } catch (error: any) {
      if (error.issues) {
        setErrors(error.issues.map((issue: any) => issue.message));
      } else if (error.message) {
        setErrors([error.message]);
      }
      return true;
    }
  }, [files, fileNames, question]);

  useImperativeHandle(ref, () => ({
    validate: validateQuestion,
    collect: () => {
      if (question.allowMultiple) {
        return {
          qid: question.questionNumber,
          answer: files,
          fileNames: files.map((f) => f.name),
        };
      } else {
        return {
          qid: question.questionNumber,
          answer: files[0] ?? null,
          fileNames: files[0] ? [files[0].name] : [],
        };
      }
    },
    clear: () => {
      setFiles([]);
      setFileNames([]);
    },
    reassign: (ans) => {
      if (Array.isArray(ans.answer)) {
        setFiles(
          ans.answer instanceof File
            ? ([ans.answer] as File[])
            : (ans.answer as File[])
        );
        const filesReturn: File[] =
          ans.answer instanceof File
            ? ([ans.answer] as File[])
            : (ans.answer as File[]);
        setFileNames(filesReturn.map((f) => f.name));
      } else if (ans.answer instanceof File) {
        setFiles([ans.answer]);
        setFileNames([ans.answer.name]);
      } else {
        setFiles([]);
        setFileNames([]);
      }
    },
  }));

  return (
    <div className="bg-white dark:bg-surface-glass-bg rounded-xl shadow-md p-5 flex flex-col gap-4">
      <div className="flex items-start gap-1.5 md:gap-3">
        <FaQuestionCircle className="text-secondary text-md md:text-lg mt-1 flex-shrink-0" />
        <div className="flex-1 flex items-center gap-1">
          <h3 className="font-bold text-gray-800 dark:text-text-title text-[14px] md:text-[16px] lg:text-[18px] flex items-center gap-2">
            {question.questionText}
          </h3>
          {question.isMandatory && (
            <FaAsterisk className="text-primary size-2" />
          )}
        </div>
      </div>

      {question.description && (
        <p className="text-[13px] md:text-[14px] lg:text-[15px] text-gray-600 dark:text-text-muted-foreground italic pl-6">
          <HTMLText content={question.description} />
        </p>
      )}

      <div>
        <label
          htmlFor={`question-${question.questionNumber}`}
          className="block font-medium mb-2 dark:text-text-body-main"
        >
          Upload file{question.isMandatory ? " *" : ""}
        </label>
        <input
          type="file"
          id={`question-${question.questionNumber}`}
          accept={question.allowedFileTypes?.join(",")}
          multiple={!!question.allowMultiple}
          onChange={(e) => {
            const selected = e.target.files ? Array.from(e.target.files) : [];
            setFiles(selected);
            setFileNames(selected.map((f) => f.name));
          }}
          value={files.length === 0 ? "" : undefined}
          className="block w-full text-[11px] md:text-[12px] file:mr-4 file:py-2 file:md:px-4 file:px-3 file:rounded-full file:border-0 file:text-[11px] file:md:text-[12px] file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/80 dark:text-text-muted-foreground"
        />

        {/* display selected or reassigned filenames */}
        {fileNames.length > 0 && (
          <div className="mt-2 space-y-1">
            {fileNames.map((name, index) => (
              <div
                key={index}
                className="text-gray-700 dark:text-text-body-main text-[13px]"
              >
                {name}
              </div>
            ))}
          </div>
        )}

        {errors.length > 0 && (
          <div className="mt-2 space-y-1">
            {errors.map((error, index) => (
              <div
                key={index}
                className="text-primary text-[12px] md:text-[13px] lg:text-[14px] font-medium"
              >
                {error}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default UploadQuestionCard;
