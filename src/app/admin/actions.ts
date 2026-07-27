"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"

export async function getSurveys() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await prisma.survey.findMany({
    where: {
      authorId: session.user.id
    },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { responses: true, questions: true }
      }
    }
  })
}

export async function createSurvey(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string || "";
  const image = (formData.get("image") as string) || null;
  const organization = (formData.get("organization") as string) || null;
  const department = (formData.get("department") as string) || null;
  const subdepartment = (formData.get("subdepartment") as string) || null;
  const type = formData.get("type") as "CUSTOM" | "FIXED_SCALE" || "CUSTOM";
  const includeLikertTable = type === "FIXED_SCALE" && formData.get("includeLikertTable") === "on";
  const isMandatory = formData.get("isMandatory") !== "false";
  const globalOptionsRaw = formData.get("globalOptions") as string;
  const requireDemographics = formData.get("requireDemographics") === "on";

  if (!title) return;

  const survey = await prisma.survey.create({
    data: {
      title,
      description,
      image,
      organization,
      department,
      subdepartment,
      includeLikertTable,
      isMandatory,
      type,
      requireDemographics,
      authorId: session.user.id,
      ...(type === 'FIXED_SCALE' && globalOptionsRaw ? {
        options: {
          create: JSON.parse(globalOptionsRaw).map((item: { text: string; value?: number } | string, idx: number) => 
            typeof item === 'string'
              ? { text: item, value: idx + 1 }
              : { text: item.text, value: typeof item.value === 'number' ? item.value : idx + 1 }
          )
        }
      } : {})
    }
  });

  revalidatePath("/admin");
  redirect(`/admin/surveys/${survey.id}/edit`);
}

export async function getGlobalAudience() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await prisma.response.findMany({
    where: {
      survey: {
        authorId: session.user.id
      }
    },
    include: {
      survey: {
        select: { title: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function deleteSurvey(surveyId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  // Verificar que la encuesta pertenece al usuario
  const survey = await prisma.survey.findUnique({
    where: { id: surveyId }
  });

  if (!survey || survey.authorId !== session.user.id) {
    throw new Error("No autorizado");
  }

  await prisma.survey.delete({
    where: { id: surveyId }
  });

  revalidatePath("/admin");
}

export async function updateUserProfile(data: { name: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: data.name }
  });

  revalidatePath("/admin/settings");
}
