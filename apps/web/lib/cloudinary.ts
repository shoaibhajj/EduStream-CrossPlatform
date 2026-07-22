import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function generateSignedUrl(
  publicId: string,
  expiresInSeconds = 3600
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  try {
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const url = cloudinary.url(publicId, {
      resource_type: "video",
      sign_url: true,
      expires_at: expiresAt,
      type: "authenticated"
    });
    return { success: true, url };
  } catch (error) {
    console.error("[lib/cloudinary]", error);
    return { success: false, error: "Failed to generate signed URL" };
  }
}
