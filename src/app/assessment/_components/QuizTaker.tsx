import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/app/assessment/_components/card"
import { Quiz, Question, Answer } from "@/lib/types"

// Transform function with proper typing
function transformToUIQuiz(quiz: any): Quiz {
  if (!quiz) return {} as Quiz;
  
  return {
    id: quiz.id,
    title: quiz.title,
    questions: Array.isArray(quiz.questions) ? quiz.questions.map((q: any) => ({
      id: q.id,
      text: q.text || `Question ${q.id}`,
      type: q.type || 'multiple-choice',
      orderIndex: q.orderIndex || 0,
      quizId: q.quizId || quiz.id,
      updatedAt: quiz.updatedAt,
      correctAnswer: q.answers?.find((a: any) => a.isCorrect)?.text || '',
      answers: Array.isArray(q.answers) ? q.answers.map((a: any) => ({
        id: a.id,
        text: a.text || '',
        isCorrect: a.isCorrect || false,
        questionId: a.questionId || q.id
      })) : []
    })) : [],
    author: quiz.author,
    updatedAt: quiz.updatedAt
  }
}

// Define a more flexible question type for our component
interface QuizQuestion {
  id: string | number;
  text: string;
  type: "multiple-choice" | "short-answer";
  answers: Answer[];
  correctAnswer: string;
  orderIndex?: number;
  quizId?: number;
  updatedAt?: Date;
}

export default function QuizTaker({ quiz, title: propTitle }: { quiz?: Quiz, title?: string }) {
  console.log("==================== QUIZ TAKER COMPONENT ====================")
  console.log("QuizTaker received quiz:", JSON.stringify(quiz, null, 2))
  console.log("QuizTaker received questions:", JSON.stringify(quiz?.questions, null, 2))
  
  // Handle different quiz data structures
  const title = propTitle || quiz?.title || "Untitled Quiz";
  const questions = quiz?.questions || [];
  
  console.log("QuizTaker received:", { title, questions });
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>(Array(questions.length).fill(''));
  const [showResults, setShowResults] = useState(false);
  
  // Ensure we have valid questions to work with
  const questionsToUse: QuizQuestion[] = questions.length > 0 ? questions.map((q: Question) => ({
    ...q,
    text: q.text || `Question ${q.id}`, // Use text if available, otherwise fallback to ID
    correctAnswer: q.answers?.find(a => a.isCorrect)?.text || '',
    orderIndex: q.orderIndex || 0,
    quizId: q.quizId || 0,
    updatedAt: q.updatedAt || new Date()
  })) : [
    { 
      id: 0, 
      text: "No questions available", 
      type: "short-answer", 
      answers: [], 
      correctAnswer: '',
      orderIndex: 0,
      quizId: 0,
      updatedAt: new Date()
    }
  ];
  
  console.log("Questions to use:", questionsToUse);
  
  const currentQuestion = questionsToUse[currentQuestionIndex];
  console.log("Current question:", currentQuestion);
  
  // Handle user answering a question
  const handleAnswer = (value: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = value;
    setUserAnswers(newAnswers);
  };
  
  // Calculate results
  const calculateResults = () => {
    let correctCount = 0;
    
    questionsToUse.forEach((question, index) => {
      const userAnswer = userAnswers[index]?.trim().toLowerCase();
      const correctAnswer = question.correctAnswer?.trim().toLowerCase();
      
      if (userAnswer && correctAnswer && userAnswer === correctAnswer) {
        correctCount++;
      }
    });
    
    return {
      total: questionsToUse.length,
      correct: correctCount,
      percentage: Math.round((correctCount / questionsToUse.length) * 100)
    };
  };
  
  // Show results screen
  if (showResults) {
    const results = calculateResults();
    
    return (
      <Card className="w-full mx-auto">
        <CardHeader>
          <CardTitle>Quiz Results: {title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold">
              {results.correct} / {results.total}
            </div>
            <div className="text-2xl">
              {results.percentage}%
            </div>
            <div className="pt-4">
              <Button onClick={() => setShowResults(false)}>
                Review Answers
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Question {currentQuestionIndex + 1} of {questionsToUse.length}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">
            {currentQuestion.text}
          </h3>
          
          {currentQuestion.type === 'multiple-choice' && currentQuestion.answers?.length > 0 ? (
            <RadioGroup 
              value={userAnswers[currentQuestionIndex]} 
              onValueChange={handleAnswer}
            >
              {currentQuestion.answers.map((answer, index) => (
                <div 
                  key={index} 
                  className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-accent"
                >
                  <RadioGroupItem 
                    value={answer.text} 
                    id={`option-${index}`} 
                  />
                  <Label 
                    htmlFor={`option-${index}`} 
                    className="flex-grow cursor-pointer"
                  >
                    {answer.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <Input
              value={userAnswers[currentQuestionIndex]}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Type your answer..."
            />
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex((i) => i - 1)}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" /> Previous
        </Button>
        {currentQuestionIndex === questionsToUse.length - 1 ? (
          <Button onClick={() => setShowResults(true)}>
            Submit Quiz
          </Button>
        ) : (
          <Button onClick={() => setCurrentQuestionIndex((i) => i + 1)}>
            Next <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}