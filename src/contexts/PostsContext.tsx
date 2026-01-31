import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
  deletePost: (id: string, botToken?: string) => Promise<boolean>;
  refetch: () => void;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

// Helper to get user ID (anonymous for now)
const getOrCreateUserId = (): string => {
  const key = "telegram_user_id";
  let userId = localStorage.getItem(key);
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem(key, userId);
  }
  return userId;
};

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const userId = getOrCreateUserId();
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mappedPosts: PostRecord[] = (data || []).map((row) => ({
        id: row.id,
        ideaText: row.idea_text,
        tone: row.tone as ToneOption | null,
        length: row.length as LengthOption | null,
        goal: row.goal,
        targetAudience: row.target_audience,
        variants: (row.variants as unknown as PostVariant[]) || [],
        chosenVariantId: row.chosen_variant_id,
        editedTextMarkdown: row.edited_text_markdown,
        editedTextHtml: row.edited_text_html,
        media: (row.media as unknown as PostMedia[]) || [],
        buttons: (row.buttons as unknown as InlineButton[]) || [],
        channelId: row.channel_id,
        botTokenId: row.bot_token_id,
        systemPromptId: row.system_prompt_id,
        scheduleDatetime: row.schedule_datetime ? new Date(row.schedule_datetime) : null,
        timezone: row.timezone,
        status: row.status as PostStatus,
        telegramMessageId: row.telegram_message_id,
        errorMessage: row.error_message,
        createdAt: new Date(row.created_at!),
        updatedAt: new Date(row.updated_at!),
        sentAt: row.sent_at ? new Date(row.sent_at) : null,
      }));

      setPosts(mappedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Ошибка загрузки постов");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const createPost = useCallback(async (data: {
    ideaText: string;
    tone?: ToneOption;
    length?: LengthOption;
    goal?: string;
    targetAudience?: string;
    systemPromptId?: string;
  }): Promise<PostRecord | null> => {
    try {
      const userId = getOrCreateUserId();
      
      const { data: row, error } = await supabase
        .from("posts")
        .insert({
          user_id: userId,
          idea_text: data.ideaText,
          tone: data.tone || null,
          length: data.length || null,
          goal: data.goal || null,
          target_audience: data.targetAudience || null,
          system_prompt_id: data.systemPromptId || null,
          status: "draft",
        })
        .select()
        .single();

      if (error) throw error;

      const newPost: PostRecord = {
        id: row.id,
        ideaText: row.idea_text,
        tone: row.tone as ToneOption | null,
        length: row.length as LengthOption | null,
        goal: row.goal,
        targetAudience: row.target_audience,
        variants: [],
        chosenVariantId: null,
        editedTextMarkdown: null,
        editedTextHtml: null,
        media: [],
        buttons: [],
        channelId: null,
        botTokenId: null,
        systemPromptId: row.system_prompt_id,
        scheduleDatetime: null,
        timezone: null,
        status: "draft",
        telegramMessageId: null,
        errorMessage: null,
        createdAt: new Date(row.created_at!),
        updatedAt: new Date(row.updated_at!),
        sentAt: null,
      };

      setPosts(prev => [newPost, ...prev]);
      return newPost;
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Ошибка создания поста");
      return null;
    }
  }, []);

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
    try {
      // Convert camelCase to snake_case for database
      const dbUpdates: Record<string, unknown> = {};
      
      if (updates.variants !== undefined) dbUpdates.variants = updates.variants;
      if (updates.chosenVariantId !== undefined) dbUpdates.chosen_variant_id = updates.chosenVariantId;
      if (updates.editedTextMarkdown !== undefined) dbUpdates.edited_text_markdown = updates.editedTextMarkdown;
      if (updates.editedTextHtml !== undefined) dbUpdates.edited_text_html = updates.editedTextHtml;
      if (updates.media !== undefined) dbUpdates.media = updates.media;
      if (updates.buttons !== undefined) dbUpdates.buttons = updates.buttons;
      if (updates.channelId !== undefined) dbUpdates.channel_id = updates.channelId;
      if (updates.botTokenId !== undefined) dbUpdates.bot_token_id = updates.botTokenId;
      if (updates.scheduleDatetime !== undefined) dbUpdates.schedule_datetime = updates.scheduleDatetime?.toISOString();
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.telegramMessageId !== undefined) dbUpdates.telegram_message_id = updates.telegramMessageId;
      if (updates.errorMessage !== undefined) dbUpdates.error_message = updates.errorMessage;
      if (updates.sentAt !== undefined) dbUpdates.sent_at = updates.sentAt?.toISOString();
      
      dbUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from("posts")
        .update(dbUpdates)
        .eq("id", id);

      if (error) throw error;

      setPosts(prev => prev.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
      ));
      
      return true;
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Ошибка обновления поста");
      return false;
    }
  }, []);

  const deletePost = useCallback(async (id: string, botToken?: string): Promise<boolean> => {
    try {
      // Find the post to check if we need to delete from Telegram
      const post = posts.find(p => p.id === id);
      
      // If post was sent to Telegram, try to delete it there first
      if (post?.status === "sent" && post.telegramMessageId && post.channelId) {
        // Get channel info to find the chat ID
        const { data: channel } = await supabase
          .from("channels")
          .select("channel_id, bot_token_id")
          .eq("id", post.channelId)
          .single();
        
        if (channel && botToken) {
          try {
            const { data, error } = await supabase.functions.invoke('delete-telegram-message', {
              body: {
                botToken,
                chatId: channel.channel_id,
                messageId: post.telegramMessageId,
              },
            });
            
            if (error) {
              console.error("Error deleting from Telegram:", error);
            } else if (data?.success) {
              console.log("Message deleted from Telegram");
            } else if (data?.telegramError) {
              // Message might be already deleted or too old - continue with local deletion
              console.warn("Telegram deletion warning:", data.error);
            }
          } catch (telegramError) {
            console.error("Failed to delete from Telegram:", telegramError);
            // Continue with local deletion even if Telegram deletion fails
          }
        }
      }

      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setPosts(prev => prev.filter((p) => p.id !== id));
      toast.success("Пост удалён");
      return true;
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Ошибка удаления поста");
      return false;
    }
  }, [posts]);

  return (
    <PostsContext.Provider value={{
      posts,
      loading,
      createPost,
      updatePost,
      deletePost,
      refetch: fetchPosts,
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
