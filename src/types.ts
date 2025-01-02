export interface Question {
    id: number;
    question: string;
    options: string[];
    correctAnswers: number[];
  }
  
  export interface Response {
    [questionId: number]: number[];
  }
  