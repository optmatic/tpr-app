import { prisma } from "@/lib/prisma";
import PretestClient from "./_components/PretestClient";
import type { PretestWithRelations } from "@/lib/types";

export default async function PretestPage() {
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
  })) satisfies PretestWithRelations[];

  return <PretestClient initialPretests={pretests} />;
}
