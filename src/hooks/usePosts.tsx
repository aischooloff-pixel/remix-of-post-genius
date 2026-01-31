import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { PostStatus, PostVariant, PostMedia, InlineButton, ToneOption, LengthOption } from "@/types/post";

export interface PostRecord {
  id: string;
  ideaText: string;
  tone: ToneOption | null;
  length: LengthOption | null;
  goal: string | null;
  targetAudience: string | null;
  variants: PostVariant[];
  chosenVariantId: string | null;
  editedTextMarkdown: string | null;
  editedTextHtml: string | null;
  media: PostMedia[];
  buttons: InlineButton[];
  channelId: string | null;
  botTokenId: string | null;
  systemPromptId: string | null;
  scheduleDatetime: Date | null;
  timezone: string | null;
  status: PostStatus;
  telegramMessageId: number | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
  sentAt: Date | null;
}

const STORAGE_KEY = "telegram_posts";

export function usePosts() {
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPosts(parsed.map((post: any) => ({
          ...post,
          createdAt: new Date(post.createdAt),
          updatedAt: new Date(post.updatedAt),
          scheduleDatetime: post.scheduleDatetime ? new Date(post.scheduleDatetime) : null,
          sentAt: post.sentAt ? new Date(post.sentAt) : null,
        })));
      }
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveToStorage = (newPosts: PostRecord[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPosts));
  };

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const createPost = async (data: {
    ideaText: string;
    tone?: ToneOption;
    length?: LengthOption;
    goal?: string;
    targetAudience?: string;
    systemPromptId?: string;
  }): Promise<PostRecord | null> => {
    const newPost: PostRecord = {
      id: crypto.randomUUID(),
      ideaText: data.ideaText,
      tone: data.tone || null,
      length: data.length || null,
      goal: data.goal || null,
      targetAudience: data.targetAudience || null,
      variants: [],
      chosenVariantId: null,
      editedTextMarkdown: null,
      editedTextHtml: null,
      media: [],
      buttons: [],
      channelId: null,
      botTokenId: null,
      systemPromptId: data.systemPromptId || null,
      scheduleDatetime: null,
      timezone: null,
      status: "draft",
      telegramMessageId: null,
      errorMessage: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      sentAt: null,
    };

    const newPosts = [newPost, ...posts];
    setPosts(newPosts);
    saveToStorage(newPosts);
    
    return newPost;
  };

  const updatePost = async (
    id: string,
    updates: Partial<{
      variants: PostVariant[];
      chosenVariantId: string;
      editedTextMarkdown: string;
      editedTextHtml: string;
      media: PostMedia[];
      buttons: InlineButton[];
      channelId: string;
      botTokenId: string;
      scheduleDatetime: Date;
      status: PostStatus;
      telegramMessageId: number;
      errorMessage: string;
      sentAt: Date;
    }>
  ): Promise<boolean> => {
    const newPosts = posts.map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
    );
    setPosts(newPosts);
    saveToStorage(newPosts);
    return true;
  };

  const deletePost = async (id: string): Promise<boolean> => {
    const newPosts = posts.filter((p) => p.id !== id);
    setPosts(newPosts);
    saveToStorage(newPosts);
    toast.success("Пост удалён");
    return true;
  };

  return {
    posts,
    loading,
    createPost,
    updatePost,
    deletePost,
    refetch: loadFromStorage,
  };
}
