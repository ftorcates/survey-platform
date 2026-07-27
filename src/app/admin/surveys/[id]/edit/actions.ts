"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function addQuestion(surveyId: string, data: { text: string, type: 'TEXT' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE', blockId?: string }) {
  const count = await prisma.question.count({ where: { surveyId } });
  
  await prisma.question.create({
    data: {
      surveyId,
      text: data.text,
      type: data.type,
      order: count + 1,
      blockId: data.blockId || null,
    }
  });

  revalidatePath(`/admin/surveys/${surveyId}/edit`);
}

export async function addOption(questionId: string, surveyId: string, text: string) {
  await prisma.option.create({
    data: {
      questionId,
      text
    }
  });
  revalidatePath(`/admin/surveys/${surveyId}/edit`);
}

export async function updateBranching(optionId: string, nextQuestionId: string | null, surveyId: string) {
  await prisma.option.update({
    where: { id: optionId },
    data: { nextQuestionId }
  });
  revalidatePath(`/admin/surveys/${surveyId}/edit`);
}

export async function updateQuestionBranching(questionId: string, nextQuestionId: string | null, surveyId: string) {
  await prisma.question.update({
    where: { id: questionId },
    data: { nextQuestionId }
  });
  revalidatePath(`/admin/surveys/${surveyId}/edit`);
}

export async function updateSurveyHeader(surveyId: string, data: { title: string, description: string | null }) {
  await prisma.survey.update({
    where: { id: surveyId },
    data: {
      title: data.title,
      description: data.description
    }
  });
  revalidatePath(`/admin/surveys/${surveyId}/edit`);
}

export async function updateQuestion(questionId: string, surveyId: string, data: { text: string, type: 'TEXT' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' }) {
  await prisma.question.update({
    where: { id: questionId },
    data: {
      text: data.text,
      type: data.type
    }
  });
  revalidatePath(`/admin/surveys/${surveyId}/edit`);
}

export async function deleteQuestion(questionId: string, surveyId: string) {
  await prisma.question.delete({
    where: { id: questionId }
  });
  revalidatePath(`/admin/surveys/${surveyId}/edit`);
}

export async function deleteOption(optionId: string, surveyId: string) {
  await prisma.option.delete({
    where: { id: optionId }
  });
  revalidatePath(`/admin/surveys/${surveyId}/edit`);
}

export async function addBlock(surveyId: string, data: { title: string, description?: string }) {
  const count = await prisma.questionBlock.count({ where: { surveyId } });
  await prisma.questionBlock.create({
    data: {
      surveyId,
      title: data.title || `Bloque ${count + 1}`,
      description: data.description || null,
      order: count + 1,
    }
  });
  revalidatePath(`/admin/surveys/${surveyId}/edit`);
}

export async function updateBlock(blockId: string, surveyId: string, data: { title: string, description?: string }) {
  await prisma.questionBlock.update({
    where: { id: blockId },
    data: {
      title: data.title,
      description: data.description || null,
    }
  });
  revalidatePath(`/admin/surveys/${surveyId}/edit`);
}

export async function deleteBlock(blockId: string, surveyId: string) {
  await prisma.questionBlock.delete({
    where: { id: blockId }
  });
  revalidatePath(`/admin/surveys/${surveyId}/edit`);
}

export async function moveQuestionToBlock(questionId: string, blockId: string | null, surveyId: string) {
  await prisma.question.update({
    where: { id: questionId },
    data: { blockId }
  });
  revalidatePath(`/admin/surveys/${surveyId}/edit`);
}

export async function updateScaleOptions(
  surveyId: string,
  options: { id?: string; text: string; value: number }[],
  deletedIds: string[] = []
) {
  for (const delId of deletedIds) {
    await prisma.option.delete({ where: { id: delId } }).catch(() => {});
  }
  for (const opt of options) {
    if (opt.id && !opt.id.startsWith("new_")) {
      await prisma.option.update({
        where: { id: opt.id },
        data: { text: opt.text, value: opt.value }
      });
    } else {
      await prisma.option.create({
        data: {
          surveyId,
          text: opt.text,
          value: opt.value
        }
      });
    }
  }
  revalidatePath(`/admin/surveys/${surveyId}/edit`);
}
