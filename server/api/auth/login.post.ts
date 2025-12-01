import { createError, defineEventHandler, readBody } from "h3";
import { validateUserInDB } from "../../utils/db";
import { sanitizeEmail, sanitizeString } from "../../utils/security";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string; password?: string }>(event);

  // Basic validation first
  const rawEmail = (body.email || "").trim();
  const rawPassword = (body.password || "").trim();

  if (!rawEmail || !rawPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email and password are required.",
    });
  }

  let email: string;
  let password: string;

  try {
    email = sanitizeEmail(rawEmail);
    password = rawPassword; // Don't sanitize password (needs to be compared as-is)
  } catch (err: any) {
    throw createError({
      statusCode: 400,
      statusMessage: err.message || "Invalid input data.",
    });
  }

  // Pass the event parameter here! ↓
  const user = await validateUserInDB(event, email, password);

  if (!user) {
    // Use generic error message to prevent user enumeration
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid email or password.",
    });
  }

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    isAdmin: user.isAdmin || false,
    createdAt: user.createdAt,
  };
});