// server/api/feedback/app.get.ts
import { createError, defineEventHandler } from "h3";
import { getAppFeedback } from "../../utils/db";

export default defineEventHandler(async (event) => {
  try {
    const feedback = await getAppFeedback(event);
    return feedback;
  } catch (err: any) {
    console.error('Error fetching app feedback:', err);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch app feedback.",
    });
  }
});
