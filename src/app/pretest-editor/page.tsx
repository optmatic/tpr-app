import { prisma } from "@/lib/prisma";
import PretestClient from "@/components/PretestClient";
import type { PretestWithRelations } from "@/lib/types";

export default async function PretestEditorPage() {
  const pretests = await prisma.pretest.findMany({
    include: {
      author: true,
      questions: {
        include: {
          answers: true,
        },
        orderBy: {
          orderIndex: "asc",
        },
      },
    },
  });

  return <PretestClient initialPretests={pretests} />;
}
