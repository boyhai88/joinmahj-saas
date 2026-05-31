"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type CommunityMediaType = "text" | "image" | "video";

export type PostAuthor = {
  full_name: string | null;
  avatar_url: string | null;
};

export type CommunityPost = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  image_url: string | null;
  media_url: string | null;
  media_type: CommunityMediaType | null;
  tags: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
};

export type CommunityComment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type CommunityLike = {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
};

export type CreatePostInput = {
  title: string;
  content: string;
  imageUrl?: string;
  mediaUrl?: string;
  mediaType?: CommunityMediaType;
  tags?: string[];
};

const ALLOWED_TAGS = [
  "Beginner",
  "Strategy",
  "Hand Review",
  "Winning Story",
  "Club",
  "Question",
];

function sanitizeTags(tags?: string[]): string[] {
  if (!Array.isArray(tags)) return [];
  const unique = Array.from(
    new Set(tags.filter((tag) => ALLOWED_TAGS.includes(tag)))
  );
  return unique.slice(0, 3);
}

export type CreateCommentInput = {
  postId: string;
  content: string;
};

export type CommunityPostListItem = CommunityPost & {
  liked_by_me: boolean;
  author: PostAuthor | null;
};

export type PostDetail = {
  post: CommunityPost;
  comments: CommunityComment[];
  likedByMe: boolean;
  author: PostAuthor | null;
};

export type CommunityStats = {
  posts: number;
  photos: number;
  videos: number;
  members: number;
};

// Best-effort author lookup via the service-role client (profiles are
// owner-only under RLS). Only name + avatar are ever returned to the client.
// Falls back to an empty map if the service role is not configured.
async function fetchAuthors(
  userIds: string[]
): Promise<Map<string, PostAuthor>> {
  const map = new Map<string, PostAuthor>();
  const unique = Array.from(new Set(userIds));
  if (unique.length === 0) return map;

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", unique);

    for (const row of data ?? []) {
      map.set(row.id as string, {
        full_name: (row.full_name as string | null) ?? null,
        avatar_url: (row.avatar_url as string | null) ?? null,
      });
    }
  } catch {
    // Service role not configured — author info is optional, fall back to null.
  }

  return map;
}

export type ToggleLikeResult = {
  liked: boolean;
  likes_count: number;
};

const POST_COLUMNS =
  "id, user_id, title, content, image_url, media_url, media_type, tags, likes_count, comments_count, created_at, updated_at";
const COMMENT_COLUMNS =
  "id, post_id, user_id, content, created_at, updated_at";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated.");
  }

  return { supabase, user };
}

export async function createPost(
  input: CreatePostInput
): Promise<CommunityPost> {
  const { supabase, user } = await requireUser();

  const title = input.title.trim();
  const content = input.content.trim();
  if (!title || !content) {
    throw new Error("Title and content are required.");
  }

  const mediaUrl = input.mediaUrl?.trim() || null;
  // Keep image_url populated for image posts so legacy readers still work.
  const imageUrl =
    input.imageUrl?.trim() ||
    (input.mediaType === "image" ? mediaUrl : null) ||
    null;
  const mediaType: CommunityMediaType =
    input.mediaType ?? (mediaUrl ? "image" : "text");

  const { data, error } = await supabase
    .from("community_posts")
    .insert({
      user_id: user.id,
      title,
      content,
      image_url: imageUrl,
      media_url: mediaUrl,
      media_type: mediaType,
      tags: sanitizeTags(input.tags),
    })
    .select(POST_COLUMNS)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create post.");
  }

  return data as CommunityPost;
}

export async function getPosts(): Promise<CommunityPostListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("community_posts")
    .select(POST_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const posts = (data ?? []) as CommunityPost[];

  // Mark which posts the current user has liked (for filled hearts).
  let likedIds = new Set<string>();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && posts.length > 0) {
    const { data: likes } = await supabase
      .from("community_likes")
      .select("post_id")
      .eq("user_id", user.id);
    likedIds = new Set((likes ?? []).map((row) => row.post_id as string));
  }

  const authors = await fetchAuthors(posts.map((post) => post.user_id));

  return posts.map((post) => ({
    ...post,
    liked_by_me: likedIds.has(post.id),
    author: authors.get(post.user_id) ?? null,
  }));
}

