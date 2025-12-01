// server/api/listings/mark-sold.post.ts
// Allows a seller to mark their own listing as sold
import { createError, defineEventHandler, readBody } from "h3";
import { getListingsFromDB } from "../../utils/db";
import { sanitizeString } from "../../utils/security";
import { updateListingStatus } from "../../utils/db";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ userId?: string; listingId?: string }>(event);

    const userId = sanitizeString((body.userId || "").trim(), 50);
    const listingId = sanitizeString((body.listingId || "").trim(), 50);

    if (!userId || !listingId) {
      throw createError({
        statusCode: 400,
        statusMessage: "User ID and listing ID are required.",
      });
    }

    // Fetch listing to verify ownership
    const listings = await getListingsFromDB(event);
    const listing = listings.find((l) => String(l.id) === listingId);

    if (!listing) {
      throw createError({
        statusCode: 404,
        statusMessage: "Listing not found.",
      });
    }

    if (listing.userId !== userId) {
      throw createError({
        statusCode: 403,
        statusMessage: "You can only mark your own listings as sold.",
      });
    }

    if (listing.status === 'sold') {
      throw createError({
        statusCode: 400,
        statusMessage: "Listing is already marked as sold.",
      });
    }

    const updated = await updateListingStatus(event, listingId, 'sold', userId);

    return { success: true, listing: updated };
  } catch (err: any) {
    console.error('Error marking listing as sold by owner:', err);
    if (err.statusCode) {
      throw err;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to mark listing as sold.",
    });
  }
});
