"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Quiz } from "@/lib/types";

export default function PretestArchivePage() {
  const [archivedQuizzes, setArchivedQuizzes] = useState<Quiz[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchArchivedQuizzes();
  }, []);

  const fetchArchivedQuizzes = async () => {
    try {
      const response = await fetch("/api/quizzes/archived");
      const data = await response.json();
      setArchivedQuizzes(data);
    } catch (error) {
      console.error("Error fetching archived quizzes:", error);
    }
  };

  const handleRestore = async (quizId: string) => {
    try {
      await fetch(`/api/quizzes/${quizId}/archive`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ archived: false }),
      });
      fetchArchivedQuizzes();
    } catch (error) {
      console.error("Error restoring quiz:", error);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex-col items-center">
        <h1 className="text-2xl ml-4">Archived Quizzes</h1>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Questions</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {archivedQuizzes.map((quiz) => (
            <TableRow key={quiz.id}>
              <TableCell>{quiz.title}</TableCell>
              <TableCell>{quiz.questions.length}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  onClick={() => handleRestore(quiz.id.toString())}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Restore
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
