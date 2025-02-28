"use client";

import { useState } from "react";
import PretestCreator from "@/components/PretestCreator";
import PretestList from "@/components/PretestList";
import { Button } from "@/components/ui/button";
import PretestDisplay from "./PretestDisplay";
import PretestTaker from "./PretestTaker";
import type { Pretest, PretestWithRelations } from "@/lib/types";
import { useRouter } from "next/navigation";
import PretestEditor from "@/components/PretestEditor";
import { Toaster } from "@/components/ui/sonner";

// Updated transform function to match types
function transformToUIPretest(pretest: PretestWithRelations): Pretest {
  return {
    id: pretest.id,
    title: pretest.title,
    questions: pretest.questions.map((q) => ({
      id: q.id,
      text: q.text,
      type: "multiple-choice",
      orderIndex: q.orderIndex,
      pretestId: q.pretestId,
      updatedAt: pretest.updatedAt,
      correctAnswer: q.answers.find((a) => a.isCorrect)?.text || "",
      answers: q.answers.map((a) => ({
        id: a.id,
        text: a.text,
        isCorrect: a.isCorrect,
        questionId: a.questionId,
      })),
    })),
    author: pretest.author,
    updatedAt: pretest.updatedAt,
  };
}

export default function PretestClient({
  initialPretests,
}: {
  initialPretests: PretestWithRelations[];
}) {
  const router = useRouter();
  const [showPretestCreator, setShowPretestCreator] = useState(false);
  const [selectedPretest, setSelectedPretest] =
    useState<PretestWithRelations | null>(null);
  const [view, setView] = useState<"list" | "edit" | "display" | "take">(
    "list"
  );
  const [pretestResults, setPretestResults] = useState<{
    total: number;
    correct: number;
    percentage: number;
  } | null>(null);

  // Memoize the transformed pretests
  const pretests = initialPretests.map((pretest) => ({
    id: String(pretest.id),
    title: pretest.title,
    updatedAt: pretest.updatedAt,
    questions: pretest.questions.map((q) => ({
      id: String(q.id),
      type: "multiple-choice" as const, // Use const assertion to fix the type
      question: q.text,
    })),
  }));

  const handlePretestSelect = (pretestId: string) => {
    const originalPretest = initialPretests.find(
      (p) => p.id === Number(pretestId)
    );
    if (originalPretest) {
      setSelectedPretest(originalPretest);
      setView("display");
    }
  };

  const handleSavePretest = async (updatedPretest: Pretest) => {
    try {
      const requestBody = {
        title: updatedPretest.title,
        questions: {
          deleteMany: { pretestId: updatedPretest.id },
          create: Array.isArray(updatedPretest.questions)
            ? updatedPretest.questions.map((q) => ({
                text: q.text,
                orderIndex: q.orderIndex,
                type: q.type,
                answers: {
                  create: q.answers.map((a) => ({
                    text: a.text,
                    isCorrect: a.isCorrect,
                  })),
                },
              }))
            : [],
        },
      };

      const response = await fetch(`/api/pretests/${updatedPretest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok)
        throw new Error(await response.json().then((data) => data.message));

      router.refresh();
      setView("list");
      setSelectedPretest(null);
    } catch (error) {
      console.error("Failed to save pretest:", error);
      throw error;
    }
  };

  const handleTakePretest = () => {
    setView("take");
    setPretestResults(null);
  };

  const handlePretestComplete = (results: {
    total: number;
    correct: number;
    percentage: number;
  }) => {
    setPretestResults(results);
    // After completing the pretest, go back to the list view
    setView("list");
    setSelectedPretest(null);
  };

  return (
    <main className="mx-auto p-4">
      <Toaster position="top-center" richColors closeButton />
      <h1>Pretest list</h1>
      {showPretestCreator ? (
        <>
          <Button onClick={() => setShowPretestCreator(false)} className="mb-4">
            Back to Pretest List
          </Button>
          <PretestCreator />
        </>
      ) : view === "edit" && selectedPretest ? (
        <PretestEditor
          pretest={transformToUIPretest(selectedPretest)}
          onSave={(updatedPretest) => {
            handleSavePretest(updatedPretest);
          }}
          onBack={() => setView("list")}
        />
      ) : view === "take" && selectedPretest ? (
        <PretestTaker
          pretest={transformToUIPretest(selectedPretest)}
          onComplete={handlePretestComplete}
          onBack={() => setView("display")}
        />
      ) : view === "display" && selectedPretest ? (
        <PretestDisplay
          onEditPretest={(id: string) => {
            const pretest = initialPretests.find((p) => p.id === Number(id));
            if (pretest) {
              setSelectedPretest(pretest);
              setView("edit");
            }
          }}
          pretest={transformToUIPretest(selectedPretest)}
          onBack={() => {
            setSelectedPretest(null);
            setView("list");
          }}
          onTakePretest={handleTakePretest}
        />
      ) : (
        <PretestList
          pretests={pretests}
          onPretestSelect={handlePretestSelect}
          isLoading={false}
          onArchivePretest={() => Promise.resolve()}
          onEditPretest={(id: string) => {
            const pretest = initialPretests.find((p) => p.id === Number(id));
            if (pretest) {
              setSelectedPretest(pretest);
              setView("edit");
            }
          }}
        />
      )}
    </main>
  );
}
