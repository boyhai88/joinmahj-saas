"use server";

import { createClient } from "@/lib/supabase/server";

const BUCKET = "mahjong-hands";
const ACCEPTED = ["image/jpeg", "image/jpg", "image/png"];
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

export type UploadResult = {
  path: string;
  publicUrl: string;
};

export async function uploadHandImage(
  formData: FormData
): Promise<UploadResult> {
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new Error("No image provided.");
  }
  if (!ACCEPTED.includes(file.type)) {
    throw new Error("Only JPG and PNG images are allowed.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 10MB or smaller.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated.");
  }

  const ext = file.type === "image/png" ? "png" : "jpg";
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { path, publicUrl: data.publicUrl };
}
