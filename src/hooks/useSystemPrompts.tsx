import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface SystemPrompt {
  id: string;
  name: string;
  promptText: string;
  isDefault: boolean;
  isPublic: boolean;
  createdAt: Date;
}

const DEFAULT_PROMPT_TEXT = `Ты — профессиональный автор постов для Telegram. Задача: по идее/бриффу сгенерировать 3 варианта поста:
1) Короткий крючок (hook) + практический совет, 1–3 предложения.
2) Развёрнутый гайд — 4–8 предложений, структурированные абзацы.
3) Продающий вариант с мягким CTA в конце (1–2 фразы).

Тон: {tone}
Длина: {length}
Цель: {goal}
Целевая аудитория: {target_audience}

Ограничения: максимум 3 эмодзи; результат должен быть совместим с MarkdownV2. Не придумывай фактов.`;

export function useSystemPrompts() {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrompts = useCallback(async () => {
    if (!user) {
      setPrompts([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("system_prompts")
        .select("*")
        .or(`user_id.eq.${user.id},is_public.eq.true`)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data.length === 0) {
        // Create default prompt for new users
        const { data: newPrompt, error: createError } = await supabase
          .from("system_prompts")
          .insert({
            user_id: user.id,
            name: "Стандартный промпт",
            prompt_text: DEFAULT_PROMPT_TEXT,
            is_default: true,
            is_public: false,
          })
          .select()
          .single();

        if (createError) throw createError;

        setPrompts([
          {
            id: newPrompt.id,
            name: newPrompt.name,
            promptText: newPrompt.prompt_text,
            isDefault: newPrompt.is_default ?? false,
            isPublic: newPrompt.is_public ?? false,
            createdAt: new Date(newPrompt.created_at!),
          },
        ]);
      } else {
        setPrompts(
          data.map((prompt) => ({
            id: prompt.id,
            name: prompt.name,
            promptText: prompt.prompt_text,
            isDefault: prompt.is_default ?? false,
            isPublic: prompt.is_public ?? false,
            createdAt: new Date(prompt.created_at!),
          }))
        );
      }
    } catch (error: any) {
      console.error("Error fetching prompts:", error);
      toast.error("Ошибка загрузки промптов");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const addPrompt = async (name: string, promptText: string): Promise<SystemPrompt | null> => {
    if (!user) {
      toast.error("Необходимо авторизоваться");
      return null;
    }

    try {
      const { data: insertedPrompt, error } = await supabase
        .from("system_prompts")
        .insert({
          user_id: user.id,
          name,
          prompt_text: promptText,
          is_default: false,
          is_public: false,
        })
        .select()
        .single();

      if (error) throw error;

      const newPrompt: SystemPrompt = {
        id: insertedPrompt.id,
        name: insertedPrompt.name,
        promptText: insertedPrompt.prompt_text,
        isDefault: insertedPrompt.is_default ?? false,
        isPublic: insertedPrompt.is_public ?? false,
        createdAt: new Date(insertedPrompt.created_at!),
      };

      setPrompts((prev) => [...prev, newPrompt]);
      toast.success("Промпт создан!");
      return newPrompt;
    } catch (error: any) {
      console.error("Error adding prompt:", error);
      toast.error("Ошибка создания промпта");
      return null;
    }
  };

  const updatePrompt = async (
    id: string,
    updates: { name?: string; promptText?: string }
  ): Promise<boolean> => {
    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.promptText) dbUpdates.prompt_text = updates.promptText;

      const { error } = await supabase
        .from("system_prompts")
        .update(dbUpdates)
        .eq("id", id);

      if (error) throw error;

      setPrompts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
      toast.success("Промпт обновлён!");
      return true;
    } catch (error: any) {
      console.error("Error updating prompt:", error);
      toast.error("Ошибка обновления промпта");
      return false;
    }
  };

  const deletePrompt = async (id: string): Promise<boolean> => {
    const prompt = prompts.find((p) => p.id === id);
    if (prompt?.isDefault) {
      toast.error("Нельзя удалить промпт по умолчанию");
      return false;
    }

    try {
      const { error } = await supabase.from("system_prompts").delete().eq("id", id);

      if (error) throw error;

      setPrompts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Промпт удалён");
      return true;
    } catch (error: any) {
      console.error("Error deleting prompt:", error);
      toast.error("Ошибка удаления промпта");
      return false;
    }
  };

  const setDefaultPrompt = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // First, unset all defaults for this user
      await supabase
        .from("system_prompts")
        .update({ is_default: false })
        .eq("user_id", user.id);

      // Then set the new default
      const { error } = await supabase
        .from("system_prompts")
        .update({ is_default: true })
        .eq("id", id);

      if (error) throw error;

      setPrompts((prev) =>
        prev.map((p) => ({ ...p, isDefault: p.id === id }))
      );
      toast.success("Промпт установлен по умолчанию");
      return true;
    } catch (error: any) {
      console.error("Error setting default prompt:", error);
      toast.error("Ошибка установки промпта по умолчанию");
      return false;
    }
  };

  const duplicatePrompt = async (prompt: SystemPrompt): Promise<SystemPrompt | null> => {
    return addPrompt(`${prompt.name} (копия)`, prompt.promptText);
  };

  const getDefaultPrompt = (): SystemPrompt | undefined => {
    return prompts.find((p) => p.isDefault) || prompts[0];
  };

  return {
    prompts,
    loading,
    addPrompt,
    updatePrompt,
    deletePrompt,
    setDefaultPrompt,
    duplicatePrompt,
    getDefaultPrompt,
    refetch: fetchPrompts,
  };
}
