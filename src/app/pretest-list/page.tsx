import { prisma } from "@/lib/prisma";
import PretestClient from "@/components/PretestClient";
import type { PretestWithRelations } from "@/lib/types";

// Remove the use import since we don't need it
// import { use } from "react";

// Add searchParams and params as props even if you're not using them directly
export default async function PretestListPage({
  searchParams,
  params,
}: {
  searchParams?: Record<string, string | string[]>;
  params?: Record<string, string>;
}) {
  // Remove the use() calls - they're not needed and causing TypeScript errors
  // if (searchParams) use(searchParams);
  // if (params) use(params);

  // Log the pretests before fetching to track execution
  console.log("Fetching pretests...");

  // Remove the where clause with archived field since it's causing errors
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
