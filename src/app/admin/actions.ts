"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { getSurveyUserRole } from "@/lib/permissions"

export async function getSurveys() {
  const session = await auth();
  if (!session?.user?.id) return [];
  const userId = session.user.id;

  const surveys = await prisma.survey.findMany({
    where: {
      OR: [
        { authorId: userId },
        { shares: { some: { userId } } }
      ]
    },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { responses: true, questions: true }
      },
      shares: {
        where: { userId },
        select: { role: true }
      },
      author: {
        select: { name: true, email: true }
      }
    }
  });

  return surveys.map(s => {
    const isOwner = s.authorId === userId;
    const shareRole = s.shares?.[0]?.role;
    const userRole: 'OWNER' | 'EDIT' | 'READ' = isOwner ? 'OWNER' : (shareRole || 'READ');
    return {
      ...s,
      userRole
    };
  });
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
        OR: [
          { authorId: session.user.id },
          { shares: { some: { userId: session.user.id } } }
        ]
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

  // Solo el propietario (autor) puede eliminar la encuesta
  const survey = await prisma.survey.findUnique({
    where: { id: surveyId }
  });

  if (!survey || survey.authorId !== session.user.id) {
    throw new Error("Solo el creador de la encuesta puede eliminarla.");
  }

  await prisma.survey.delete({
    where: { id: surveyId }
  });

  revalidatePath("/admin");
}

export async function getSurveyShares(surveyId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    select: { authorId: true }
  });

  if (!survey || survey.authorId !== session.user.id) {
    throw new Error("Solo el creador puede ver las configuraciones de compartición.");
  }

  return await prisma.surveyShare.findMany({
    where: { surveyId },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true }
      }
    },
    orderBy: { createdAt: 'asc' }
  });
}

export async function shareSurvey(surveyId: string, email: string, role: 'READ' | 'EDIT') {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" };

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return { error: "Por favor ingresa un correo electrónico válido." };

  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    select: { authorId: true }
  });

  if (!survey || survey.authorId !== session.user.id) {
    return { error: "Solo el creador de la encuesta puede compartirla." };
  }

  const targetUser = await prisma.user.findUnique({
    where: { email: cleanEmail }
  });

  if (!targetUser) {
    return { error: `No encontramos un usuario registrado con el correo: ${cleanEmail}. Pídele que inicie sesión en la plataforma primero.` };
  }

  if (targetUser.id === session.user.id) {
    return { error: "No puedes compartir la encuesta contigo mismo (ya eres el propietario)." };
  }

  await prisma.surveyShare.upsert({
    where: {
      surveyId_userId: {
        surveyId,
        userId: targetUser.id
      }
    },
    create: {
      surveyId,
      userId: targetUser.id,
      role
    },
    update: {
      role
    }
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/surveys/${surveyId}/edit`);
  return { success: true };
}

export async function updateSurveyShareRole(shareId: string, role: 'READ' | 'EDIT') {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" };

  const share = await prisma.surveyShare.findUnique({
    where: { id: shareId },
    include: { survey: { select: { authorId: true, id: true } } }
  });

  if (!share || share.survey.authorId !== session.user.id) {
    return { error: "Solo el creador de la encuesta puede modificar los permisos." };
  }

  await prisma.surveyShare.update({
    where: { id: shareId },
    data: { role }
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/surveys/${share.survey.id}/edit`);
  return { success: true };
}

export async function removeSurveyShare(shareId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" };

  const share = await prisma.surveyShare.findUnique({
    where: { id: shareId },
    include: { survey: { select: { authorId: true, id: true } } }
  });

  if (!share || share.survey.authorId !== session.user.id) {
    return { error: "Solo el creador de la encuesta puede revocar el acceso." };
  }

  await prisma.surveyShare.delete({
    where: { id: shareId }
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/surveys/${share.survey.id}/edit`);
  return { success: true };
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

export async function getSurveyPublicMetricsStatus(surveyId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  const role = await getSurveyUserRole(surveyId, session.user.id);
  if (!role) throw new Error("No autorizado");

  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    select: { isMetricsPublic: true, title: true }
  });

  return { 
    isMetricsPublic: survey?.isMetricsPublic ?? false,
    title: survey?.title ?? ""
  };
}

export async function togglePublicMetrics(surveyId: string, enabled: boolean) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" };

  const role = await getSurveyUserRole(surveyId, session.user.id);
  if (role !== 'OWNER' && role !== 'EDIT') {
    return { error: "Solo el creador o editores autorizados pueden modificar la visibilidad pública de las métricas." };
  }

  await prisma.survey.update({
    where: { id: surveyId },
    data: { isMetricsPublic: enabled }
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/surveys/${surveyId}/metrics`);
  revalidatePath(`/metrics/${surveyId}`);
  return { success: true, isMetricsPublic: enabled };
}

