import { useState, useEffect } from "react"
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
  CardTitle 
} from "@/app/assessment/_components/card"

// Define types locally since there's an issue with importing
interface AnswerProps {
  id?: string | number;
  text: string;
  isCorrect?: boolean;
}

interface QuestionProps {
  id: string | number;
  text: string;
  type?: string;
  answers?: AnswerProps[];
  correctAnswer?: string;
}

interface QuizProps {
  id?: string | number;
  title?: string;
  description?: string;
  questions?: QuestionProps[];
  quiz?: {
    id?: string | number;
    title?: string;
    questions?: QuestionProps[];
  };
}

export default function QuizTaker(props: any) {
  // Handle different quiz data structures
  const quizData = props.quiz || props;
  const title = quizData.title || quizData.quiz?.title || "Untitled Quiz";
  const questions = quizData.questions || quizData.quiz?.questions || [];
  
  console.log("QuizTaker received:", props);
  console.log("Processed quiz data:", { title, questions });
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<string[]>(
    Array(questions.length || 0).fill("")
  )
  const [showResults, setShowResults] = useState(false)
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [fullQuestions, setFullQuestions] = useState<QuestionProps[]>([])
  
  useEffect(() => {
    if (!questions.length) return;
    
    // Create placeholder questions with better defaults
    const processedQuestions = questions.map((q: any, index: number) => ({
      id: q.id || index,
      text: q.text || `Question ${index + 1}`,
      type: q.type || "short-answer",
      answers: q.answers || []
    }));
    
    setFullQuestions(processedQuestions);
  }, [questions]);

  // If there are no questions, show a message
  if (!questions.length) {
    return (
      <Card className="w-full mx-auto">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            No questions available for this quiz.
          </p>
        </CardContent>
      </Card>
    )
  }
  
  if (loadingQuestions) {
    return (
      <Card className="w-full mx-auto">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center">Loading questions...</p>
        </CardContent>
      </Card>
    )
  }

  const questionsToUse = fullQuestions.length > 0 ? fullQuestions : questions;
  const currentQuestion = questionsToUse[currentQuestionIndex] || {
    text: `Question ${currentQuestionIndex + 1}`,
    answers: []
  };

  const handleAnswer = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
  }

  const calculateScore = () => {
    let score = 0;
    questionsToUse.forEach((question: any, index: number) => {
      const userAnswer = userAnswers[index];
      
      if (question.answers?.length > 0) {
        // Multiple choice question
        const correctAnswer = question.answers.find((a: any) => a.isCorrect);
        if (correctAnswer && userAnswer === correctAnswer.text) {
          score++;
        }
      } else if (question.correctAnswer) {
        // Short answer question
        if (userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()) {
          score++;
        }
      }
    });
    
    return `${score}/${questionsToUse.length}`;
  }

  if (showResults) {
    return (
      <Card className="w-full mx-auto">
        <CardHeader>
          <CardTitle>Quiz Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-2xl font-bold">Score: {calculateScore()}</p>
            <Button
              onClick={() => {
                setShowResults(false);
                setCurrentQuestionIndex(0);
                setUserAnswers(Array(questionsToUse.length).fill(""));
              }}
            >
              Retake Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }
 
  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questionsToUse.length}
          </div>
          <h2 className="text-xl font-semibold">
            {currentQuestion?.text || `Question ${currentQuestionIndex + 1}`}
          </h2>
          
          {currentQuestion?.answers?.length > 0 ? (
            <RadioGroup 
              value={userAnswers[currentQuestionIndex]} 
              onValueChange={handleAnswer}
            >
              {currentQuestion.answers.map((answer: any, index: number) => (
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