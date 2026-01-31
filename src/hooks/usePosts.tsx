import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
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

export function usePosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    if (!user) {
      setPosts([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPosts(
        data.map((post) => ({
          id: post.id,
          ideaText: post.idea_text,
          tone: post.tone as ToneOption | null,
          length: post.length as LengthOption | null,
          goal: post.goal,
          targetAudience: post.target_audience,
          variants: (post.variants as unknown as PostVariant[]) || [],
          chosenVariantId: post.chosen_variant_id,
          editedTextMarkdown: post.edited_text_markdown,
          editedTextHtml: post.edited_text_html,
          media: (post.media as unknown as PostMedia[]) || [],
          buttons: (post.buttons as unknown as InlineButton[]) || [],
          channelId: post.channel_id,
          botTokenId: post.bot_token_id,
          systemPromptId: post.system_prompt_id,
          scheduleDatetime: post.schedule_datetime ? new Date(post.schedule_datetime) : null,
          timezone: post.timezone,
          status: post.status as PostStatus,
          telegramMessageId: post.telegram_message_id,
          errorMessage: post.error_message,
          createdAt: new Date(post.created_at!),
          updatedAt: new Date(post.updated_at!),
          sentAt: post.sent_at ? new Date(post.sent_at) : null,
        }))
      );
    } catch (error: any) {
      console.error("Error fetching posts:", error);
      toast.error("Ошибка загрузки постов");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const createPost = async (data: {
    ideaText: string;
    tone?: ToneOption;
    length?: LengthOption;
    goal?: string;
    targetAudience?: string;
    systemPromptId?: string;
  }): Promise<PostRecord | null> => {
    if (!user) {
      toast.error("Необходимо авторизоваться");
      return null;
    }

    try {
      const { data: insertedPost, error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          idea_text: data.ideaText,
          tone: data.tone,
          length: data.length,
          goal: data.goal,
          target_audience: data.targetAudience,
          system_prompt_id: data.systemPromptId,
          status: "draft",
        })
        .select()
        .single();

      if (error) throw error;

      const newPost: PostRecord = {
        id: insertedPost.id,
        ideaText: insertedPost.idea_text,
        tone: insertedPost.tone as ToneOption | null,
        length: insertedPost.length as LengthOption | null,
        goal: insertedPost.goal,
        targetAudience: insertedPost.target_audience,
        variants: [],
        chosenVariantId: null,
        editedTextMarkdown: null,
        editedTextHtml: null,
        media: [],
        buttons: [],
        channelId: null,
        botTokenId: null,
        systemPromptId: insertedPost.system_prompt_id,
        scheduleDatetime: null,
        timezone: insertedPost.timezone,
        status: "draft",
        telegramMessageId: null,
        errorMessage: null,
        createdAt: new Date(insertedPost.created_at!),
        updatedAt: new Date(insertedPost.updated_at!),
        sentAt: null,
      };

      setPosts((prev) => [newPost, ...prev]);
      return newPost;
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast.error("Ошибка создания поста");
      return null;
    }
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
    try {
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

      const { error } = await supabase
        .from("posts")
        .update(dbUpdates)
        .eq("id", id);

      if (error) throw error;

      setPosts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
        )
      );
      return true;
    } catch (error: any) {
      console.error("Error updating post:", error);
      toast.error("Ошибка обновления поста");
      return false;
    }
  };

  const deletePost = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from("posts").delete().eq("id", id);

      if (error) throw error;

      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Пост удалён");
      return true;
    } catch (error: any) {
      console.error("Error deleting post:", error);
      toast.error("Ошибка удаления поста");
      return false;
    }
  };

  return {
    posts,
    loading,
    createPost,
    updatePost,
    deletePost,
    refetch: fetchPosts,
  };
}
