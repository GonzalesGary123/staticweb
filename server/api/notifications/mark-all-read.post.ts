import { createError, defineEventHandler, readBody } from "h3";
import { markAllNotificationsAsRead } from "../../utils/db";
import { sanitizeString } from "../../utils/security";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ 
    userId?: string;
  }>(event);

  let userId: string;

  try {
    userId = sanitizeString(String(body.userId || ""), 50);
  } catch (err: any) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid user ID.",
    });
  }

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "User ID is required.",
    });
  }

  try {
    await markAllNotificationsAsRead(event, userId);
    return {
      success: true,
    };
  } catch (err: any) {
    console.error('Failed to mark all notifications as read:', err);
    // Don't expose internal error details
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to mark all notifications as read. Please try again.",
    });
  }
});
