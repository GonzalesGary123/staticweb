import { createError, defineEventHandler, getQuery } from "h3";
import { getListingsFromDB } from "../../utils/db";
import { sanitizeString } from "../../utils/security";

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
      statusCode: 400,
      statusMessage: "User ID is required.",
    });
  }

  try {
    // Get all listings for this user (regardless of status)
    const allListings = await getListingsFromDB(event);
    const userListings = allListings.filter(listing => listing.userId === userId);
    
    return userListings;
  } catch (err: any) {
    console.error('Failed to fetch user listings:', err);
    // Don't expose internal error details
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch user listings. Please try again.",
    });
  }
});
