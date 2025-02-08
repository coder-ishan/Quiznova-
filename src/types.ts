export interface Question {
    id: number;
    question: string;
    options: string[];
    correctAnswers: number[];
    type:string;
  }
  
  export interface Response {
    [key: number]: (number | string)[];
  }
  