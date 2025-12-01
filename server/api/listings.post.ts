import { createError, defineEventHandler, readMultipartFormData } from "h3";
import { addListingToDB, createNotification } from "../utils/db";
import { 
  sanitizeString, 
  sanitizePhone, 
  sanitizeUrl, 
  sanitizePrice,
  validateImageData,
  validateStringArray 
} from "../utils/security";

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event);

  if (!form) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid or missing form data.",
    });
  }

  let nickname = "";
  let server = "";
  let growthPower = "";
  let classes = "";
  let askingPrice = "";
  let contactLink = "";
  let contactNumber = "";
  let userId = "";
  let middlemanId = "";
  const images: string[] = [];
  let classesList: string[] = [];

  try {
    for (const field of form) {
      const value = field.data.toString("utf8");

      switch (field.name) {
        case "nickname":
          nickname = sanitizeString(value, 100);
          break;
        case "server":
          server = sanitizeString(value, 50);
          break;
        case "growthPower":
          growthPower = sanitizeString(value, 20);
          break;
        case "classes":
          classes = value;
          break;
        case "askingPrice":
          askingPrice = sanitizePrice(value);
          break;
        case "contactLink":
          if (value && value.trim()) {
            contactLink = sanitizeUrl(value) || "";
          }
          break;
        case "contactNumber":
          contactNumber = sanitizePhone(value);
          break;
        case "userId":
          userId = sanitizeString(value, 50);
          break;
        case "middlemanId":
          middlemanId = sanitizeString(value, 50);
          break;
        case "images":
          if (field.data.length) {
            const mime = field.type || "image/png";
            const base64 = field.data.toString("base64");
            const imageData = `data:${mime};base64,${base64}`;
            
            // Validate image
            validateImageData(imageData, 5); // 5MB max
            
            // Limit number of images
            if (images.length >= 5) {
              throw new Error("Maximum 5 images allowed");
            }
            
            images.push(imageData);
          }
          break;
        default:
          break;
      }
    }

    // Validate required fields
    if (!nickname || !server || !growthPower || !askingPrice || !contactNumber) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing required fields.",
      });
    }

    if (!classes) {
      throw createError({
        statusCode: 400,
        statusMessage: "Class is required.",
      });
    }

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "User ID is required.",
      });
    }

    if (!middlemanId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Middleman selection is required.",
      });
    }

    // Validate and sanitize classes list
    classesList = validateStringArray(
      classes.split(",").map((item) => item.trim()),
      10, // max 10 classes
      50  // max 50 chars per class
    );

    if (classesList.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "At least one class is required.",
      });
    }
  } catch (err: any) {
    if (err.statusCode) {
      throw err;
    }
    throw createError({
      statusCode: 400,
      statusMessage: err.message || "Invalid input data.",
    });
  }

  // Pass the event parameter here! ↓
  try {
    const listing = await addListingToDB(event, {
      userId,
      middlemanId: middlemanId, // Required, no longer optional
      nickname,
      server,
      growthPower,
      classesList,
      askingPrice,
      contactLink,
      contactNumber,
      images,
    });

    // Create notification for the user that their listing is pending review
    try {
      await createNotification(
        event,
        userId,
        listing.id,
        'pending_review',
        'Listing Submitted for Review',
        `Your listing for "${nickname}" has been submitted and is pending admin review. You'll be notified once it's approved.`
      );
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
      // Don't fail the listing creation if notification fails
    }

    return listing;
  } catch (err: any) {
    // Log the full error for debugging
    console.error('❌ Listing creation error:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
      statusCode: err.statusCode
    });
    
    // If it's a validation error from our code, return it
    if (err.statusCode) {
      throw err;
    }
    
    // Check if it's a database/foreign key error
    if (err.message && err.message.includes('foreign key')) {
      console.error('⚠️ Foreign key constraint violation - userId might not exist in users table');
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid user ID. Please log in again.",
      });
    }
    
    // Check if it's a validation error
    if (err.message && (err.message.includes('Missing required') || err.message.includes('required'))) {
      throw createError({
        statusCode: 400,
        statusMessage: err.message,
      });
    }
    
    // Don't expose internal error details to client
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create listing. Please try again.",
    });
  }
});