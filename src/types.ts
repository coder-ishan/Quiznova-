export interface Question {
  id: number;
  question: string;
  type: string; // "multiple choice", "numerical", or "image"
  options?: string[]; // Optional for numerical questions
  correctAnswers?: number[]; // Optional for numerical questions
  correctAnswer?: number; // Optional for multiple choice and image questions
  questionLink?: string; // Optional for image questions
}
  
  export interface Response {
    [key: number]: (number | string)[];
  }
  