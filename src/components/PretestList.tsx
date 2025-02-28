"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Search } from "lucide-react";
import { PretestListProps } from "@/lib/types";

export default function PretestList({
  pretests,
  onPretestSelect,
  isLoading,
  onArchivePretest,
  onEditPretest,
}: PretestListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPretests = pretests
    .filter((pretest) =>
      pretest.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  const handleDelete = async (id: string) => {
    try {
      await onArchivePretest(id);
    } catch (error) {
      console.error("Failed to archive pretest:", error);
      // You might want to add toast notification here
    }
  };

  const handleEdit = (id: string) => {
    onEditPretest(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-gray-500" />
        <Input
          placeholder="Search pretests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <div>Loading pretests...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Questions</TableHead>
              {/* <TableHead>Actions</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPretests.map((pretest) => (
              <TableRow key={pretest.id} className="hover:bg-transparent">
                <TableCell className="font-medium">
                  <a
                    onClick={() => onPretestSelect(pretest.id)}
                    className="hover:text-tutorpro-darkPurple hover:cursor-pointer"
                  >
                    {pretest.title}
                  </a>
                </TableCell>
                <TableCell>{pretest.questions.length}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
