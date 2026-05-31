"use server";

import { createClient } from "@/lib/supabase/server";

const BUCKET = "community-media";

const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const VIDEO_TYPES = ["video/mp4", "video/webm"];

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100MB

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

export type CommunityMediaType = "image" | "video";

export type CommunityMediaResult = {
  publicUrl: string;
  mediaType: CommunityMediaType;
};

export async function uploadCommunityMedia(
  formData: FormData
): Promise<CommunityMediaResult> {
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new Error("No file provided.");
  }

  const isImage = IMAGE_TYPES.includes(file.type);
  const isVideo = VIDEO_TYPES.includes(file.type);

  if (!isImage && !isVideo) {
    throw new Error("Only JPG, PNG, WebP images or MP4, WebM videos are allowed.");
  }

  if (isImage && file.size > MAX_IMAGE_BYTES) {
    throw new Error("Images must be 10MB or smaller.");
  }
  if (isVideo && file.size > MAX_VIDEO_BYTES) {
    throw new Error("Videos must be 100MB or smaller.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated.");
  }

  const ext = EXT_BY_TYPE[file.type] ?? "bin";
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return {
    publicUrl: data.publicUrl,
    mediaType: isVideo ? "video" : "image",
  };
}
