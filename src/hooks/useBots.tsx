import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface BotToken {
  id: string;
  botUsername: string | null;
  botName: string | null;
  encryptedToken: string;
  isActive: boolean;
  createdAt: Date;
}

export function useBots() {
  const { user } = useAuth();
  const [bots, setBots] = useState<BotToken[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBots = useCallback(async () => {
    if (!user) {
      setBots([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("bot_tokens")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setBots(
        data.map((bot) => ({
          id: bot.id,
          botUsername: bot.bot_username,
          botName: bot.bot_name,
          encryptedToken: bot.encrypted_token,
          isActive: bot.is_active ?? true,
          createdAt: new Date(bot.created_at!),
        }))
      );
    } catch (error: any) {
      console.error("Error fetching bots:", error);
      toast.error("Ошибка загрузки ботов");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBots();
  }, [fetchBots]);

  const addBot = async (token: string): Promise<BotToken | null> => {
    if (!user) {
      toast.error("Необходимо авторизоваться");
      return null;
    }

    try {
      // Validate token by calling Telegram API
      const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const data = await response.json();

      if (!data.ok) {
        throw new Error("Неверный токен бота");
      }

      const botInfo = data.result;
      
      // Store token (in production, encrypt before storing)
      const { data: insertedBot, error } = await supabase
        .from("bot_tokens")
        .insert({
          user_id: user.id,
          encrypted_token: token, // In production: encrypt this
          bot_name: botInfo.first_name,
          bot_username: `@${botInfo.username}`,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      const newBot: BotToken = {
        id: insertedBot.id,
        botUsername: insertedBot.bot_username,
        botName: insertedBot.bot_name,
        encryptedToken: insertedBot.encrypted_token,
        isActive: insertedBot.is_active ?? true,
        createdAt: new Date(insertedBot.created_at!),
      };

      setBots((prev) => [newBot, ...prev]);
      toast.success(`Бот ${botInfo.first_name} добавлен!`);
      return newBot;
    } catch (error: any) {
      console.error("Error adding bot:", error);
      toast.error(error.message || "Ошибка добавления бота");
      return null;
    }
  };

  const removeBot = async (id: string) => {
    try {
      const { error } = await supabase
        .from("bot_tokens")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setBots((prev) => prev.filter((b) => b.id !== id));
      toast.success("Бот удалён");
    } catch (error: any) {
      console.error("Error removing bot:", error);
      toast.error("Ошибка удаления бота");
    }
  };

  const toggleBot = async (id: string) => {
    const bot = bots.find((b) => b.id === id);
    if (!bot) return;

    try {
      const { error } = await supabase
        .from("bot_tokens")
        .update({ is_active: !bot.isActive })
        .eq("id", id);

      if (error) throw error;

      setBots((prev) =>
        prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b))
      );
    } catch (error: any) {
      console.error("Error toggling bot:", error);
      toast.error("Ошибка обновления бота");
    }
  };

  const getBotToken = (id: string): string | null => {
    const bot = bots.find((b) => b.id === id);
    return bot?.encryptedToken || null;
  };

  return {
    bots,
    loading,
    addBot,
    removeBot,
    toggleBot,
    getBotToken,
    refetch: fetchBots,
  };
}
