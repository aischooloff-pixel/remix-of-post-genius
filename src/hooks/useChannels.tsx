import { useState, useEffect, useCallback } from "react";
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

const STORAGE_KEY = "telegram_channels";

export function useChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setChannels(parsed.map((channel: any) => ({
          ...channel,
          createdAt: new Date(channel.createdAt),
        })));
      }
    } catch (error) {
      console.error("Error loading channels:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveToStorage = (newChannels: Channel[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newChannels));
  };

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const addChannel = async (
    botToken: string,
    botTokenId: string,
    channelIdOrUsername: string
  ): Promise<Channel | null> => {
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

      const newChannel: Channel = {
        id: crypto.randomUUID(),
        channelId: String(chatInfo.id),
        channelTitle: chatInfo.title,
        channelUsername: chatInfo.username ? `@${chatInfo.username}` : null,
        botTokenId: botTokenId,
        isActive: true,
        createdAt: new Date(),
      };

      const newChannels = [newChannel, ...channels];
      setChannels(newChannels);
      saveToStorage(newChannels);
      
      toast.success(`Канал ${chatInfo.title} добавлен!`);
      return newChannel;
    } catch (error: any) {
      console.error("Error adding channel:", error);
      toast.error(error.message || "Ошибка добавления канала");
      return null;
    }
  };

  const removeChannel = async (id: string) => {
    const newChannels = channels.filter((c) => c.id !== id);
    setChannels(newChannels);
    saveToStorage(newChannels);
    toast.success("Канал удалён");
  };

  const toggleChannel = async (id: string) => {
    const newChannels = channels.map((c) =>
      c.id === id ? { ...c, isActive: !c.isActive } : c
    );
    setChannels(newChannels);
    saveToStorage(newChannels);
  };

  return {
    channels,
    loading,
    addChannel,
    removeChannel,
    toggleChannel,
    refetch: loadFromStorage,
  };
}
