"use client";

import { useState, useEffect } from "react";

interface QuizResult {
  id: string;
  studentName: string;
  quizName: string;
  score: number;
  date: string;
  answers?: Array<{
    question: string;
    answer: string;
    correct: boolean;
  }>;
}

export default function StudentResultsPage() {
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch quiz results from localStorage
    const fetchQuizResults = () => {
      try {
        const storedResults = localStorage.getItem("quizResults");
        const results: QuizResult[] = storedResults
          ? JSON.parse(storedResults)
          : [];
        setQuizResults(results);
      } catch (error) {
        console.error("Error fetching quiz results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizResults();
  }, []);

  if (loading) return <div>Loading quiz results...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Student Quiz Results</h1>

      {quizResults.length === 0 ? (
        <p>No quiz results found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border">Student Name</th>
                <th className="py-2 px-4 border">Quiz Name</th>
                <th className="py-2 px-4 border">Score</th>
                <th className="py-2 px-4 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {quizResults.map((result) => (
                <tr key={result.id}>
                  <td className="py-2 px-4 border">{result.studentName}</td>
                  <td className="py-2 px-4 border">{result.quizName}</td>
                  <td className="py-2 px-4 border">{result.score}</td>
                  <td className="py-2 px-4 border">{result.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
