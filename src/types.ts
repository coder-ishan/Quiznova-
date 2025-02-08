export interface Question {
    id: number;
    question: string;
    options: string[];
    correctAnswers: number[];
    correctAnswer: number;
    type:string;
    questionLink?:string;
  }
  
  export interface Response {
    [key: number]: (number | string)[];
  }
  