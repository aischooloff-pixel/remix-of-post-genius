import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Channel {
  id: string;
  channelId: string;
  channelTitle: string | null;
  channelUsername: string | null;
  botTokenId: string | null;
  isActive: boolean;
  createdAt: Date;
}

export function useChannels() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChannels = useCallback(async () => {
    if (!user) {
      setChannels([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setChannels(
        data.map((channel) => ({
          id: channel.id,
          channelId: channel.channel_id,
          channelTitle: channel.channel_title,
          channelUsername: channel.channel_username,
          botTokenId: channel.bot_token_id,
          isActive: channel.is_active ?? true,
          createdAt: new Date(channel.created_at!),
        }))
      );
    } catch (error: any) {
      console.error("Error fetching channels:", error);
      toast.error("Ошибка загрузки каналов");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const addChannel = async (
    botToken: string,
    botTokenId: string,
    channelIdOrUsername: string
  ): Promise<Channel | null> => {
    if (!user) {
      toast.error("Необходимо авторизоваться");
      return null;
    }

    try {
      // Validate channel by calling Telegram API
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/getChat?chat_id=${encodeURIComponent(channelIdOrUsername)}`
      );
      const data = await response.json();

      if (!data.ok) {
        throw new Error(
          data.description || "Не удалось получить информацию о канале"
        );
      }

      const chatInfo = data.result;

      const { data: insertedChannel, error } = await supabase
        .from("channels")
        .insert({
          user_id: user.id,
          channel_id: String(chatInfo.id),
          channel_title: chatInfo.title,
          channel_username: chatInfo.username ? `@${chatInfo.username}` : null,
          bot_token_id: botTokenId,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      const newChannel: Channel = {
        id: insertedChannel.id,
        channelId: insertedChannel.channel_id,
        channelTitle: insertedChannel.channel_title,
        channelUsername: insertedChannel.channel_username,
        botTokenId: insertedChannel.bot_token_id,
        isActive: insertedChannel.is_active ?? true,
        createdAt: new Date(insertedChannel.created_at!),
      };

      setChannels((prev) => [newChannel, ...prev]);
      toast.success(`Канал ${chatInfo.title} добавлен!`);
      return newChannel;
    } catch (error: any) {
      console.error("Error adding channel:", error);
      toast.error(error.message || "Ошибка добавления канала");
      return null;
    }
  };

  const removeChannel = async (id: string) => {
    try {
      const { error } = await supabase.from("channels").delete().eq("id", id);

      if (error) throw error;

      setChannels((prev) => prev.filter((c) => c.id !== id));
      toast.success("Канал удалён");
    } catch (error: any) {
      console.error("Error removing channel:", error);
      toast.error("Ошибка удаления канала");
    }
  };

  const toggleChannel = async (id: string) => {
    const channel = channels.find((c) => c.id === id);
    if (!channel) return;

    try {
      const { error } = await supabase
        .from("channels")
        .update({ is_active: !channel.isActive })
        .eq("id", id);

      if (error) throw error;

      setChannels((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
      );
    } catch (error: any) {
      console.error("Error toggling channel:", error);
      toast.error("Ошибка обновления канала");
    }
  };

  return {
    channels,
    loading,
    addChannel,
    removeChannel,
    toggleChannel,
    refetch: fetchChannels,
  };
}
