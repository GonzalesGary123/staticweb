import { createError, defineEventHandler, getQuery } from "h3";
import { getListingsFromDB, isAdminUser } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const userId = query.userId as string;
  const status = (query.status as string) || 'pending';

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: "User ID is required.",
    });
  }

  // Check if user is admin
  const isAdmin = await isAdminUser(event, userId);
  if (!isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: "Access denied. Admin privileges required.",
    });
  }

  // Validate status
  const validStatuses = ['pending', 'approved', 'rejected', 'sold'];
  if (!validStatuses.includes(status)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
    });
  }

  try {
    // Return listings with the specified status
    return await getListingsFromDB(event, status as 'pending' | 'approved' | 'rejected' | 'sold');
  } catch (err: any) {
    console.error('Failed to fetch listings:', err);
    // Don't expose internal error details
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch listings. Please try again.",
    });
  }
});
