import { prisma } from "@/lib/prisma";
import PretestClient from "@/components/PretestClient";
import type { PretestWithRelations } from "@/lib/types";

export default async function PretestListPage() {
  // Log the pretests before fetching to track execution
  console.log("Fetching pretests...");

  const pretests = (await prisma.pretest.findMany({
    include: {
      author: true,
      questions: {
        select: {
          id: true,
          text: true,
          pretestId: true,
          orderIndex: true,
          answers: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc", // Optional: show newest pretests first
    },
  })) satisfies PretestWithRelations[];

  console.log("Pretests fetched successfully:", pretests.length);

  return <PretestClient initialPretests={pretests} />;
}
