export type Question = {
  type: "multiple-choice";
  updatedAt: Date;
  id: number | string;
  text: string;
  orderIndex: number;
  pretestId: number;
  options?: string[];
  correctAnswer: string;
  answers: Answer[];
};

export interface PretestTakerProps {
  title: string;
  pretest: Pretest;
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

export type Pretest = {
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

export type PretestWithRelations = {
  id: number;
  title: string;
  updatedAt: Date;
  questions: {
    id: number;
    pretestId: number;
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

export type PretestListItem = {
  id: string;
  title: string;
  updatedAt: Date;
  questions: Array<{
    id: string;
    type: "multiple-choice";
    question: string;
  }>;
};

export type PretestListProps = {
  pretests: PretestListItem[];
  onPretestSelect: (pretestId: string) => void;
  isLoading: boolean;
  onArchivePretest: (pretestId: string) => Promise<void>;
  onEditPretest: (pretestId: string) => void;
};

export type PretestDisplayProps = {
  pretest: Pretest;
  onBack: () => void;
  onEditPretest: (pretestId: string) => void;
  onDelete?: (pretestId: string) => void;
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
