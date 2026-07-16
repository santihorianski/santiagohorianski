import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const endpoint = import.meta.env.VITE_R2_ENDPOINT;
const accessKeyId = import.meta.env.VITE_R2_ACCESS_KEY_ID;
const secretAccessKey = import.meta.env.VITE_R2_SECRET_ACCESS_KEY;
const bucketName = import.meta.env.VITE_R2_BUCKET_NAME;
const publicUrl = import.meta.env.VITE_R2_PUBLIC_URL;

export const isR2Configured = !!(
  endpoint && 
  accessKeyId && 
  secretAccessKey && 
  bucketName && 
  publicUrl
);

let s3 = null;
if (isR2Configured) {
  s3 = new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });
}

/**
 * Uploads a file (photo or PDF) to Cloudflare R2 bucket.
 * @param {File} file - The file object from browser input.
 * @returns {Promise<{name: string, preview: string, type: string} | null>}
 */
export const uploadFileToR2 = async (file) => {
  if (!isR2Configured || !s3) {
    console.warn("Cloudflare R2 is not configured. Falling back to local storage.");
    return null;
  }

  try {
    const fileExtension = file.name.split('.').pop();
    const uniqueKey = `evidence-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}.${fileExtension}`;
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: uniqueKey,
      Body: buffer,
      ContentType: file.type || "application/octet-stream"
    });

    await s3.send(command);

    // Build the public URL
    const cleanedPublicUrl = publicUrl.endsWith('/') ? publicUrl.slice(0, -1) : publicUrl;
    const finalUrl = `${cleanedPublicUrl}/${uniqueKey}`;

    return {
      name: file.name,
      preview: finalUrl,
      type: file.type
    };
  } catch (error) {
    console.error("Error uploading file to Cloudflare R2:", error);
    return null;
  }
};
