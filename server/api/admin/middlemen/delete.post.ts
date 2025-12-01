// server/api/admin/middlemen/delete.post.ts
import { createError, defineEventHandler, readBody } from "h3";
import { deleteMiddlemanFromDB, isAdminUser } from "../../../utils/db";
import { sanitizeString } from "../../../utils/security";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{
      userId?: string;
      middlemanId?: string;
    }>(event);

    // Validate admin
    const userId = sanitizeString((body.userId || "").trim(), 50);
    if (!userId) {
      throw createError({
        statusCode: 401,
        statusMessage: "User ID is required.",
      });
    }

    const isAdmin = await isAdminUser(event, userId);
    if (!isAdmin) {
      throw createError({
        statusCode: 403,
        statusMessage: "Only admins can delete middlemen.",
      });
    }

    const middlemanId = sanitizeString((body.middlemanId || "").trim(), 50);
    if (!middlemanId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Middleman ID is required.",
      });
    }

    await deleteMiddlemanFromDB(event, middlemanId);

    return {
      success: true,
    };
  } catch (err: any) {
    console.error('Error deleting middleman:', err);
    if (err.statusCode) {
      throw err;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete middleman.",
    });
  }
});
