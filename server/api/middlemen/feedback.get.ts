// server/api/middlemen/feedback.get.ts
import { createError, defineEventHandler, getQuery } from "h3";
import { getFeedbackForMiddleman } from "../../utils/db";
import { sanitizeString } from "../../utils/security";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  try {
    const middlemanId = sanitizeString(String(query.middlemanId || ""), 50);
    if (!middlemanId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Middleman ID is required.",
      });
    }

    const feedback = await getFeedbackForMiddleman(event, middlemanId);
    return feedback;
  } catch (err: any) {
    console.error('Error fetching middleman feedback:', err);
    if (err.statusCode) {
      throw err;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch middleman feedback.",
    });
  }
});
