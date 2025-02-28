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
import type { Pretest } from "@/lib/types";

export default function PretestArchivePage() {
  const [archivedPretests, setArchivedPretests] = useState<Pretest[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchArchivedPretests();
  }, []);

  const fetchArchivedPretests = async () => {
    try {
      const response = await fetch("/api/pretests/archived");
      const data = await response.json();
      setArchivedPretests(data);
    } catch (error) {
      console.error("Error fetching archived pretests:", error);
    }
  };

  const handleRestore = async (pretestId: string) => {
    try {
      await fetch(`/api/pretests/${pretestId}/archive`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ archived: false }),
      });
      fetchArchivedPretests();
    } catch (error) {
      console.error("Error restoring pretest:", error);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex-col items-center">
        <h1 className="text-2xl ml-4">Archived Pretests</h1>
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
          {archivedPretests.map((pretest) => (
            <TableRow key={pretest.id}>
              <TableCell>{pretest.title}</TableCell>
              <TableCell>{pretest.questions.length}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  onClick={() => handleRestore(pretest.id.toString())}
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
