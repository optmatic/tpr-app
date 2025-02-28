export type Question = {
  type: "multiple-choice";
  updatedAt: Date;
  id: number | string;
  text: string;
  orderIndex: number;
  quizId: number;
  options?: string[];
  correctAnswer: string;
  answers: Answer[];
};

// export interface QuizTakerProps {
//   id: number;
//   title: string;
//   description?: string;
//   questions: QuestionProps[];
//   createdAt?: string;
//   updatedAt?: string;
// }

export interface QuizTakerProps {
  title: string;
  quiz: Quiz;
  questions: QuestionProps[];
  currentQuestionIndex: number;
  userAnswers: string[];
  showResults: boolean;
  loadingQuestions: boolean;
  fullQuestions: QuestionProps[];
  handleAnswer: (answer: string) => void;
  calculateScore: () => number;
}

export interface QuestionProps {
  id: number;
  text: string;
  type?: string;
  answers?: AnswerProps[];
  correctAnswer?: string;
}

export interface AnswerProps {
  id?: number;
  text: string;
  isCorrect?: boolean;
}

export type Resource = {
  id: number;
  title: string;
  description: string;
  downloadUrl: string;
  fileName: string;
  thumbnail: string;
  lastUpdated: string;
  year: string;
  subject: string;
  curriculumCode: string;
  topic: string;
};

export type UploadedFile = {
  id: number;
  name: string;
  size: number;
  path: string;
  lastUpdated: string;
};

export type Answer = {
  id: number;
  text: string;
  isCorrect: boolean;
};

export type Quiz = {
  id: number;
  title: string;
  updatedAt: Date;
  questions: Question[];
  author: {
    id: number;
    name: string | null;
    email: string;
    createdAt: Date;
  } | null;
};

export type QuizWithRelations = {
  id: number;
  title: string;
  updatedAt: Date;
  questions: {
    id: number;
    quizId: number;
    text: string;
    orderIndex: number;
    answers: {
      id: number;
      text: string;
      isCorrect: boolean;
      questionId: number;
    }[];
  }[];
  author: {
    id: number;
    name: string | null;
    email: string;
    createdAt: Date;
  } | null;
};

export type QuizListItem = {
  id: string;
  title: string;
  updatedAt: Date;
  questions: Array<{
    id: string;
    type: "multiple-choice";
    question: string;
  }>;
};

export type QuizListProps = {
  quizzes: QuizListItem[];
  onQuizSelect: (quizId: string) => void;
  isLoading: boolean;
  onArchiveQuiz: (quizId: string) => Promise<void>;
  onEditQuiz: (quizId: string) => void;
};

export type QuizDisplayProps = {
  quiz: Quiz;
  onBack: () => void;
  onEditQuiz: (quizId: string) => void;
};

export interface ResourceInfo {
  id: number;
  name: string;
  size: number;
  path: string;
  lastUpdated: string;
  title: string;
  yearLevel: string;
  subject: string;
  imageUrl: string;
}
