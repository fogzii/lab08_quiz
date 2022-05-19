export interface Answer {
    isCorrect: boolean;
    answerString: string;
}

export interface Question {
    questionId: number;
    questionString: string;
    questionType: string;
    answers: Answer[];
}

export interface Quiz {
    quizId: number;
    quizTitle: string;
    quizSynopsis: string;
    questions: Question[];
}

export interface QuizItem {
    quizId: number;
    quizTitle: string;
}

export interface QuizList {
    quizzes: QuizItem[];
}
