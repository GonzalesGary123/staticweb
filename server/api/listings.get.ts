import { createError, defineEventHandler } from "h3";
import { getListingsFromDB } from "../utils/db";

export default defineEventHandler(async (event) => {
  try {
    // Return approved and sold listings for public marketplace
    const approved = await getListingsFromDB(event, 'approved');
    const sold = await getListingsFromDB(event, 'sold');
    return [...approved, ...sold];
  } catch (err: any) {
    console.error('Failed to fetch listings:', err);
    // Don't expose internal error details
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch listings. Please try again.",
    });
  }
});