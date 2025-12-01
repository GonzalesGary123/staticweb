import { createError, defineEventHandler, readBody } from "h3";
import { markNotificationAsRead } from "../../utils/db";
import { sanitizeString } from "../../utils/security";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ 
    notificationId?: string;
  }>(event);

  let notificationId: string;

  try {
    notificationId = sanitizeString(String(body.notificationId || ""), 50);
  } catch (err: any) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid notification ID.",
    });
  }

  if (!notificationId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Notification ID is required.",
    });
  }

  try {
    const notification = await markNotificationAsRead(event, notificationId);
    return {
      success: true,
      notification,
    };
  } catch (err: any) {
    console.error('Failed to mark notification as read:', err);
    // Don't expose internal error details
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to mark notification as read. Please try again.",
    });
  }
});