export async function getCommunityStats(): Promise<CommunityStats> {
  const supabase = await createClient();

  const [postsRes, photosRes, videosRes] = await Promise.all([
    supabase
      .from("community_posts")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("community_posts")
      .select("id", { count: "exact", head: true })
      .eq("media_type", "image"),
    supabase
      .from("community_posts")
      .select("id", { count: "exact", head: true })
      .eq("media_type", "video"),
  ]);

  let members = 0;
  try {
    const admin = createAdminClient();
    const { count } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true });
    members = count ?? 0;
  } catch {
    // Service role not configured — members count falls back to 0.
  }

  return {
    posts: postsRes.count ?? 0,
    photos: photosRes.count ?? 0,
    videos: videosRes.count ?? 0,
    members,
  };
}

export async function getRelatedPosts(
  postId: string,
  tags: string[],
  limit = 4
): Promise<CommunityPostListItem[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("community_posts")
    .select(POST_COLUMNS)
    .neq("id", postId)
    .order("created_at", { ascending: false })
    .limit(24);

  const posts = (data ?? []) as CommunityPost[];

  // Same-tag posts first, then fill with the most recent others.
  const sameTag = posts.filter((post) =>
    (post.tags ?? []).some((tag) => tags.includes(tag))
  );
  const sameTagIds = new Set(sameTag.map((post) => post.id));
  const others = posts.filter((post) => !sameTagIds.has(post.id));
  const chosen = [...sameTag, ...others].slice(0, limit);

  const authors = await fetchAuthors(chosen.map((post) => post.user_id));

  return chosen.map((post) => ({
    ...post,
    liked_by_me: false,
    author: authors.get(post.user_id) ?? null,
  }));
}

export async function getPost(id: string): Promise<PostDetail | null> {
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("community_posts")
    .select(POST_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!post) {
    return null;
  }

  const { data: comments } = await supabase
    .from("community_comments")
    .select(COMMENT_COLUMNS)
    .eq("post_id", id)
    .order("created_at", { ascending: true });

  let likedByMe = false;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: like } = await supabase
      .from("community_likes")
      .select("id")
      .eq("post_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    likedByMe = Boolean(like);
  }

  const authors = await fetchAuthors([(post as CommunityPost).user_id]);

  return {
    post: post as CommunityPost,
    comments: (comments ?? []) as CommunityComment[],
    likedByMe,
    author: authors.get((post as CommunityPost).user_id) ?? null,
  };
}

export async function createComment(
  input: CreateCommentInput
): Promise<CommunityComment> {
  const { supabase, user } = await requireUser();

  const content = input.content.trim();
  if (!content) {
    throw new Error("Comment cannot be empty.");
  }

  const { data, error } = await supabase
    .from("community_comments")
    .insert({ post_id: input.postId, user_id: user.id, content })
    .select(COMMENT_COLUMNS)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create comment.");
  }

  return data as CommunityComment;
}

export async function toggleLike(postId: string): Promise<ToggleLikeResult> {
  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase
    .from("community_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("community_likes")
      .delete()
      .eq("id", existing.id);
    if (error) {
      throw new Error(error.message);
    }
  } else {
    const { error } = await supabase
      .from("community_likes")
      .insert({ post_id: postId, user_id: user.id });
    if (error) {
      throw new Error(error.message);
    }
  }

  // Read the updated (trigger-maintained) count.
  const { data: post } = await supabase
    .from("community_posts")
    .select("likes_count")
    .eq("id", postId)
    .maybeSingle();

  return {
    liked: !existing,
    likes_count: post?.likes_count ?? 0,
  };
}
