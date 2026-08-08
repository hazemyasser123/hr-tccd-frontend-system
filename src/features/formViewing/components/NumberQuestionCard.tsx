import { useState, useCallback } from "react";
import { FaQuestionCircle, FaAsterisk } from "react-icons/fa";
import type { NumberQuestion } from "@/shared/types/question";
import { createNumberValidationSchema } from "@/shared/schemas/questionSchemas";
import { forwardRef, useImperativeHandle } from "react";
import type { QuestionCardHandle } from "@/shared/types/form";
import { NumberField } from "tccd-ui";
import { HTMLText } from "../../../shared/components/HTMLText";

interface NumberQuestionCardProps {
  question: NumberQuestion;
  initialValue?: number;
}

const NumberQuestionCard = forwardRef<
  QuestionCardHandle,
  NumberQuestionCardProps
>(({ question, initialValue }, ref) => {
  const [answer, setAnswer] = useState<string>(initialValue?.toString() || "");
  const [errors, setErrors] = useState<string[]>([]);

  const validateQuestion = useCallback(() => {
    try {
      const schema = createNumberValidationSchema(question);
      const numValue = answer === "" ? undefined : Number(answer);

      if (question.isMandatory && (answer === "" || isNaN(Number(answer)))) {
        setErrors(["This field is required"]);
        return true;
      }
      if (answer !== "" && !isNaN(Number(answer))) {
        schema.parse(numValue);
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
  }, [answer, question]);

  useImperativeHandle(ref, () => ({
    validate: validateQuestion,
    collect: () => {
      return { qid: question.questionNumber, answer: Number(answer) };
    },
    clear: () => setAnswer(""),
    reassign: (ans) => {
      if (typeof ans.answer === "number") setAnswer(ans.answer.toString());
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
        <NumberField
          id={`number-question-${question.questionNumber}`}
          label=""
          value={answer}
          placeholder="Enter a number..."
          onChange={(value) => setAnswer(typeof value === "number" ? value.toString() : value)}
        />

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

export default NumberQuestionCard;
