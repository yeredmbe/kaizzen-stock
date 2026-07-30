// Uses an UNSIGNED upload preset so the browser can upload directly to
// Cloudinary without exposing your API secret. Create the preset in
// Cloudinary console: Settings -> Upload -> Add upload preset -> Signing
// mode: Unsigned.

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

export type UploadedImage = { url: string; publicId: string };

export async function uploadToCloudinary(file: File): Promise<UploadedImage> {
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);
  form.append("folder", "products");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: form }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary upload failed: ${text}`);
  }

  const data = await res.json();
  return { url: data.secure_url as string, publicId: data.public_id as string };
}
