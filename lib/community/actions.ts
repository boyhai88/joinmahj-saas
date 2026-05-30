"use server";

import { createClient } from "@/lib/supabase/server";

export type CommunityPost = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  image_url: string | null;
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
};

export type CreateCommentInput = {
  postId: string;
  content: string;
};

export type CommunityPostListItem = CommunityPost & {
  liked_by_me: boolean;
};

export type PostDetail = {
  post: CommunityPost;
  comments: CommunityComment[];
  likedByMe: boolean;
};

export type ToggleLikeResult = {
  liked: boolean;
  likes_count: number;
};

const POST_COLUMNS =
  "id, user_id, title, content, image_url, likes_count, comments_count, created_at, updated_at";
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

  const { data, error } = await supabase
    .from("community_posts")
    .insert({
      user_id: user.id,
      title,
      content,
      image_url: input.imageUrl?.trim() || null,
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

  return posts.map((post) => ({
    ...post,
    liked_by_me: likedIds.has(post.id),
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

  return {
    post: post as CommunityPost,
    comments: (comments ?? []) as CommunityComment[],
    likedByMe,
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
