import { createError, defineEventHandler, getQuery } from "h3";
import { getNotificationsForUser } from "../utils/db";
import { sanitizeString } from "../utils/security";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  let userId: string;

  try {
    userId = sanitizeString(String(query.userId || ""), 50);
  } catch (err: any) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid user ID.",
    });
  }

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: "User ID is required.",
    });
  }

  try {
    return await getNotificationsForUser(event, userId);
  } catch (err: any) {
    console.error('Failed to fetch notifications:', err);
    // Don't expose internal error details
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch notifications. Please try again.",
    });
  }
});
