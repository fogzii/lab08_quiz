import HTTPError from 'http-errors';
import { getData, setData } from './dataStore';

interface answer {
    isCorrect: boolean,
    answerString: string,
}

export function questionAdd(quizId: number, questionString: string, questionType: 'single' | 'multiple', answers: answer[]) {
  if (questionString === '') {
    throw HTTPError(400, 'questionString is an empty string');
  }

  if (questionType !== 'single' && questionType !== 'multiple') {
    throw HTTPError(400, 'questionType is not either "single" or "multiple"');
  }

  const data = getData();
  const quiz = data.quiz.find(q => q.quizId === quizId);
  if (!quiz) {
    throw HTTPError(400, 'quizId does not refer to a valid quiz');
  }

  if (questionType === 'single') {
    let count = 0;
    for (const answer of answers) {
      if (answer.isCorrect === true) {
        count++;
      }
    }
    if (count !== 1) {
      throw HTTPError(400, 'the questionType is "single" and there is not exactly 1 correct answer');
    }
  }

  if (!answers.find(a => a.isCorrect === true)) {
    throw HTTPError(400, 'there are no correct answers');
  }

  if (answers.find(a => a.answerString === '')) {
    throw HTTPError(400, 'any of the answerString is an empty string');
  }

  const questionId = data.idCount;
  data.idCount++;
  quiz.questions.push(
    {
      questionId: questionId,
      questionString: questionString,
      questionType: questionType,
      answers: answers,
    }
  );

  setData(data);
  return { questionId };
}

export function questionEdit(questionId: number, questionString: string, questionType: 'single' | 'multiple', answers: answer[]) {
  if (questionString === '') {
    throw HTTPError(400, 'questionString is an empty string');
  }

  if (questionType !== 'single' && questionType !== 'multiple') {
    throw HTTPError(400, 'questionType is not either "single" or "multiple"');
  }

  const data = getData();
  const quiz = data.quiz.find(qz => qz.questions.find(qn => qn.questionId === questionId));
  if (!quiz) {
    throw HTTPError(400, 'questionId does not refer to a valid question');
  }

  if (questionType === 'single') {
    let count = 0;
    for (const answer of answers) {
      if (answer.isCorrect === true) {
        count++;
      }
    }
    if (count !== 1) {
      throw HTTPError(400, 'the questionType is "single" and there is not exactly 1 correct answer');
    }
  }

  if (!answers.find(a => a.isCorrect === true)) {
    throw HTTPError(400, 'there are no correct answers');
  }

  if (answers.find(a => a.answerString === '')) {
    throw HTTPError(400, 'any of the answerString is an empty string');
  }

  const question = quiz.questions.find(q => q.questionId === questionId);
  question.questionString = questionString;
  question.questionType = questionType;
  question.answers = answers;

  setData(data);
  return { };
}

export function questionRemove(questionId: number) {
  const data = getData();
  const quiz = data.quiz.find(qz => qz.questions.find(qn => qn.questionId === questionId));
  if (!quiz) {
    throw HTTPError(400, 'questionId does not refer to a valid question');
  }

  const index = quiz.questions.findIndex(q => q.questionId === questionId);
  quiz.questions.splice(index, 1);

  setData(data);
  return {};
}
