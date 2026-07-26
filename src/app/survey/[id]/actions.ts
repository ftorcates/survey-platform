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

export async function submitCompletedSurvey(
  surveyId: string,
  demographics: { ageGroup?: string; sex?: string; location?: string },
  answers: Array<{ questionId: string; textValue?: string; optionId?: string }>
) {
  const response = await prisma.response.create({
    data: {
      surveyId,
      ageGroup: demographics.ageGroup || null,
      sex: demographics.sex || null,
      location: demographics.location || null,
      answers: {
        create: answers.map(a => ({
          questionId: a.questionId,
          textValue: a.textValue || null,
          optionId: a.optionId || null
        }))
      }
    }
  });
  return response.id;
}
