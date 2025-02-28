"use client";

import { useState, useEffect } from "react";

interface PretestResult {
  id: string;
  studentName: string;
  pretestName: string;
  score: number;
  date: string;
  answers?: Array<{
    question: string;
    answer: string;
    correct: boolean;
  }>;
}

export default function StudentResultsPage() {
  const [pretestResults, setPretestResults] = useState<PretestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch pretest results from localStorage
    const fetchPretestResults = () => {
      try {
        const storedResults = localStorage.getItem("pretestResults");
        const results: PretestResult[] = storedResults
          ? JSON.parse(storedResults)
          : [];
        setPretestResults(results);
      } catch (error) {
        console.error("Error fetching pretest results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPretestResults();
  }, []);

  if (loading) return <div>Loading pretest results...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Student Pretest Results</h1>

      {pretestResults.length === 0 ? (
        <p>No pretest results found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border">Student Name</th>
                <th className="py-2 px-4 border">Pretest Name</th>
                <th className="py-2 px-4 border">Score</th>
                <th className="py-2 px-4 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {pretestResults.map((result) => (
                <tr key={result.id}>
                  <td className="py-2 px-4 border">{result.studentName}</td>
                  <td className="py-2 px-4 border">{result.pretestName}</td>
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
