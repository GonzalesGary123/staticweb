// server/api/feedback.post.ts
import { createError, defineEventHandler, readBody } from "h3";
import { addFeedbackToDB } from "../utils/db";
import { sanitizeString } from "../utils/security";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{
      userId?: string;
      type?: 'middleman' | 'app';
      middlemanId?: string;
      rating?: number;
      comment?: string;
    }>(event);

    const userId = sanitizeString((body.userId || "").trim(), 50);
    const type = (body.type || 'app') as 'middleman' | 'app';
    const comment = sanitizeString((body.comment || "").trim(), 1000);
    const middlemanId = body.middlemanId ? sanitizeString(body.middlemanId, 50) : undefined;
    const rating = typeof body.rating === 'number' ? body.rating : undefined;

    if (!userId) {
      throw createError({
        statusCode: 401,
        statusMessage: "User ID is required.",
      });
    }

    if (!comment) {
      throw createError({
        statusCode: 400,
        statusMessage: "Comment is required.",
      });
    }

    if (type === 'middleman') {
      if (!middlemanId) {
        throw createError({
          statusCode: 400,
          statusMessage: "Middleman ID is required for middleman feedback.",
        });
      }
      if (rating === undefined || rating < 1 || rating > 5) {
        throw createError({
          statusCode: 400,
          statusMessage: "Rating between 1 and 5 is required for middleman feedback.",
        });
      }
    }

    const feedback = await addFeedbackToDB(event, {
      userId,
      type,
      middlemanId,
      rating,
      comment,
    });

    return { success: true, feedback };
  } catch (err: any) {
    console.error('Error adding feedback:', err);
    if (err.statusCode) {
      throw err;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to submit feedback.",
    });
  }
});
