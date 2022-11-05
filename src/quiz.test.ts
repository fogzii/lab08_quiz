/**
 * Note: tests below are not written with the best design in mind,
 * and there may be code duplications. You should aim to avoid this!
 *
 * Also, you are expected to either write more tests or modify your
 * implementation to achieve 100% coverage while still adhering to the
 * specification
 */

import request, { HttpVerb } from 'sync-request';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;

// ========================================================================= //

// Helpers

function requestHelper(method: HttpVerb, path: string, payload: object) {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    // PUT/POST
    json = payload;
  }
  const res = request(method, SERVER_URL + path, { qs, json });

  if (res.statusCode !== 200) {
    // Return error code number instead of object in case of error.
    // (just for convenience)
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

// ========================================================================= //

interface Answer {
    isCorrect: boolean;
    answerString: string;
}

// Wrapper functions

function clear() {
  return requestHelper('DELETE', '/clear', {});
}

function root() {
  return requestHelper('GET', '/', {});
}

function echo(message: string) {
  return requestHelper('GET', '/echo/echo', { message });
}

function quizCreate(quizTitle: string, quizSynopsis: string) {
  return requestHelper('POST', '/quiz/create', { quizTitle, quizSynopsis });
}

function quizDetails(quizId: number) {
  return requestHelper('GET', '/quiz/details', { quizId });
}

function quizEdit(quizId: number, quizTitle: string, quizSynopsis: string) {
  return requestHelper('PUT', '/quiz/edit', { quizId, quizTitle, quizSynopsis });
}

function quizRemove(quizId: number) {
  return requestHelper('DELETE', '/quiz/remove', { quizId });
}

function quizzesList() {
  return requestHelper('GET', '/quizzes/list', {});
}

function questionAdd(quizId: number, questionString: string, questionType: string, answers: Answer[]) {
  return requestHelper('POST', '/question/add', { quizId, questionString, questionType, answers });
}

function questionEdit(questionId: number, questionString: string, questionType: string, answers: Answer[]) {
  return requestHelper('PUT', '/question/edit', { questionId, questionString, questionType, answers });
}

function questionRemove(questionId: number) {
  return requestHelper('DELETE', '/question/remove', { questionId });
}

// ========================================================================= //

beforeEach(clear);
afterAll(clear);

describe('/', () => {
  test('success', () => {
    expect(root()).toStrictEqual({ message: expect.any(String) });
  });
});

describe('/echo', () => {
  test('success', () => {
    expect(echo('helloworld')).toStrictEqual({ message: 'helloworld' });
  });

  test('failure', () => {
    expect(echo('echo')).toStrictEqual(400);
  });
});

describe('/quiz/create', () => {
  describe('failure', () => {
    test.each([
      { quizTitle: '', quizSynopsis: 'valid' },
      { quizTitle: 'valid', quizSynopsis: '' },
      { quizTitle: '', quizSynopsis: '' },
    ])("quizTitle='$quizTitle', quizSynopsis='$quizSynopsis'", ({ quizTitle, quizSynopsis }) => {
      expect(quizCreate(quizTitle, quizSynopsis)).toEqual(400);
    });
  });

  describe('success', () => {
    test('valid inputs', () => {
      expect(quizCreate('validTitle', 'validSynopsis')).toStrictEqual({ quizId: expect.any(Number) });
    });

    test('unique ids', () => {
      const quiz1 = quizCreate('validTitle', 'validSynopsis');
      const quiz2 = quizCreate('validTitle', 'validSynopsis');
      const quiz3 = quizCreate('validTitle', 'validSynopsis');
      const uniqueIds = Array.from(new Set([quiz1.quizId, quiz2.quizId, quiz3.quizId]));
      expect(uniqueIds).toHaveLength(3);
    });
  });
});

describe('/quiz/details', () => {
  describe('error', () => {
    test('empty state', () => {
      expect(quizDetails(999)).toEqual(400);
    });

    test('wrong id', () => {
      const quiz = quizCreate('valid', 'valid');
      expect(quizDetails(quiz.quizId + 1)).toEqual(400);
    });
  });

  describe('success', () => {
    test('correct details single quiz', () => {
      const quiz = quizCreate('valid title', 'valid sypnosis');
      expect(quizDetails(quiz.quizId)).toStrictEqual({
        quiz: {
          quizId: quiz.quizId,
          quizTitle: 'valid title',
          quizSynopsis: 'valid sypnosis',
          questions: [],
        }
      });
    });

    test('correct details multiple', () => {
      const quiz1 = quizCreate('t1', 's1');
      const quiz2 = quizCreate('t2', 's2');
      const quiz3 = quizCreate('t3', 's3');
      const expected = [
        {
          quizId: quiz1.quizId,
          quizTitle: 't1',
          quizSynopsis: 's1',
          questions: [],
        },
        {
          quizId: quiz2.quizId,
          quizTitle: 't2',
          quizSynopsis: 's2',
          questions: [],
        },
        {
          quizId: quiz3.quizId,
          quizTitle: 't3',
          quizSynopsis: 's3',
          questions: [],
        },
      ];
      const received = [
        quizDetails(quiz1.quizId).quiz,
        quizDetails(quiz2.quizId).quiz,
        quizDetails(quiz3.quizId).quiz,
      ];
      expect(received).toEqual(expected);
    });
  });
});

describe('/quiz/edit', () => {
  describe('error', () => {
    test('empty state', () => {
      expect(quizEdit(999, 'valid', 'valid')).toEqual(400);
    });

    test('wrong id', () => {
      const quiz = quizCreate('valid', 'valid');
      expect(quizEdit(quiz.quizId + 1, 'new', 'new')).toEqual(400);
    });

    test.each([
      { quizTitle: '', quizSynopsis: 'valid' },
      { quizTitle: 'valid', quizSynopsis: '' },
      { quizTitle: '', quizSynopsis: '' },
    ])("quizTitle='$quizTitle', quizSynopsis='$quizSynopsis", ({ quizTitle, quizSynopsis }) => {
      const quiz = quizCreate('valid', 'valid');
      expect(quizEdit(quiz.quizId, quizTitle, quizSynopsis)).toEqual(400);
    });
  });

  describe('success', () => {
    test('single quiz successful edit', () => {
      const quiz = quizCreate('valid', 'valid');
      expect(quizEdit(quiz.quizId, 'new title', 'new sypnosis')).toStrictEqual({});
      expect(quizDetails(quiz.quizId)).toStrictEqual({
        quiz: {
          quizId: quiz.quizId,
          quizTitle: 'new title',
          quizSynopsis: 'new sypnosis',
          questions: [],
        }
      });
    });

    test('multiple quiz successful edit', () => {
      const quiz1 = quizCreate('t1', 's1');
      const quiz2 = quizCreate('t2', 's2');
      const quiz3 = quizCreate('t3', 's3');
      quizEdit(quiz1.quizId, 't1 new', 's1 new');
      quizEdit(quiz2.quizId, 't2 new', 's2 new');
      quizEdit(quiz3.quizId, 't3 new', 's3 new');
      const expected = [
        {
          quizId: quiz1.quizId,
          quizTitle: 't1 new',
          quizSynopsis: 's1 new',
          questions: [],
        },
        {
          quizId: quiz2.quizId,
          quizTitle: 't2 new',
          quizSynopsis: 's2 new',
          questions: [],
        },
        {
          quizId: quiz3.quizId,
          quizTitle: 't3 new',
          quizSynopsis: 's3 new',
          questions: [],
        },
      ];
      const received = [
        quizDetails(quiz1.quizId).quiz,
        quizDetails(quiz2.quizId).quiz,
        quizDetails(quiz3.quizId).quiz,
      ];
      expect(received).toEqual(expected);
    });
  });
});

describe('/quiz/remove', () => {
  describe('error', () => {
    test('empty state', () => {
      expect(quizRemove(999)).toEqual(400);
    });

    test('wrong id', () => {
      const quiz = quizCreate('valid', 'valid');
      expect(quizRemove(quiz.quizId + 1)).toEqual(400);
    });

    test('double remove', () => {
      const quiz = quizCreate('valid', 'valid');
      expect(quizRemove(quiz.quizId)).toEqual({});
      expect(quizRemove(quiz.quizId)).toEqual(400);
    });
  });

  describe('success', () => {
    test('single removal', () => {
      const quiz = quizCreate('valid', 'valid');
      expect(quizRemove(quiz.quizId)).toStrictEqual({});
      expect(quizDetails(quiz.quizId)).toStrictEqual(400);
    });

    test('remove correct entry', () => {
      const quiz1 = quizCreate('1', '1');
      const quiz2 = quizCreate('2', '2');
      const quiz3 = quizCreate('3', '3');
      expect(quizRemove(quiz1.quizId)).toStrictEqual({});
      expect(quizRemove(quiz3.quizId)).toStrictEqual({});
      expect(quizzesList().quizzes).toStrictEqual([{ quizId: quiz2.quizId, quizTitle: '2' }]);
    });

    test('no re-using id after removal', () => {
      const quiz1 = quizCreate('1', '1');
      expect(quizRemove(quiz1.quizId)).toStrictEqual({});
      const quiz2 = quizCreate('2', '2');
      expect(quiz1.quizId).not.toEqual(quiz2.quizId);
    });
  });
});

describe('/quizzes/list', () => {
  test('list empty', () => {
    expect(quizzesList()).toStrictEqual({ quizzes: [] });
  });

  test('list single quiz', () => {
    const quiz = quizCreate('title', 'sypnosis');
    expect(quizzesList()).toStrictEqual({ quizzes: [{ quizId: quiz.quizId, quizTitle: 'title' }] });
  });

  test('list multiple quizzes', () => {
    const quiz1 = quizCreate('1', 'sypnosis');
    const quiz2 = quizCreate('2', 'sypnosis');
    const quiz3 = quizCreate('3', 'sypnosis');
    expect(quizzesList()).toStrictEqual({
      quizzes: [
        { quizId: quiz1.quizId, quizTitle: '1' },
        { quizId: quiz2.quizId, quizTitle: '2' },
        { quizId: quiz3.quizId, quizTitle: '3' },
      ],
    });
  });
});

const validTrueAnswer = { isCorrect: true, answerString: 'a' };
const commonAnswerErrors = [
  { testName: 'empty', answers: [] },
  { testName: 'one answer, empty answerString', answers: [{ isCorrect: true, answerString: '' }] },
  { testName: 'one answer, no correct', answers: [{ isCorrect: false, answerString: 'a' }] },
  { testName: 'two answers, one empty answerString', answers: [validTrueAnswer, { isCorrect: false, answerString: '' }] },
  { testName: 'two answers, no correct', answers: [{ isCorrect: false, answerString: 'a' }, { isCorrect: false, answerString: 'a' }] },
];

describe('/question/add', () => {
  describe('error', () => {
    test('empty state', () => {
      expect(questionAdd(999, 'valid', 'single', [validTrueAnswer])).toEqual(400);
    });

    test('wrong id', () => {
      const quiz = quizCreate('q', 'q');
      expect(questionAdd(quiz.quizId + 1, '?', 'single', [validTrueAnswer])).toEqual(400);
    });

    test('empty question string', () => {
      const quiz = quizCreate('q', 'q');
      expect(questionAdd(quiz.quizId, '', 'single', [validTrueAnswer])).toEqual(400);
    });

    test('invalid question type', () => {
      const quiz = quizCreate('q', 'q');
      expect(questionAdd(quiz.quizId, '?', 'sing', [validTrueAnswer])).toEqual(400);
    });

    describe.each([
      'single', 'multiple'
    ])('Common answers error, type %s', (questionType) => {
      test.each(commonAnswerErrors)('invalid answers: $testName', ({ answers }) => {
        const quiz = quizCreate('q', 'q');
        expect(questionAdd(quiz.quizId, '?', questionType, answers)).toEqual(400);
      });
    });

    test('type single, more than one correct answer', () => {
      const quiz = quizCreate('q', 'q');
      expect(questionAdd(quiz.quizId, '?', 'single', [validTrueAnswer, validTrueAnswer])).toEqual(400);
    });
  });

  describe('success', () => {
    test('add single', () => {
      const quiz = quizCreate('q', 'q');
      const question = questionAdd(quiz.quizId, '?', 'single', [validTrueAnswer]);
      expect(quizDetails(quiz.quizId)).toStrictEqual({
        quiz: {
          quizId: quiz.quizId,
          quizTitle: 'q',
          quizSynopsis: 'q',
          questions: [
            {
              questionId: question.questionId,
              questionString: '?',
              questionType: 'single',
              answers: [validTrueAnswer],
            }
          ],
        }
      });
    });

    test('add multiple', () => {
      const quiz = quizCreate('q', 'q');
      const q1 = questionAdd(quiz.quizId, '1?', 'single', [validTrueAnswer]);
      const q2 = questionAdd(quiz.quizId, '2?', 'multiple', [validTrueAnswer, validTrueAnswer]);
      const q3 = questionAdd(quiz.quizId, '3?', 'single', [validTrueAnswer]);
      expect(quizDetails(quiz.quizId)).toStrictEqual({
        quiz: {
          quizId: quiz.quizId,
          quizTitle: 'q',
          quizSynopsis: 'q',
          questions: [
            {
              questionId: q1.questionId,
              questionString: '1?',
              questionType: 'single',
              answers: [validTrueAnswer],
            },
            {
              questionId: q2.questionId,
              questionString: '2?',
              questionType: 'multiple',
              answers: [validTrueAnswer, validTrueAnswer],
            },
            {
              questionId: q3.questionId,
              questionString: '3?',
              questionType: 'single',
              answers: [validTrueAnswer],
            },
          ],
        }
      });
    });
  });
});

describe('/question/edit', () => {
  describe('error', () => {
    test('empty state', () => {
      expect(questionEdit(999, 'valid', 'single', [validTrueAnswer])).toEqual(400);
    });

    test('wrong id', () => {
      const quiz = quizCreate('q', 'q');
      const question = questionAdd(quiz.quizId, 'valid', 'single', [validTrueAnswer]);
      expect(questionEdit(question.questionId + 1, '?', 'single', [validTrueAnswer])).toEqual(400);
    });

    test('empty question string', () => {
      const quiz = quizCreate('q', 'q');
      const question = questionAdd(quiz.quizId, 'valid', 'single', [validTrueAnswer]);
      expect(questionEdit(question.questionId, '', 'single', [validTrueAnswer])).toEqual(400);
    });

    test('invalid question type', () => {
      const quiz = quizCreate('q', 'q');
      const question = questionAdd(quiz.quizId, 'valid', 'single', [validTrueAnswer]);
      expect(questionEdit(question.questionId, '?', 'sing', [validTrueAnswer])).toEqual(400);
    });

    describe.each(['single', 'multiple'])('Common answers error, type %s', (questionType) => {
      test.each(commonAnswerErrors)('invalid answers: $testName', ({ answers }) => {
        const quiz = quizCreate('q', 'q');
        const question = questionAdd(quiz.quizId, 'valid', 'single', [validTrueAnswer]);
        expect(questionEdit(question.questionId, '?', questionType, answers)).toEqual(400);
      });
    });

    test('type single, more than one correct answer', () => {
      const quiz = quizCreate('q', 'q');
      const question = questionAdd(quiz.quizId, 'valid', 'single', [validTrueAnswer]);
      expect(questionEdit(question.questionId, '?', 'single', [validTrueAnswer, validTrueAnswer])).toEqual(400);
    });
  });

  describe('success', () => {
    test('edit single', () => {
      const quiz = quizCreate('q', 'q');
      const question = questionAdd(quiz.quizId, 'old?', 'single', [validTrueAnswer]);
      questionEdit(question.questionId, 'new?', 'multiple', [validTrueAnswer, validTrueAnswer]);
      expect(quizDetails(quiz.quizId)).toStrictEqual({
        quiz: {
          quizId: quiz.quizId,
          quizTitle: 'q',
          quizSynopsis: 'q',
          questions: [
            {
              questionId: question.questionId,
              questionString: 'new?',
              questionType: 'multiple',
              answers: [validTrueAnswer, validTrueAnswer],
            }
          ],
        },
      });
    });

    test('edit multiple', () => {
      const quiz = quizCreate('q', 'q');
      const q1 = questionAdd(quiz.quizId, 'old?', 'single', [validTrueAnswer]);
      const q2 = questionAdd(quiz.quizId, 'old?', 'single', [validTrueAnswer]);
      const q3 = questionAdd(quiz.quizId, 'old?', 'single', [validTrueAnswer]);
      questionEdit(q1.questionId, '1?', 'single', [validTrueAnswer]);
      questionEdit(q2.questionId, '2?', 'multiple', [validTrueAnswer, validTrueAnswer]);
      questionEdit(q3.questionId, '3?', 'single', [validTrueAnswer]);
      expect(quizDetails(quiz.quizId)).toStrictEqual({
        quiz: {
          quizId: quiz.quizId,
          quizTitle: 'q',
          quizSynopsis: 'q',
          questions: [
            {
              questionId: q1.questionId,
              questionString: '1?',
              questionType: 'single',
              answers: [validTrueAnswer],
            },
            {
              questionId: q2.questionId,
              questionString: '2?',
              questionType: 'multiple',
              answers: [validTrueAnswer, validTrueAnswer],
            },
            {
              questionId: q3.questionId,
              questionString: '3?',
              questionType: 'single',
              answers: [validTrueAnswer],
            },
          ],
        },
      });
    });
  });
});

describe('/question/remove', () => {
  describe('error', () => {
    test('empty state', () => {
      expect(questionRemove(999)).toEqual(400);
    });

    test('wrong id remove', () => {
      const quiz = quizCreate('q', 'q');
      const question = questionAdd(quiz.quizId, 'valid', 'single', [validTrueAnswer]);
      expect(questionRemove(question.questionId + 1)).toEqual(400);
    });
  });

  describe('success', () => {
    test('single remove', () => {
      const quiz = quizCreate('q', 'q');
      const question = questionAdd(quiz.quizId, 'valid', 'single', [validTrueAnswer]);
      expect(questionRemove(question.questionId)).toStrictEqual({});
      expect(questionEdit(question.questionId, 'fail', 'single', [validTrueAnswer])).toEqual(400);
      expect(quizDetails(quiz.quizId)).toStrictEqual({
        quiz: {
          quizId: quiz.quizId,
          quizTitle: 'q',
          quizSynopsis: 'q',
          questions: [],
        },
      });
    });
    test('multiple items remove', () => {
      const quiz = quizCreate('q', 'q');
      const q1 = questionAdd(quiz.quizId, '1?', 'single', [validTrueAnswer]);
      const q2 = questionAdd(quiz.quizId, '2?', 'multiple', [validTrueAnswer, validTrueAnswer]);
      const q3 = questionAdd(quiz.quizId, '3?', 'single', [validTrueAnswer]);
      const q4 = questionAdd(quiz.quizId, '4?', 'single', [validTrueAnswer]);
      const expectQ1 = {
        questionId: q1.questionId,
        questionString: '1?',
        questionType: 'single',
        answers: [validTrueAnswer],
      };
      const expectQ2 = {
        questionId: q2.questionId,
        questionString: '2?',
        questionType: 'multiple',
        answers: [validTrueAnswer, validTrueAnswer],
      };
      const expectQ3 = {
        questionId: q3.questionId,
        questionString: '3?',
        questionType: 'single',
        answers: [validTrueAnswer],
      };
      const expectQ4 = {
        questionId: q4.questionId,
        questionString: '4?',
        questionType: 'single',
        answers: [validTrueAnswer],
      };
      expect(quizDetails(quiz.quizId)).toStrictEqual({
        quiz: {
          quizId: quiz.quizId,
          quizTitle: 'q',
          quizSynopsis: 'q',
          questions: [expectQ1, expectQ2, expectQ3, expectQ4],
        }
      });
      questionRemove(q1.questionId);
      expect(quizDetails(quiz.quizId)).toStrictEqual({
        quiz: {
          quizId: quiz.quizId,
          quizTitle: 'q',
          quizSynopsis: 'q',
          questions: [expectQ2, expectQ3, expectQ4],
        }
      });
      questionRemove(q3.questionId);
      expect(quizDetails(quiz.quizId)).toStrictEqual({
        quiz: {
          quizId: quiz.quizId,
          quizTitle: 'q',
          quizSynopsis: 'q',
          questions: [expectQ2, expectQ4],
        }
      });
      questionRemove(q4.questionId);
      expect(quizDetails(quiz.quizId)).toStrictEqual({
        quiz: {
          quizId: quiz.quizId,
          quizTitle: 'q',
          quizSynopsis: 'q',
          questions: [expectQ2],
        }
      });
      questionRemove(q2.questionId);
      expect(quizDetails(quiz.quizId)).toStrictEqual({
        quiz: {
          quizId: quiz.quizId,
          quizTitle: 'q',
          quizSynopsis: 'q',
          questions: [],
        }
      });
    });
  });
});
