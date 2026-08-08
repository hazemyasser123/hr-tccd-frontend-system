import { useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { FaQuestionCircle, FaAsterisk } from "react-icons/fa";
import type { DateQuestion } from "@/shared/types/question";
import { createDateValidationSchema } from "@/shared/schemas/questionSchemas";
import type { QuestionCardHandle } from "@/shared/types/form";
import { DatePicker } from "tccd-ui";
import { HTMLText } from "../../../shared/components/HTMLText";

interface DateQuestionCardProps {
  question: DateQuestion;
  initialValue?: string;
}

const DateQuestionCard = forwardRef<QuestionCardHandle, DateQuestionCardProps>(
  ({ question, initialValue }, ref) => {
    const [answer, setAnswer] = useState<string>(initialValue || "");
    const [errors, setErrors] = useState<string[]>([]);

    const validateQuestion = useCallback(() => {
      try {
        const schema = createDateValidationSchema(question);
        schema.parse(answer);
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
    }, [answer, JSON.stringify(question)]);

    useImperativeHandle(ref, () => ({
      validate: validateQuestion,
      collect: () => {
        return { qid: question.questionNumber, answer: answer };
      },
      clear: () => setAnswer(""),
      reassign: (ans) => {
        if (typeof ans.answer === "string") setAnswer(ans.answer);
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
          <DatePicker
            label=""
            id={`question-${question.questionNumber}`}
            value={answer}
            onChange={(date) => setAnswer(date)}
            minDate={question.minDate}
            maxDate={question.maxDate}
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
  }
);

export default DateQuestionCard;
