"use client";

import { useState } from "react";
import PretestList from "@/components/PretestList";
import { Button } from "@/components/ui/button";
import PretestListDisplay from "@/components/PretestListDisplay";
import type { Pretest, PretestWithRelations } from "@/lib/types";
import { useRouter } from "next/navigation";
import PretestEditor from "@/components/PretestEditor";
import PretestCreator from "@/components/PretestCreator";
import PretestDisplay from "@/app/pretest/_components/PretestDisplay";

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

export default function PretestListClient({
  initialPretests,
}: {
  initialPretests: PretestWithRelations[];
}) {
  const router = useRouter();
  const [showPretestCreator, setShowPretestCreator] = useState(false);
  const [selectedPretest, setSelectedPretest] =
    useState<PretestWithRelations | null>(null);
  const [view, setView] = useState<"list" | "edit" | "display">("list");

  const transformedPretests = initialPretests.map(transformToUIPretest);
  const [pretests] = useState(
    transformedPretests.map((pretest) => ({
      id: String(pretest.id),
      title: pretest.title,
      updatedAt: pretest.updatedAt,
      questions: pretest.questions.map((q) => ({
        id: String(q.id),
        type: q.type,
        question: q.text,
      })),
    }))
  );

  const handlePretestSelect = (pretestId: string) => {
    const originalPretest = initialPretests.find(
      (p) => p.id === Number(pretestId)
    );
    if (originalPretest) {
      setSelectedPretest(originalPretest);
    }
  };

  async function handleSavePretest(pretest: Pretest) {
    try {
      console.log("Saving pretest:", pretest);

      const isNewPretest = !pretest.id;
      const method = isNewPretest ? "POST" : "PUT";
      const endpoint = "/api/pretests";
      const url = isNewPretest ? endpoint : `${endpoint}?id=${pretest.id}`;

      console.log(`Using ${method} request to ${url}`);

      const simplifiedPretest = {
        id: pretest.id,
        title: pretest.title,
        questions: pretest.questions.map((q) => ({
          id: q.id,
          text: q.text,
          type: q.type,
          orderIndex: q.orderIndex || 1,
          answers: q.answers.map((a) => ({
            id: a.id,
            text: a.text,
            isCorrect: a.isCorrect,
          })),
        })),
      };

      // Log the simplified payload
      console.log(
        "Simplified request payload:",
        JSON.stringify(simplifiedPretest, null, 2)
      );

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(simplifiedPretest),
      });

      // Log response status and headers
      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries([...response.headers])
      );

      if (!response.ok) {
        console.error(`Server returned error status: ${response.status}`);
        const errorText = await response.text();
        console.error("Error response:", errorText.substring(0, 500)); // Limit the output
        throw new Error(`Server returned error: ${response.status}`);
      }

      // Get the response as JSON directly
      const data = await response.json();
      console.log("Saved pretest successfully:", data);

      router.refresh();
      setView("list");
      setSelectedPretest(null);
      return data;
    } catch (error) {
      console.error("Failed to save pretest:", error);
      throw error;
    }
  }

  return (
    <main className="mx-auto p-4">
      <h1>Pretest List</h1>
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
          onSave={handleSavePretest}
          onBack={() => setView("list")}
        />
      ) : selectedPretest ? (
        <PretestListDisplay
          onEditPretest={(id: string) => {
            const pretest = initialPretests.find((p) => p.id === Number(id));
            if (pretest) {
              setSelectedPretest(pretest);
              setView("edit");
            }
          }}
          pretest={transformToUIPretest(selectedPretest)}
          onBack={() => setSelectedPretest(null)}
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
