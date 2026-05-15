"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function addQuestion(surveyId: string, data: { text: string, type: 'TEXT' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' }) {
  const count = await prisma.question.count({ where: { surveyId } });
  
  await prisma.question.create({
    data: {
      surveyId,
      text: data.text,
      type: data.type,
      order: count + 1,
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
