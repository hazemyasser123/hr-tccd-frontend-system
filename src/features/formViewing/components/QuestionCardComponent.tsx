import type { Question, Answer } from '@/shared/types/question';
import EssayQuestionCard from './EssayQuestionCard';
import MCQQuestionCard from './MCQQuestionCard';
import DateQuestionCard from './DateQuestionCard';
import NumberQuestionCard from './NumberQuestionCard';
import { forwardRef } from 'react';
import type { QuestionCardHandle } from '@/shared/types/form';
import UploadQuestionCard from './UploadQuestionCard';

interface QuestionCardComponentProps {
  question: Question;
  initialValue?: Answer;
}

const QuestionCardComponent = forwardRef<QuestionCardHandle, QuestionCardComponentProps>(({
  question,
  initialValue,
}, ref) => {
  
  if (question.questionType === 'Essay') {
    const essayInitialValue = initialValue && typeof initialValue === 'string'
      ? initialValue
      : undefined;

    return (
      <EssayQuestionCard
        ref={ref}
        question={question}
        initialValue={essayInitialValue}
      />
    );
  }

  if (question.questionType === 'MCQ') {
    const mcqInitialValue = initialValue && typeof initialValue === 'string'
      ? initialValue
      : undefined;

    return (
      <MCQQuestionCard
        ref={ref}
        question={question}
        initialValue={mcqInitialValue}
      />
    );
  }

  if (question.questionType === 'Date') {
    const dateInitialValue = initialValue && typeof initialValue === 'string'
      ? initialValue
      : undefined;

    return (
      <DateQuestionCard
        ref={ref}
        question={question}
        initialValue={dateInitialValue}
      />
    );
  }

  if (question.questionType === 'Number') {
    const numberInitialValue = initialValue && typeof initialValue === 'number'
      ? initialValue
      : undefined;

    return (
      <NumberQuestionCard
        ref={ref}
        question={question}
        initialValue={numberInitialValue}
      />
    );
  }

  if (question.questionType === 'Upload') {
    const uploadInitialValue = initialValue && (typeof initialValue === 'string' || Array.isArray(initialValue))
      ? initialValue
      : undefined;

    return (
      <UploadQuestionCard
        ref={ref}
        question={question}
        initialValue={uploadInitialValue}
      />
    );
  }

  return <div>Unsupported question type</div>;
});

export default QuestionCardComponent;