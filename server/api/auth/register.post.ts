// server/api/auth/register.post.ts
import { createError, defineEventHandler, readBody } from "h3";
import { createUserInDB } from "../../utils/db";
import { sanitizeEmail, sanitizeString } from "../../utils/security";

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    email?: string;
    password?: string;
    fullName?: string;
  }>(event);

  let email: string;
  let password: string;
  let fullName: string;

  // Basic validation first
  const rawEmail = (body.email || "").trim();
  const rawPassword = (body.password || "").trim();
  const rawFullName = (body.fullName || "").trim();

  if (!rawEmail || !rawPassword || !rawFullName) {
    throw createError({
      statusCode: 400,
      statusMessage: "Full name, email and password are required.",
    });
  }

  try {
    // Sanitize and validate inputs
    email = sanitizeEmail(rawEmail);
    password = rawPassword; // Don't sanitize password (needs to be hashed as-is)
    fullName = sanitizeString(rawFullName, 100);
  } catch (err: any) {
    throw createError({
      statusCode: 400,
      statusMessage: err.message || "Invalid input data.",
    });
  }

  if (password.length < 8) {
    throw createError({
      statusCode: 400,
      statusMessage: "Password must be at least 8 characters.",
    });
  }

  if (password.length > 128) {
    throw createError({
      statusCode: 400,
      statusMessage: "Password is too long.",
    });
  }

  // Check for common weak passwords
  const weakPasswords = ['password', '12345678', 'qwerty', 'abc123'];
  if (weakPasswords.includes(password.toLowerCase())) {
    throw createError({
      statusCode: 400,
      statusMessage: "Password is too weak. Please choose a stronger password.",
    });
  }

  try {
    const user = await createUserInDB(event, email, password, fullName);
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        isAdmin: user.isAdmin || false,
        createdAt: user.createdAt,
      }
    };
  } catch (err: any) {
    console.error('Registration error:', err);
    
    // Don't expose internal error details
    if (err.message === "Email is already registered.") {
      throw createError({
        statusCode: 400,
        statusMessage: "Email is already registered.",
      });
    }
    
    // Generic error message to prevent information leakage
    throw createError({
      statusCode: 500,
      statusMessage: "Registration failed. Please try again.",
    });
  }
});