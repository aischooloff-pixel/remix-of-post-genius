import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
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

interface PostsContextType {
  posts: PostRecord[];
  loading: boolean;
  createPost: (data: {
    ideaText: string;
    tone?: ToneOption;
    length?: LengthOption;
    goal?: string;
    targetAudience?: string;
    systemPromptId?: string;
  }) => Promise<PostRecord | null>;
  updatePost: (
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
  ) => Promise<boolean>;
  deletePost: (id: string) => Promise<boolean>;
  refetch: () => void;
}

const STORAGE_KEY = "telegram_posts";

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export function PostsProvider({ children }: { children: ReactNode }) {
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

  const saveToStorage = useCallback((newPosts: PostRecord[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPosts));
  }, []);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const createPost = useCallback(async (data: {
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

    setPosts(prev => {
      const newPosts = [newPost, ...prev];
      saveToStorage(newPosts);
      return newPosts;
    });
    
    return newPost;
  }, [saveToStorage]);

  const updatePost = useCallback(async (
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
    setPosts(prev => {
      const newPosts = prev.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
      );
      saveToStorage(newPosts);
      return newPosts;
    });
    return true;
  }, [saveToStorage]);

  const deletePost = useCallback(async (id: string): Promise<boolean> => {
    setPosts(prev => {
      const newPosts = prev.filter((p) => p.id !== id);
      saveToStorage(newPosts);
      return newPosts;
    });
    toast.success("Пост удалён");
    return true;
  }, [saveToStorage]);

  return (
    <PostsContext.Provider value={{
      posts,
      loading,
      createPost,
      updatePost,
      deletePost,
      refetch: loadFromStorage,
    }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error("usePosts must be used within a PostsProvider");
  }
  return context;
}
