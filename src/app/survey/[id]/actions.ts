"use server"

import prisma from "@/lib/prisma"

export async function startSurveyResponse(surveyId: string, demographics: { ageGroup?: string, sex?: string, location?: string }) {
  const response = await prisma.response.create({
    data: {
      surveyId,
      ...demographics
    }
  });
  return response.id;
}

export async function saveAnswer(responseId: string, questionId: string, textValue?: string, optionId?: string) {
  await prisma.answer.create({
    data: {
      responseId,
      questionId,
      textValue,
      optionId
    }
  });
}
