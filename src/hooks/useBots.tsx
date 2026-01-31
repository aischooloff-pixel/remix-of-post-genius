import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export interface BotToken {
  id: string;
  botUsername: string | null;
  botName: string | null;
  token: string;
  isActive: boolean;
  createdAt: Date;
}

const STORAGE_KEY = "telegram_bots";

export function useBots() {
  const [bots, setBots] = useState<BotToken[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setBots(parsed.map((bot: any) => ({
          ...bot,
          createdAt: new Date(bot.createdAt),
        })));
      }
    } catch (error) {
      console.error("Error loading bots:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveToStorage = (newBots: BotToken[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newBots));
  };

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const addBot = async (token: string): Promise<BotToken | null> => {
    try {
      // Validate token by calling Telegram API
      const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const data = await response.json();

      if (!data.ok) {
        throw new Error("Неверный токен бота");
      }

      const botInfo = data.result;
      
      const newBot: BotToken = {
        id: crypto.randomUUID(),
        botUsername: `@${botInfo.username}`,
        botName: botInfo.first_name,
        token: token,
        isActive: true,
        createdAt: new Date(),
      };

      const newBots = [newBot, ...bots];
      setBots(newBots);
      saveToStorage(newBots);
      
      toast.success(`Бот ${botInfo.first_name} добавлен!`);
      return newBot;
    } catch (error: any) {
      console.error("Error adding bot:", error);
      toast.error(error.message || "Ошибка добавления бота");
      return null;
    }
  };

  const removeBot = async (id: string) => {
    const newBots = bots.filter((b) => b.id !== id);
    setBots(newBots);
    saveToStorage(newBots);
    toast.success("Бот удалён");
  };

  const toggleBot = async (id: string) => {
    const newBots = bots.map((b) =>
      b.id === id ? { ...b, isActive: !b.isActive } : b
    );
    setBots(newBots);
    saveToStorage(newBots);
  };

  const getBotToken = (id: string): string | null => {
    const bot = bots.find((b) => b.id === id);
    return bot?.token || null;
  };

  return {
    bots,
    loading,
    addBot,
    removeBot,
    toggleBot,
    getBotToken,
    refetch: loadFromStorage,
  };
}
