// server/api/middlemen.get.ts
import { defineEventHandler } from "h3";
import { getMiddlemenFromDB } from "../utils/db";

export default defineEventHandler(async (event) => {
  try {
    const middlemen = await getMiddlemenFromDB(event);
    return middlemen;
  } catch (err: any) {
    console.error('Error fetching middlemen:', err);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch middlemen.",
    });
  }
});
