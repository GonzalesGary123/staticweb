import { createError, defineEventHandler, readBody } from "h3";
import bcrypt from "bcrypt";
import { getSupabaseServer } from "../../utils/supabase";
import { sanitizeString } from "../../utils/security";

interface ProfileUpdateBody {
  userId?: number | string;
  fullName?: string;
  currentPassword?: string;
  newPassword?: string;
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ProfileUpdateBody>(event);

  let userId: string | number;
  let fullName: string = "";
  let currentPassword: string = "";
  let newPassword: string = "";

  try {
    userId = sanitizeString(String(body.userId || ""), 50);
    if (body.fullName) {
      fullName = sanitizeString(body.fullName.trim(), 100);
    }
    if (body.currentPassword) {
      currentPassword = sanitizeString(body.currentPassword.trim(), 128);
    }
    if (body.newPassword) {
      newPassword = sanitizeString(body.newPassword.trim(), 128);
    }
  } catch (err: any) {
    throw createError({
      statusCode: 400,
      statusMessage: err.message || "Invalid input data.",
    });
  }

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "User ID is required.",
    });
  }

  if (!fullName && !newPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: "Nothing to update.",
    });
  }

  const supabase = await getSupabaseServer(event);

  const { data: existing, error: fetchError } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (fetchError || !existing) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found.",
    });
  }

  const updates: Record<string, any> = {};

  if (fullName) {
    updates.full_name = fullName;
  }

  if (newPassword) {
    if (!currentPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: "Current password is required to change password.",
      });
    }

    const match = await bcrypt.compare(currentPassword, existing.password_hash);
    if (!match) {
      throw createError({
        statusCode: 401,
        statusMessage: "Current password is incorrect.",
      });
    }

    if (newPassword.length < 8) {
      throw createError({
        statusCode: 400,
        statusMessage: "New password must be at least 8 characters.",
      });
    }

    if (newPassword.length > 128) {
      throw createError({
        statusCode: 400,
        statusMessage: "Password is too long.",
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    updates.password_hash = hashedPassword;
  }

  if (Object.keys(updates).length === 0) {
    return {
      id: existing.id,
      email: existing.email,
      fullName: existing.full_name,
      isAdmin: existing.is_admin || false,
      createdAt: existing.created_at,
    };
  }

  const { data: updatedRows, error: updateError } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select("*");

  if (updateError || !updatedRows || updatedRows.length === 0) {
    console.error("Profile update error:", updateError);
    // Don't expose internal error details
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update profile. Please try again.",
    });
  }

  const updated = updatedRows[0];

  return {
    id: updated.id,
    email: updated.email,
    fullName: updated.full_name,
    isAdmin: updated.is_admin || false,
    createdAt: updated.created_at,
  };
});
