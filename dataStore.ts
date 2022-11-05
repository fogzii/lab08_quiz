interface answer {
    isCorrect: boolean,
    answerString: string,
}

interface question {
    questionId: number,
    questionString: string,
    questionType: 'single' | 'multiple',
    answers: answer[],
}

interface quiz {
    quizId: number,
    quizTitle: string,
    quizSynopsis: string,
    questions: question[],
}

interface dataBase {
    quiz: quiz[],
    idCount: number,
}

let data: dataBase = {
    quiz: [],
    idCount: 0,
}

/*
    data: 
    [
        {
            quizId: number,
            quizTitle: string,
            quizSynopsis: string,
            questions: [
                {
                    questionId: number,
                    questionString: string,
                    questionType: string,
                    answers: [
                        {
                            isCorrect: boolean,
                            answerString: string,
                        }
                    ]
                }
            ]
        }
    ],
*/

export function getData() {
    return data;
}

export function setData(newData: dataBase) {
    data = newData;
}
