export const dynamic = 'force-dynamic';

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const trailId = req.nextUrl.searchParams.get("trailId");
    const sectionId = req.nextUrl.searchParams.get("sectionId");
    const uid = req.nextUrl.searchParams.get("uid");

    if (!trailId || !sectionId || !uid) {
      return new NextResponse(
        "Parâmetros trailId, sectionId e uid são obrigatórios",
        {
          status: 400,
        }
      );
    }

    const contentRef = doc(db, `trails/${trailId}/contents/${sectionId}`);
    const contentSnapshot = await getDoc(contentRef);

    if (!contentSnapshot.exists()) {
      return new NextResponse("Conteúdo não encontrado", { status: 404 });
    }

    const content = {
      id: contentSnapshot.id,
      done: false,
      isLast: false,
      ...contentSnapshot.data(),
    };

    const userDocRef = doc(db, "users", uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();

      const trail = userData?.trails?.find(
        (trail: any) => trail.trailId === trailId
      );
      const isDone = trail?.doneSections?.includes(sectionId);

      if (isDone) {
        content.done = true;
      }
    }

    return new NextResponse(JSON.stringify(content), {
      status: 200,
    });
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    return new NextResponse("Erro ao buscar dados", { status: 500 });
  }
};
