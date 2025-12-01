// server/api/admin/middlemen.post.ts
import { createError, defineEventHandler, readBody } from "h3";
import { addMiddlemanToDB, isAdminUser } from "../../utils/db";
import { sanitizeString, sanitizeEmail, sanitizeUrl } from "../../utils/security";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{
      userId?: string;
      name?: string;
      email?: string;
      link?: string;
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
        statusMessage: "Only admins can add middlemen.",
      });
    }

    // Validate and sanitize inputs
    const name = sanitizeString((body.name || "").trim(), 100);
    const email = sanitizeEmail((body.email || "").trim());
    const link = body.link ? sanitizeUrl((body.link || "").trim()) || undefined : undefined;

    if (!name || !email) {
      throw createError({
        statusCode: 400,
        statusMessage: "Name and email are required.",
      });
    }

    const middleman = await addMiddlemanToDB(event, { name, email, link });

    return {
      success: true,
      middleman,
    };
  } catch (err: any) {
    console.error('Error adding middleman:', err);
    if (err.statusCode) {
      throw err;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to add middleman.",
    });
  }
});
