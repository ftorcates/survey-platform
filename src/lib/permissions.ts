import prisma from "@/lib/prisma"

export type SurveyUserRole = 'OWNER' | 'EDIT' | 'READ' | null;

/**
 * Returns the permission role of a user for a given survey.
 * - 'OWNER': The user is the author of the survey.
 * - 'EDIT': The survey is shared with the user with edit permissions.
 * - 'READ': The survey is shared with the user with read-only permissions.
 * - null: The user has no access to this survey.
 */
export async function getSurveyUserRole(
  surveyId: string,
  userId?: string | null
): Promise<SurveyUserRole> {
  if (!userId || !surveyId) return null;

  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    select: {
      authorId: true,
      shares: {
        where: { userId },
        select: { role: true }
      }
    }
  });

  if (!survey) return null;

  if (survey.authorId === userId) {
    return 'OWNER';
  }

  if (survey.shares && survey.shares.length > 0) {
    return survey.shares[0].role; // 'READ' or 'EDIT'
  }

  return null;
}

/**
 * Checks if the user has at least the required role for a survey.
 * 'OWNER' satisfies all roles.
 * 'EDIT' satisfies 'EDIT' and 'READ'.
 * 'READ' satisfies 'READ'.
 */
export function hasRequiredRole(
  userRole: SurveyUserRole,
  requiredRole: 'OWNER' | 'EDIT' | 'READ'
): boolean {
  if (!userRole) return false;
  if (userRole === 'OWNER') return true;
  if (requiredRole === 'READ') return userRole === 'EDIT' || userRole === 'READ';
  if (requiredRole === 'EDIT') return userRole === 'EDIT';
  return false;
}
