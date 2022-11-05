import HTTPError from 'http-errors';
import { getData, setData } from './dataStore';

export function quizCreate(quizTitle: string, quizSynopsis: string) {
  if (quizTitle === '') {
    throw HTTPError(400, 'quizTitle is an empty string');
  }

  if (quizSynopsis === '') {
    throw HTTPError(400, 'quizSynopsis is an empty string');
  }

  const data = getData();
  const quizId = data.idCount;
  data.idCount++;
  data.quiz.push(
    {
        quizId: quizId,
        quizTitle: quizTitle,
        quizSynopsis: quizSynopsis,
        questions: [],
    }
  );
  setData(data);

  return { quizId }
}

export function quizDetails(quizId: number) {
    const data = getData();
    const quiz = data.quiz.find(q => q.quizId === quizId);
    if (!quiz) {
        throw HTTPError(400, 'quizId does not refer to a valid quiz');
    }

    return { quiz }
}

export function quizEdit(quizId: number, quizTitle: string, quizSynopsis: string) {
    if (quizTitle === '') {
        throw HTTPError(400, 'quizTitle is an empty string');
    }
    
    if (quizSynopsis === '') {
        throw HTTPError(400, 'quizSynopsis is an empty string');
    }    
    
    const data = getData();
    const quiz = data.quiz.find(q => q.quizId === quizId);
    if (!quiz) {
        throw HTTPError(400, 'quizId does not refer to a valid quiz');
    }

    quiz.quizTitle = quizTitle;
    quiz.quizSynopsis = quizSynopsis;

    setData(data);
    return { }
}

export function quizRemove(quizId: number) {
    const data = getData();
    if (!data.quiz.find(q => q.quizId === quizId)) {
        throw HTTPError(400, 'quizId does not refer to a valid quiz');
    }

    const index = data.quiz.findIndex(q => q.quizId === quizId);
    data.quiz.splice(index, 1);

    setData(data);
    return { }
}

export function quizzesList() {
    const data = getData();
    const quizzes = [];
    for (const quiz of data.quiz) {
        quizzes.push(
            {
                quizId: quiz.quizId,
                quizTitle: quiz.quizTitle,
            }
        );
    }

    return { quizzes }
}
